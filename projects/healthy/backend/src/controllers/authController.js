/**
 * Controlador de autenticación (BE-01).
 * Gestiona: register, verify-email, set-password, login,
 *           forgot-password, reset-password, logout, refresh, me
 */

const prisma = require('../utils/prismaClient');
const {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
  generateOtpCode,
  getOtpExpiry,
  isOtpExpired,
} = require('../services/authService');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');
const { cacheSession, invalidateSession } = require('../services/cacheService');
const {
  sendSuccess,
  sendCreated,
  sendError,
  sendNotFound,
  sendUnauthorized,
  sendServerError,
} = require('../utils/response');
const logger = require('../utils/logger');

// ─────────────────────────────────────────────────────────────
// POST /auth/register
// ─────────────────────────────────────────────────────────────

/**
 * Registro de usuario nuevo.
 * Crea el user con password_hash vacío, genera código OTP y envía por email.
 */
async function register(req, res) {
  try {
    const { email, phone_number } = req.body;

    // Verificar si ya existe el email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return sendError(res, 'EMAIL_ALREADY_EXISTS', 'Ya existe una cuenta con ese email', 409);
    }

    // Crear usuario en estado pending_verification
    const user = await prisma.user.create({
      data: {
        email,
        phone_number: phone_number || null,
        password_hash: '', // Se establece en set-password tras verificar email
        status: 'pending_verification',
        email_verified: false,
      },
    });

    // Generar código OTP
    const code = generateOtpCode();
    const expiresAt = getOtpExpiry();

    await prisma.verificationCode.create({
      data: {
        user_id: user.id,
        email,
        code,
        type: 'email_verification',
        expires_at: expiresAt,
      },
    });

    // Enviar email (no bloquear si falla)
    const emailSent = await sendVerificationEmail(email, code);
    if (!emailSent) {
      logger.warn(`[auth] No se pudo enviar email de verificación a ${email}`);
    }

    logger.info(`[auth] Usuario registrado: ${user.id} (${email})`);
    return sendCreated(res, { user_id: user.id, email }, 'Cuenta creada. Revisa tu email para verificarla.');

  } catch (err) {
    logger.error('[auth] register error:', err);
    return sendServerError(res);
  }
}

// ─────────────────────────────────────────────────────────────
// POST /auth/verify-email
// ─────────────────────────────────────────────────────────────

async function verifyEmail(req, res) {
  try {
    const { email, code } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return sendNotFound(res, 'Usuario no encontrado');
    }

    // Buscar código válido (no usado, no expirado)
    const verification = await prisma.verificationCode.findFirst({
      where: {
        user_id: user.id,
        code,
        type: 'email_verification',
        used_at: null,
      },
      orderBy: { created_at: 'desc' },
    });

    if (!verification) {
      return sendError(res, 'INVALID_CODE', 'Código de verificación inválido', 400);
    }

    // Verificar max intentos
    if (verification.attempts >= 3) {
      return sendError(res, 'CODE_MAX_ATTEMPTS', 'Has superado el número máximo de intentos. Solicita un nuevo código.', 400);
    }

    // Verificar expiración
    if (isOtpExpired(verification.expires_at)) {
      return sendError(res, 'CODE_EXPIRED', 'El código ha expirado. Solicita uno nuevo.', 400);
    }

    // Marcar código como usado
    await prisma.verificationCode.update({
      where: { id: verification.id },
      data: { used_at: new Date() },
    });

    // Marcar email como verificado
    await prisma.user.update({
      where: { id: user.id },
      data: { email_verified: true },
    });

    logger.info(`[auth] Email verificado para usuario ${user.id}`);
    return sendSuccess(res, { user_id: user.id }, 'Email verificado correctamente. Ahora puedes crear tu contraseña.');

  } catch (err) {
    logger.error('[auth] verifyEmail error:', err);
    return sendServerError(res);
  }
}

// ─────────────────────────────────────────────────────────────
// POST /auth/set-password
// ─────────────────────────────────────────────────────────────

async function setPassword(req, res) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return sendNotFound(res, 'Usuario no encontrado');
    }

    if (!user.email_verified) {
      return sendError(res, 'EMAIL_NOT_VERIFIED', 'Debes verificar tu email antes de crear la contraseña', 400);
    }

    const password_hash = await hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password_hash,
        status: 'active',
      },
    });

    logger.info(`[auth] Contraseña establecida para usuario ${user.id}`);
    return sendSuccess(res, {}, 'Contraseña establecida correctamente. Ya puedes iniciar sesión.');

  } catch (err) {
    logger.error('[auth] setPassword error:', err);
    return sendServerError(res);
  }
}

// ─────────────────────────────────────────────────────────────
// POST /auth/login
// ─────────────────────────────────────────────────────────────

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const ip = req.ip;
    const deviceInfo = req.headers['user-agent'] || null;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password_hash) {
      return sendUnauthorized(res, 'Credenciales incorrectas');
    }

    if (user.status !== 'active') {
      return sendError(res, 'ACCOUNT_INACTIVE', 'Tu cuenta no está activa. Verifica tu email primero.', 403);
    }

    const passwordOk = await comparePassword(password, user.password_hash);
    if (!passwordOk) {
      logger.warn(`[auth] Intento de login fallido para ${email}`);
      return sendUnauthorized(res, 'Credenciales incorrectas');
    }

    // Generar tokens
    const refreshToken = generateRefreshToken();
    const refreshExpiresAt = getRefreshTokenExpiry();

    const session = await prisma.authSession.create({
      data: {
        user_id: user.id,
        refresh_token: refreshToken,
        device_info: deviceInfo,
        ip_address: ip,
        expires_at: refreshExpiresAt,
      },
    });

    const accessToken = generateAccessToken(user.id, user.email, session.id);

    // Cachear sesión en Redis
    await cacheSession(session.id, {
      user_id: user.id,
      email: user.email,
      refresh_token: refreshToken,
    });

    logger.info(`[auth] Login exitoso para usuario ${user.id}`);
    return sendSuccess(res, {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: 900, // 15 minutos en segundos
      user: {
        id: user.id,
        email: user.email,
        status: user.status,
      },
    }, 'Sesión iniciada correctamente');

  } catch (err) {
    logger.error('[auth] login error:', err);
    return sendServerError(res);
  }
}

// ─────────────────────────────────────────────────────────────
// POST /auth/forgot-password
// ─────────────────────────────────────────────────────────────

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    // Por seguridad, siempre devolvemos 200 aunque el usuario no exista
    if (!user) {
      return sendSuccess(res, {}, 'Si existe una cuenta con ese email, recibirás las instrucciones de recuperación.');
    }

    // Crear token de reset (UUID generado por Prisma default)
    const resetToken = await prisma.passwordResetToken.create({
      data: {
        user_id: user.id,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
        ip_address: req.ip,
      },
    });

    await sendPasswordResetEmail(email, resetToken.token);

    return sendSuccess(res, {}, 'Si existe una cuenta con ese email, recibirás las instrucciones de recuperación.');

  } catch (err) {
    logger.error('[auth] forgotPassword error:', err);
    return sendServerError(res);
  }
}

// ─────────────────────────────────────────────────────────────
// POST /auth/reset-password
// ─────────────────────────────────────────────────────────────

async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;

    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetRecord) {
      return sendError(res, 'INVALID_TOKEN', 'Token de recuperación inválido o ya usado', 400);
    }

    if (resetRecord.used_at) {
      return sendError(res, 'TOKEN_ALREADY_USED', 'Este enlace ya fue utilizado', 400);
    }

    if (new Date() > new Date(resetRecord.expires_at)) {
      return sendError(res, 'TOKEN_EXPIRED', 'El enlace de recuperación ha expirado. Solicita uno nuevo.', 400);
    }

    const password_hash = await hashPassword(password);

    // Actualizar contraseña y marcar token como usado (transacción)
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.user_id },
        data: { password_hash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { used_at: new Date() },
      }),
      // Invalidar todas las sesiones activas del usuario por seguridad
      prisma.authSession.deleteMany({
        where: { user_id: resetRecord.user_id },
      }),
    ]);

    logger.info(`[auth] Contraseña restablecida para usuario ${resetRecord.user_id}`);
    return sendSuccess(res, {}, 'Contraseña restablecida correctamente. Ya puedes iniciar sesión.');

  } catch (err) {
    logger.error('[auth] resetPassword error:', err);
    return sendServerError(res);
  }
}

// ─────────────────────────────────────────────────────────────
// POST /auth/logout
// ─────────────────────────────────────────────────────────────

async function logout(req, res) {
  try {
    const sessionId = req.user.sessionId;

    if (sessionId) {
      // Eliminar sesión de DB
      await prisma.authSession.deleteMany({
        where: { id: sessionId },
      });

      // Invalidar sesión en Redis
      await invalidateSession(sessionId);
    }

    return sendSuccess(res, {}, 'Sesión cerrada correctamente');

  } catch (err) {
    logger.error('[auth] logout error:', err);
    return sendServerError(res);
  }
}

// ─────────────────────────────────────────────────────────────
// POST /auth/refresh
// ─────────────────────────────────────────────────────────────

async function refreshToken(req, res) {
  try {
    const { refresh_token } = req.body;

    const session = await prisma.authSession.findUnique({
      where: { refresh_token },
      include: { user: true },
    });

    if (!session) {
      return sendUnauthorized(res, 'Refresh token inválido');
    }

    if (new Date() > new Date(session.expires_at)) {
      await prisma.authSession.delete({ where: { id: session.id } });
      return sendUnauthorized(res, 'Sesión expirada. Por favor inicia sesión de nuevo.');
    }

    if (session.user.status !== 'active') {
      return sendUnauthorized(res, 'Cuenta inactiva');
    }

    // Rotar refresh token (one-time-use)
    const newRefreshToken = generateRefreshToken();
    const newExpiresAt = getRefreshTokenExpiry();

    await prisma.authSession.update({
      where: { id: session.id },
      data: {
        refresh_token: newRefreshToken,
        expires_at: newExpiresAt,
        last_used_at: new Date(),
      },
    });

    const newAccessToken = generateAccessToken(session.user.id, session.user.email, session.id);

    await cacheSession(session.id, {
      user_id: session.user.id,
      email: session.user.email,
      refresh_token: newRefreshToken,
    });

    return sendSuccess(res, {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      token_type: 'Bearer',
      expires_in: 900,
    }, 'Token renovado correctamente');

  } catch (err) {
    logger.error('[auth] refreshToken error:', err);
    return sendServerError(res);
  }
}

// ─────────────────────────────────────────────────────────────
// GET /auth/me
// ─────────────────────────────────────────────────────────────

async function me(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        phone_number: true,
        email_verified: true,
        phone_verified: true,
        status: true,
        created_at: true,
        profile: {
          select: {
            name: true,
            birthdate: true,
            gender: true,
            weight_kg: true,
            height_cm: true,
            goal: true,
            activity_level: true,
          },
        },
      },
    });

    if (!user) {
      return sendNotFound(res, 'Usuario no encontrado');
    }

    return sendSuccess(res, { user }, 'Datos del usuario');

  } catch (err) {
    logger.error('[auth] me error:', err);
    return sendServerError(res);
  }
}

module.exports = {
  register,
  verifyEmail,
  setPassword,
  login,
  forgotPassword,
  resetPassword,
  logout,
  refreshToken,
  me,
};
