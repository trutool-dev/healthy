const nodemailer = require('nodemailer');
const logger = require('../utils/logger.util');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Envía el código de verificación de email al usuario
 * @param {string} to - Email del destinatario
 * @param {string} code - Código de 6 dígitos
 */
const sendVerificationEmail = async (to, code) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: 'Verifica tu cuenta en Healthy',
      html: `
        <h2>Bienvenido a Healthy</h2>
        <p>Tu código de verificación es:</p>
        <h1 style="letter-spacing: 8px;">${code}</h1>
        <p>Este código expira en 15 minutos.</p>
      `,
    });
    logger.info(`[email] Código de verificación enviado a ${to}`);
  } catch (err) {
    logger.error(`[email] Error al enviar verificación a ${to}: ${err.message}`);
    throw err;
  }
};

/**
 * Envía el email de recuperación de contraseña
 * @param {string} to - Email del destinatario
 * @param {string} token - Token de reset
 */
const sendPasswordResetEmail = async (to, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: 'Recupera tu contraseña en Healthy',
      html: `
        <h2>Recuperación de contraseña</h2>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${resetUrl}">Restablecer contraseña</a>
        <p>Este enlace expira en 24 horas.</p>
        <p>Si no solicitaste este cambio, ignora este correo.</p>
      `,
    });
    logger.info(`[email] Email de recuperación enviado a ${to}`);
  } catch (err) {
    logger.error(`[email] Error al enviar recuperación a ${to}: ${err.message}`);
    throw err;
  }
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
