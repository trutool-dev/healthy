const rateLimit = require('express-rate-limit');
const { sendError } = require('../utils/response.util');

/**
 * Rate limiter para endpoints de autenticación.
 * Máximo 5 intentos por IP en una ventana de 15 minutos.
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    return sendError(
      res,
      'TOO_MANY_REQUESTS',
      'Demasiados intentos. Inténtalo de nuevo en 15 minutos.',
      429
    );
  },
});

/**
 * Rate limiter general para la AP