/**
 * Tests unitarios: crypto.util.js
 * Cubre hashing de contraseñas, comparación y generación de tokens/códigos.
 */

const {
  hashPassword,
  comparePassword,
  generateVerificationCode,
  generateSecureToken,
} = require('../../../backend/src/utils/crypto.util');

// ---------------------------------------------------------------------------
// hashPassword / comparePassword
// ---------------------------------------------------------------------------

describe('hashPassword', () => {
  test('devuelve una cadena diferente a la contraseña original', async () => {
    const hash = await hashPassword('miContraseña123');
    expect(hash).not.toBe('miContraseña123');
  });

  test('el hash tiene el formato bcrypt ($2b$)', async () => {
    const hash = await hashPassword('test1234');
    expect(hash).toMatch(/^\$2[ab]\$/);
  });

  test('dos hashes del mismo password son distintos (salt aleatorio)', async () => {
    const h1 = await hashPassword('igual');
    const h2 = await hashPassword('igual');
    expect(h1).not.toBe(h2);
  });
});

describe('comparePassword', () => {
  let hash;

  beforeEach(async () => {
    hash = await hashPassword('contraseñaCorrecta');
  });

  test('devuelve true con la contraseña correcta', async () => {
    const result = await comparePassword('contraseñaCorrecta', hash);
    expect(result).toBe(true);
  });

  test('devuelve false con contraseña incorrecta', async () => {
    const result = await comparePassword('contraseñaErronea', hash);
    expect(result).toBe(false);
  });

  test('devuelve false con cadena vacía', async () => {
    const result = await comparePassword('', hash);
    expect(result).toBe(false);
  });

  test('devuelve false con contraseña similar (case sensitive)', async () => {
    const result = await comparePassword('ContraseñaCorrecta', hash);
    expect(result).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// generateVerificationCode
// ---------------------------------------------------------------------------

describe('generateVerificationCode', () => {
  test('devuelve exactamente 6 caracteres', () => {
    expect(generateVerificationCode()).toHaveLength(6);
  });

  test('devuelve solo dígitos numéricos', () => {
    const code = generateVerificationCode();
    expect(code).toMatch(/^\d{6}$/);
  });

  test('el primer dígito nunca es 0 (rango 100000-999999)', () => {
    // Ejecutamos 20 veces para tener confianza estadística
    for (let i = 0; i < 20; i++) {
      const code = generateVerificationCode();
      expect(parseInt(code, 10)).toBeGreaterThanOrEqual(100000);
    }
  });

  test('devuelve tipo string', () => {
    expect(typeof generateVerificationCode()).toBe('string');
  });

  test('dos códigos consecutivos son distintos (con alta probabilidad)', () => {
    const codes = new Set(Array.from({ length: 10 }, generateVerificationCode));
    expect(codes.size).toBeGreaterThan(1);
  });
});

// ---------------------------------------------------------------------------
// generateSecureToken
// ---------------------------------------------------------------------------

describe('generateSecureToken', () => {
  test('tiene formato UUID v4', () => {
    const token = generateSecureToken();
    expect(token).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  test('devuelve tipo string', () => {
    expect(typeof generateSecureToken()).toBe('string');
  });

  test('dos tokens consecutivos son únicos', () => {
    const t1 = generateSecureToken();
    const t2 = generateSecureToken();
    expect(t1).not.toBe(t2);
  });
});
