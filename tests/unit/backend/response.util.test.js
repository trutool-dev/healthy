/**
 * Tests unitarios: response.util.js
 * Verifica el formato estándar de respuestas de éxito y error.
 */

const { sendSuccess, sendError } = require('../../../backend/src/utils/response.util');

/** Crea un objeto res() de Express simulado */
function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
}

// ---------------------------------------------------------------------------
// sendSuccess
// ---------------------------------------------------------------------------

describe('sendSuccess', () => {
  test('usa status 200 por defecto', () => {
    const res = mockRes();
    sendSuccess(res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('respeta el statusCode proporcionado', () => {
    const res = mockRes();
    sendSuccess(res, {}, 'Creado', 201);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('el body tiene success: true', () => {
    const res = mockRes();
    sendSuccess(res, { id: 1 }, 'OK');
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(true);
  });

  test('incluye los datos pasados', () => {
    const res = mockRes();
    const data = { user: { id: 'u1', email: 'a@b.com' } };
    sendSuccess(res, data);
    const body = res.json.mock.calls[0][0];
    expect(body.data).toEqual(data);
  });

  test('incluye el mensaje proporcionado', () => {
    const res = mockRes();
    sendSuccess(res, {}, 'Usuario creado correctamente');
    const body = res.json.mock.calls[0][0];
    expect(body.message).toBe('Usuario creado correctamente');
  });

  test('error es null en respuesta de éxito', () => {
    const res = mockRes();
    sendSuccess(res);
    const body = res.json.mock.calls[0][0];
    expect(body.error).toBeNull();
  });

  test('usa data vacío y mensaje "OK" por defecto', () => {
    const res = mockRes();
    sendSuccess(res);
    const body = res.json.mock.calls[0][0];
    expect(body.data).toEqual({});
    expect(body.message).toBe('OK');
  });
});

// ---------------------------------------------------------------------------
// sendError
// ---------------------------------------------------------------------------

describe('sendError', () => {
  test('usa status 400 por defecto', () => {
    const res = mockRes();
    sendError(res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('respeta el statusCode proporcionado', () => {
    const res = mockRes();
    sendError(res, 'UNAUTHORIZED', 'No autorizado', 401);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('el body tiene success: false', () => {
    const res = mockRes();
    sendError(res, 'NOT_FOUND', 'No encontrado', 404);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(false);
  });

  test('data es null en respuesta de error', () => {
    const res = mockRes();
    sendError(res, 'ERROR');
    const body = res.json.mock.calls[0][0];
    expect(body.data).toBeNull();
  });

  test('incluye el código de error', () => {
    const res = mockRes();
    sendError(res, 'VALIDATION_ERROR', 'Datos inválidos', 422);
    const body = res.json.mock.calls[0][0];
    expect(body.error).toBe('VALIDATION_ERROR');
  });

  test('incluye el mensaje de error', () => {
    const res = mockRes();
    sendError(res, 'SERVER_ERROR', 'Error interno del servidor', 500);
    const body = res.json.mock.calls[0][0];
    expect(body.message).toBe('Error interno del servidor');
  });

  test('valores por defecto: BAD_REQUEST + mensaje genérico + 400', () => {
    const res = mockRes();
    sendError(res);
    expect(res.status).toHaveBeenCalledWith(400);
    const body = res.json.mock.calls[0][0];
    expect(body.error).toBe('BAD_REQUEST');
    expect(body.message).toBeTruthy();
  });
});
