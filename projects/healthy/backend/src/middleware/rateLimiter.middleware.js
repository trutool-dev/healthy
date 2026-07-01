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
 * Rate limiter general para la API autenticada.
 * Máximo: 100 peticiones por usuario (por userId en JWT) en 15 minutos.
 * Si el usuario no está autenticado, usa la IP como fallback.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    return sendError(
      res,
      'RATE_LIMIT_EXCEEDED',
      'Has superado el límite de peticiones. Por favor espera 15 minutos.',
      429
    );
  },
  keyGenerator: (req) => req.user?.userId || req.ip,
});

/**
 * Rate limiter específico para la regeneración de planes con IA.
 * Máximo: 3 regeneraciones por usuario (por userId en JWT) cada 24 horas.
 * Evita el abuso del endpoint costoso de IA (SEC-06).
 */
const planRegenerateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 horas
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.userId || req.ip,
  handler: (_req, res) => {
    return sendError(
      res,
      'PLAN_REGEN_LIMIT',
      'Máximo 3 regeneraciones de plan por día',
      429
    );
  },
});

module.exports = { authRateLimiter, apiLimiter, planRegenerateLimiter };
