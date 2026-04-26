const { validationResult } = require('express-validator');
const { sendError } = require('../utils/response.util');

/**
 * Middleware que comprueba los errores de validación de express-validator.
 * Debe colocarse después de las reglas de validación en cada ruta.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors.array().map((e) => e.msg).join(', ');
    return sendError(res, 'VALIDATION_ERROR', message, 422);
  }

  next();
};

module.exports = { validate };
