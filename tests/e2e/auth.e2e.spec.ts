/**
 * Tests End-to-End: flujos de autenticación.
 *
 * La app corre en Expo Web (expo start --web → localhost:8081).
 * Las llamadas a la API REST se interceptan con page.route() para
 * simular respuestas del backend sin necesidad de una BD real.
 *
 * Para ejecutar:
 *   1. expo start --web (en /frontend)
 *   2. npx playwright test e2e/auth.e2e.spec.ts
 */

import { test, expect, Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers de mocking de API
// ---------------------------------------------------------------------------

async function mockAuthAPI(page: Page) {
  // POST /auth/register → 201 con email pendiente de verificación
  await page.route('**/auth/register', (route) => {
    route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: { message: 'Código de verificación enviado' },
        message: 'Registro iniciado',
        error: null,
      }),
    });
  });

  // POST /auth/verify-email → 200 OK
  await page.route('**/auth/verify-email', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {},
        message: 'Email verificado',
        error: null,
      }),
    });
  });

  // POST /auth/set-password → 200 con token JWT
  await page.route('**/auth/set-password', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          token: 'mock.jwt.token',
          user: { id: 'u1', email: 'test@healthy.app', name: 'Test User' },
        },
        message: 'Contraseña establecida',
        error: null,
      }),
    });
  });

  // POST /auth/login → 200 con token JWT
  await page.route('**/auth/login', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          token: 'mock.jwt.token',
          user: { id: 'u1', email: 'test@healthy.app', name: 'Test User' },
        },
        message: 'Login exitoso',
        error: null,
      }),
    });
  });

  // POST /auth/login con credenciales incorrectas → 401
  // (el mock de login siempre devuelve 200; para el test de credenciales
  //  incorrectas sobreescribiremos la ruta dentro del test)
}

// ---------------------------------------------------------------------------
// Flujo de registro
// ---------------------------------------------------------------------------

test.describe('Flujo de registro', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthAPI(page);
    await page.goto('/');
  });

  test('muestra la pantalla de bienvenida al cargar', async ({ page }) => {
    // La WelcomeScreen debe renderizarse con algún texto de bienvenida
    await expect(page.getByText(/healthy/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('navega a la pantalla de registro al pulsar "Crear cuenta"', async ({ page }) => {
    const crearCuentaBtn = page.getByText(/crear cuenta/i).first();
    await expect(crearCuentaBtn).toBeVisible({ timeout: 10_000 });
    await crearCuentaBtn.click();

    // RegisterScreen debe mostrar un campo de email
    await expect(page.getByPlaceholder(/email/i).first()).toBeVisible();
  });

  test('muestra error de validación con email inválido', async ({ page }) => {
    await page.getByText(/crear cuenta/i).first().click();

    const emailInput = page.getByPlaceholder(/email/i).first();
    await emailInput.fill('noesvalido');

    // Intenta continuar
    const continueBtn = page.getByRole('button').filter({ hasText: /continuar|siguiente|registrar/i }).first();
    await continueBtn.click();

    // Debe mostrar mensaje de error de validación
    await expect(page.getByText(/email|correo|inválido|válido/i).first()).toBeVisible();
  });

  test('registro completo navega a verificación de email', async ({ page }) => {
    await page.getByText(/crear cuenta/i).first().click();

    await page.getByPlaceholder(/email/i).first().fill('nuevo@healthy.app');

    const continueBtn = page.getByRole('button').filter({ hasText: /continuar|siguiente|registrar/i }).first();
    await continueBtn.click();

    // Debe navegar a la pantalla de verificación
    await expect(
      page.getByText(/código|verificación|email/i).first()
    ).toBeVisible({ timeout: 5_000 });
  });
});

// ---------------------------------------------------------------------------
// Flujo de login
// ---------------------------------------------------------------------------

test.describe('Flujo de login', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthAPI(page);
    await page.goto('/');
  });

  test('navega a la pantalla de login al pulsar "Iniciar sesión"', async ({ page }) => {
    const loginBtn = page.getByText(/iniciar sesión|ya tengo cuenta/i).first();
    await expect(loginBtn).toBeVisible({ timeout: 10_000 });
    await loginBtn.click();

    await expect(page.getByPlaceholder(/email/i).first()).toBeVisible();
    await expect(page.getByPlaceholder(/contraseña|password/i).first()).toBeVisible();
  });

  test('muestra error con credenciales incorrectas (mock 401)', async ({ page }) => {
    // Sobreescribir el mock para devolver 401
    await page.route('**/auth/login', (route) => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false, data: null,
          message: 'Credenciales incorrectas',
          error: 'INVALID_CREDENTIALS',
        }),
      });
    });

    await page.getByText(/iniciar sesión|ya tengo cuenta/i).first().click();
    await page.getByPlaceholder(/email/i).first().fill('user@healthy.app');
    await page.getByPlaceholder(/contraseña|password/i).first().fill('WrongPass123');

    await page.getByRole('button').filter({ hasText: /iniciar sesión|entrar|login/i }).first().click();

    await expect(
      page.getByText(/incorrecto|inválido|error/i).first()
    ).toBeVisible({ timeout: 5_000 });
  });

  test('login exitoso navega fuera de la pantalla de login', async ({ page }) => {
    await page.getByText(/iniciar sesión|ya tengo cuenta/i).first().click();
    await page.getByPlaceholder(/email/i).first().fill('test@healthy.app');
    await page.getByPlaceholder(/contraseña|password/i).first().fill('Password123!');

    await page.getByRole('button').filter({ hasText: /iniciar sesión|entrar|login/i }).first().click();

    // Tras el login exitoso no debe permanecer en la pantalla de login
    await expect(
      page.getByPlaceholder(/contraseña|password/i).first()
    ).not.toBeVisible({ timeout: 8_000 });
  });
});

// ---------------------------------------------------------------------------
// Flujo de recuperación de contraseña
// ---------------------------------------------------------------------------

test.describe('Flujo de recuperación de contraseña', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthAPI(page);

    await page.route('**/auth/forgot-password', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {},
          message: 'Email de recuperación enviado',
          error: null,
        }),
      });
    });

    await page.goto('/');
  });

  test('navega a "olvidé mi contraseña" desde el login', async ({ page }) => {
    await page.getByText(/iniciar sesión|ya tengo cuenta/i).first().click();

    const forgotBtn = page.getByText(/olvidé|olvidaste|recuperar/i).first();
    await expect(forgotBtn).toBeVisible({ timeout: 5_000 });
    await forgotBtn.click();

    await expect(page.getByPlaceholder(/email/i).first()).toBeVisible();
  });

  test('enviar email de recuperación muestra confirmación', async ({ page }) => {
    await page.getByText(/iniciar sesión|ya tengo cuenta/i).first().click();
    await page.getByText(/olvidé|olvidaste|recuperar/i).first().click();

    await page.getByPlaceholder(/email/i).first().fill('user@healthy.app');
    await page.getByRole('button').filter({ hasText: /enviar|recuperar|restablecer/i }).first().click();

    await expect(
      page.getByText(/enviado|email|correo|revisa/i).first()
    ).toBeVisible({ timeout: 5_000 });
  });
});

// ---------------------------------------------------------------------------
// Seguridad: acceso sin autenticación
// ---------------------------------------------------------------------------

test.describe('Protección de rutas — acceso sin autenticación', () => {
  test('la app no muestra contenido protegido sin sesión activa', async ({ page }) => {
    await page.goto('/');

    // Sin token, no deben aparecer tabs de la app principal
    await expect(
      page.getByText(/mi progreso|entrenamiento de hoy|calorías/i).first()
    ).not.toBeVisible({ timeout: 5_000 });
  });
});
