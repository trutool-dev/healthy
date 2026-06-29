/**
 * Middleware de autenticación JWT.
 * Verifica el access token en el header Authorization: Bearer <token>.
 * Adjunta req.user con los datos del payload decodificado.
 */

const jwt = require('jsonwebtoken');
const { sendUnauthorized } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Middleware principal de autenticación.
 * Requerido para todos los endpoints protegidos.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendUnauthorized(res, 'Token de acceso requerido');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return sendUnauthorized(res, 'Token de acceso no válido');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Adjuntar payload al request para uso en controllers
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      sessionId: decoded.sessionId,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendUnauthorized(res, 'Token expirado. Por favor, renueva tu sesión.');
    }
    if (err.name === 'JsonWebTokenError') {
      return sendUnauthorized(res, 'Token inválido');
    }
    logger.error('[auth] Error al verificar token:', err);
    return sendUnauthorized(res, 'Error al verificar autenticación');
  }
}

module.exports = { authenticate };
