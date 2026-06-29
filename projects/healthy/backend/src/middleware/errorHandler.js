/**
 * Middleware de manejo global de errores.
 * Debe registrarse como último middleware en app.js.
 * Captura errores no controlados y devuelve respuestas uniformes.
 */

const logger = require('../utils/logger');

/**
 * Manejador global de errores Express.
 * Signature de 4 parámetros es requerida por Express para reconocerlo.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Log del error
  logger.error(`[errorHandler] ${req.method} ${req.path}`, {
    message: err.message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    userId: req.user?.id,
  });

  // Errores de validación de Prisma (registros duplicados, foreign keys, etc.)
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      error: 'DUPLICATE_ENTRY',
      message: 'Ya existe un registro con esos datos',
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: 'NOT_FOUND',
      message: 'Registro no encontrado',
    });
  }

  // Error de payload demasiado grande (body-parser)
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: 'PAYLOAD_TOO_LARGE',
      message: 'El cuerpo de la petición es demasiado grande',
    });
  }

  // Error de JSON malformado
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: 'INVALID_JSON',
      message: 'El cuerpo de la petición no es JSON válido',
    });
  }

  // Error genérico
  const statusCode = err.statusCode || err.status || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Error interno del servidor'
      : err.message || 'Error interno del servidor';

  return res.status(statusCode).json({
    success: false,
    error: 'INTERNAL_ERROR',
    message,
  });
}

/**
 * Manejador de rutas no encontradas (404).
 * Registrar antes del errorHandler.
 */
function notFoundHandler(req, res) {
  return res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: `Ruta ${req.method} ${req.path} no encontrada`,
  });
}

module.exports = { errorHandler, notFoundHandler };
