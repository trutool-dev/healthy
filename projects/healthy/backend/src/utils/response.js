/**
 * Helpers para construir respuestas de API uniformes.
 * Todos los endpoints deben usar estas funciones para garantizar consistencia.
 */

/**
 * Respuesta de éxito estándar.
 * @param {object} res - Express response
 * @param {any} data - Datos a devolver
 * @param {string} message - Mensaje descriptivo
 * @param {number} statusCode - Código HTTP (default 200)
 */
function sendSuccess(res, data = {}, message = 'OK', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
}

/**
 * Respuesta de error estándar.
 * @param {object} res - Express response
 * @param {string} errorCode - Código de error en mayúsculas (ej: "USER_NOT_FOUND")
 * @param {string} message - Mensaje legible para el usuario
 * @param {number} statusCode - Código HTTP (default 400)
 */
function sendError(res, errorCode, message, statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    error: errorCode,
    message,
  });
}

/**
 * Respuesta 201 Created para recursos nuevos.
 */
function sendCreated(res, data = {}, message = 'Recurso creado correctamente') {
  return sendSuccess(res, data, message, 201);
}

/**
 * Respuesta 404 Not Found.
 */
function sendNotFound(res, message = 'Recurso no encontrado') {
  return sendError(res, 'NOT_FOUND', message, 404);
}

/**
 * Respuesta 401 Unauthorized.
 */
function sendUnauthorized(res, message = 'No autorizado') {
  return sendError(res, 'UNAUTHORIZED', message, 401);
}

/**
 * Respuesta 403 Forbidden.
 */
function sendForbidden(res, message = 'Acceso denegado') {
  return sendError(res, 'FORBIDDEN', message, 403);
}

/**
 * Respuesta 422 Unprocessable Entity (errores de validación).
 */
function sendValidationError(res, errors, message = 'Error de validación') {
  return res.status(422).json({
    success: false,
    error: 'VALIDATION_ERROR',
    message,
    errors,
  });
}

/**
 * Respuesta 500 Internal Server Error.
 */
function sendServerError(res, message = 'Error interno del servidor') {
  return sendError(res, 'INTERNAL_ERROR', message, 500);
}

module.exports = {
  sendSuccess,
  sendError,
  sendCreated,
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
  sendValidationError,
  sendServerError,
};
