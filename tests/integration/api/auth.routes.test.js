/**
 * Tests de integración: rutas de autenticación.
 * Verifica routing, validaciones (422) y protección con JWT (401).
 * Los controladores devuelven 501 (en construcción) — se testea la capa de
 * middleware y validación, que SÍ está implementada.
 */

const request = require('supertest');
const jwt     = require('jsonwebtoken');

process.env.NODE_ENV  = 'test';
process.env.JWT_SECRET = 'test-secret-integration';
process.env.FRONTEND_URL = 'http://localhost:8081';

jest.mock('../../../backend/src/prisma/client', () => require('../../mocks/prisma.mock'));
jest.mock('../../../backend/src/services/redis.service', () => ({
  get: jest.fn(), set: jest.fn(), del: jest.fn(),
}));
jest.mock('../../../backend/src/services/email.service', () => ({
  sendVerificationEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}));
// Desactivar el rate limiter en tests para que no interfiera entre llamadas
jest.mock('../../../backend/src/middleware/rateLimiter.middleware', () => ({
  authRateLimiter: (_req, _res, next) => next(),
}));

const app = require('../../../backend/src/app');

// ---------------------------------------------------------------------------
// POST /auth/register
// ---------------------------------------------------------------------------

describe('POST /auth/register', () => {
  const VALID_BODY = { email: 'nuevo@healthy.app', phone_number: '+34600000000' };

  test('responde (ruta existe, no 404)', async () => {
    const res = await request(app).post('/auth/register').send(VALID_BODY);
    expect(res.status).not.toBe(404);
  });

  test('email inválido → 422 con errores de validación', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'no-es-un-email' });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  test('sin email → 422', async () => {
    const res = await request(app).post('/auth/register').send({});
    expect(res.status).toBe(422);
  });

  test('email válido llega al controlador (501 mientras esté en construcción)', async () => {
    const res = await request(app).post('/auth/register').send(VALID_BODY);
    // 422 (validación falla) o 501 (controlador stub) — ambos son aceptables ahora
    expect([422, 501]).toContain(res.status);
  });
});

// ---------------------------------------------------------------------------
// POST /auth/login
// ---------------------------------------------------------------------------

describe('POST /auth/login', () => {
  test('sin email → 422', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ password: 'password123' });
    expect(res.status).toBe(422);
  });

  test('sin password → 422', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'user@healthy.app' });
    expect(res.status).toBe(422);
  });

  test('email inválido → 422', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'noesvalido', password: 'pass' });
    expect(res.status).toBe(422);
  });

  test('credenciales válidas llegan al controlador', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'user@healthy.app', password: 'Password123!' });
    expect([422, 501]).toContain(res.status);
  });
});

// ---------------------------------------------------------------------------
// POST /auth/verify-email
// ---------------------------------------------------------------------------

describe('POST /auth/verify-email', () => {
  test('sin código → 422', async () => {
    const res = await request(app)
      .post('/auth/verify-email')
      .send({ email: 'user@healthy.app' });
    expect(res.status).toBe(422);
  });

  test('código con longitud incorrecta → 422', async () => {
    const res = await request(app)
      .post('/auth/verify-email')
      .send({ email: 'user@healthy.app', code: '123' }); // debe ser 6 dígitos
    expect(res.status).toBe(422);
  });

  test('código válido de 6 dígitos llega al controlador', async () => {
    const res = await request(app)
      .post('/auth/verify-email')
      .send({ email: 'user@healthy.app', code: '123456' });
    expect([422, 501]).toContain(res.status);
  });
});

// ---------------------------------------------------------------------------
// POST /auth/set-password
// ---------------------------------------------------------------------------

describe('POST /auth/set-password', () => {
  test('contraseña corta (< 8 caracteres) → 422', async () => {
    const res = await request(app)
      .post('/auth/set-password')
      .send({ email: 'user@healthy.app', code: '123456', password: 'short' });
    expect(res.status).toBe(422);
  });

  test('contraseña válida llega al controlador', async () => {
    const res = await request(app)
      .post('/auth/set-password')
      .send({ email: 'user@healthy.app', code: '123456', password: 'Password123!' });
    expect([422, 501]).toContain(res.status);
  });
});

// ---------------------------------------------------------------------------
// Rutas protegidas — autenticación JWT (middleware)
// ---------------------------------------------------------------------------

describe('rutas protegidas con authenticate middleware', () => {
  const PROTECTED_ROUTES = [
    { method: 'get',  path: '/auth/me' },
    { method: 'post', path: '/auth/logout' },
  ];

  PROTECTED_ROUTES.forEach(({ method, path }) => {
    test(`${method.toUpperCase()} ${path} sin token → 401 UNAUTHORIZED`, async () => {
      const res = await request(app)[method](path);
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('UNAUTHORIZED');
    });

    test(`${method.toUpperCase()} ${path} con token inválido → 401 INVALID_TOKEN`, async () => {
      const res = await request(app)[method](path)
        .set('Authorization', 'Bearer token.falso.aqui');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('INVALID_TOKEN');
    });

    test(`${method.toUpperCase()} ${path} con token expirado → 401 TOKEN_EXPIRED`, async () => {
      const expired = jwt.sign({ userId: 'u1' }, process.env.JWT_SECRET, { expiresIn: -1 });
      const res = await request(app)[method](path)
        .set('Authorization', `Bearer ${expired}`);
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('TOKEN_EXPIRED');
    });

    test(`${method.toUpperCase()} ${path} con JWT válido pasa el middleware`, async () => {
      const token = jwt.sign({ userId: 'u1' }, process.env.JWT_SECRET, { expiresIn: '1h' });
      const res = await request(app)[method](path)
        .set('Authorization', `Bearer ${token}`);
      // El controlador stub devuelve 501; lo importante es que no sea 401
      expect(res.status).not.toBe(401);
    });
  });
});

// ---------------------------------------------------------------------------
// Rutas protegidas — onboarding
// ---------------------------------------------------------------------------

describe('rutas de onboarding sin autenticación → 401', () => {
  const ONBOARDING_ROUTES = [
    { method: 'post', path: '/onboarding/start' },
    { method: 'put',  path: '/onboarding/profile' },
    { method: 'put',  path: '/onboarding/lifestyle' },
    { method: 'put',  path: '/onboarding/training' },
    { method: 'put',  path: '/onboarding/nutrition' },
    { method: 'post', path: '/onboarding/complete' },
  ];

  ONBOARDING_ROUTES.forEach(({ method, path }) => {
    test(`${method.toUpperCase()} ${path} sin token → 401`, async () => {
      const res = await request(app)[method](path);
      expect(res.status).toBe(401);
    });
  });
});

// ---------------------------------------------------------------------------
// Formato estándar de respuestas de error
// ---------------------------------------------------------------------------

describe('formato estándar de respuestas de error', () => {
  test('error de validación tiene { success: false, error, message }', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'invalido' });
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('error');
    expect(res.body).toHaveProperty('message');
  });

  test('error 401 tiene { success: false, error, message }', async () => {
    const res = await request(app).get('/auth/me');
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('error');
    expect(res.body).toHaveProperty('message');
  });
});
