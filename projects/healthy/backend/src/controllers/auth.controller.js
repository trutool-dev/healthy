const { sendSuccess, sendError } = require('../utils/response.util');

/** POST /auth/register */
const register = async (req, res, next) => {
  try {
    // TODO: implementar registro con email y teléfono
    sendSuccess(res, {}, 'Endpoint en construcción', 501);
  } catch (err) {
    next(err);
  }
};

/** POST /auth/verify-email */
const verifyEmail = async (req, res, next) => {
  try {
    // TODO: verificar código de 6 dígitos
    sendSuccess(res, {}, 'Endpoint en construcción', 501);
  } catch (err) {
    next(err);
  }
};

/** POST /auth/set-password */
const setPassword = async (req, res, next) => {
  try {
    // TODO: crear contraseña tras verificación exitosa
    sendSuccess(res, {}, 'Endpoint en construcción', 501);
  } catch (err) {
    next(err);
  }
};

/** POST /auth/login */
const login = async (req, res, next) => {
  try {
    // TODO: login con email y contraseña, devolver access + refresh token
    sendSuccess(res, {}, 'Endpoint en construcción', 501);
  } catch (err) {
    next(err);
  }
};

/** POST /auth/forgot-password */
const forgotPassword = async (req, res, next) => {
  try {
    // TODO: generar token y enviar email de recuperación
    sendSuccess(res, {}, 'Endpoint en construcción', 501);
  } catch (err) {
    next(err);
  }
};

/** POST /auth/reset-password */
const resetPassword = async (req, res, next) => {
  try {
    // TODO: validar token y establecer nueva contraseña
    sendSuccess(res, {}, 'Endpoint en construcción', 501);
  } catch (err) {
    next(err);
  }
};

/** POST /auth/logout */
const logout = async (req, res, next) => {
  try {
    // TODO: invalidar sesión en AuthSession
    sendSuccess(res, {}, 'Endpoint en construcción', 501);
  } catch (err) {
    next(err);
  }
};

/** GET /auth/me */
const me = async (req, res, next) => {
  try {
    // TODO: devolver datos del usuario autenticado (req.user)
    sendSuccess(res, {}, 'Endpoint en construcción', 501);
  } catch (err) {
    next(err);
  }
};

module.exports = { register, verifyEmail, setPassword, login, forgotPassword, resetPassword, logout, me };
