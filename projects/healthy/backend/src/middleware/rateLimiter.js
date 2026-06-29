/**
 * Configuraciones de rate limiting (BE-08).
 *
 * authLimiter  → max 5 req / 15min por IP en rutas /auth/*
 * apiLimiter   → max 100 req / 15min por usuario autenticado
 */

const rateLimit = require('express-rate-limit');
const { sendError } = require('../utils/response');

/**
 * Rate limiter para rutas de autenticación.
 * Protege contra ataques de fuerza bruta y spam de emails.
 * Máximo: 5 peticiones por IP en 15 minutos.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(
      res,
      'RATE_LIMIT_EXCEEDED',
      'Demasiados intentos. Por favor espera 15 minutos antes de intentarlo de nuevo.',
      429,
    );
  },
  // Clave por IP
  keyGenerator: (req) => req.ip,
});

/**
 * Rate limiter general para la API autenticada.
 * Máximo: 100 peticiones por usuario (por su ID en JWT) en 15 minutos.
 * Si el usuario no está autenticado, usa la IP como fallback.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(
      res,
      'RATE_LIMIT_EXCEEDED',
      'Has superado el límite de peticiones. Por favor espera 15 minutos.',
      429,
    );
  },
  // Clave por userId si está autenticado, por IP si no
  keyGenerator: (req) => req.user?.id || req.ip,
});

/**
 * Rate limiter específico para la regeneración de planes con IA.
 * Máximo: 3 regeneraciones por usuario (por userId en JWT) cada 24 horas.
 * Evita el abuso del endpoint costoso de IA.
 */
const planRegenerateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 horas
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.userId || req.ip,
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      error: 'PLAN_REGEN_LIMIT',
      message: 'Máximo 3 regeneraciones de plan por día',
    });
  },
});

module.exports = { authLimiter, apiLimiter, planRegenerateLimiter };
