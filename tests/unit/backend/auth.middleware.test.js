/**
 * Tests unitarios: auth.middleware.js
 * Verifica la verificación de JWT en el header Authorization.
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = 'test-secret-para-unit-tests';

beforeAll(() => {
  process.env.JWT_SECRET = JWT_SECRET;
});

// El middleware se requiere DESPUÉS de configurar JWT_SECRET
const { authenticate } = require('../../../backend/src/middleware/auth.middleware');

/** Construye un objeto req() de Express simulado */
function mockReq(authHeader) {
  return { headers: { authorization: authHeader } };
}

/** Construye un objeto res() de Express simulado */
function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
}

const next = jest.fn();

beforeEach(() => {
  next.mockClear();
});

// ---------------------------------------------------------------------------
// Token ausente o mal formado
// ---------------------------------------------------------------------------

describe('token ausente o mal formado', () => {
  test('sin header Authorization → 401 UNAUTHORIZED', () => {
    const res = mockRes();
    authenticate(mockReq(undefined), res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json.mock.calls[0][0].error).toBe('UNAUTHORIZED');
    expect(next).not.toHaveBeenCalled();
  });

  test('header sin prefijo Bearer → 401', () => {
    const res = mockRes();
    authenticate(mockReq('tokensinprefijo'), res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('header "Bearer " sin token → 401 INVALID_TOKEN', () => {
    const res = mockRes();
    authenticate(mockReq('Bearer '), res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('token manipulado (firma inválida) → 401 INVALID_TOKEN', () => {
    const token = jwt.sign({ userId: 'u1' }, 'secreto-distinto');
    const res = mockRes();
    authenticate(mockReq(`Bearer ${token}`), res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    const body = res.json.mock.calls[0][0];
    expect(body.error).toBe('INVALID_TOKEN');
    expect(next).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Token expirado
// ---------------------------------------------------------------------------

describe('token expirado', () => {
  test('devuelve 401 TOKEN_EXPIRED', () => {
    // expiresIn en el pasado
    const token = jwt.sign({ userId: 'u1' }, JWT_SECRET, { expiresIn: -1 });
    const res = mockRes();
    authenticate(mockReq(`Bearer ${token}`), res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    const body = res.json.mock.calls[0][0];
    expect(body.error).toBe('TOKEN_EXPIRED');
    expect(next).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Token válido
// ---------------------------------------------------------------------------

describe('token válido', () => {
  test('llama a next() y adjunta el payload en req.user', () => {
    const payload = { userId: 'u1', email: 'test@healthy.app' };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    const req = mockReq(`Bearer ${token}`);
    const res = mockRes();

    authenticate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toBeDefined();
    expect(req.user.userId).toBe('u1');
    expect(req.user.email).toBe('test@healthy.app');
  });

  test('no llama a res.status() cuando el token es válido', () => {
    const token = jwt.sign({ userId: 'u2' }, JWT_SECRET, { expiresIn: '1h' });
    const res = mockRes();
    authenticate(mockReq(`Bearer ${token}`), res, next);
    expect(res.status).not.toHaveBeenCalled();
  });
});
