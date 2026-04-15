const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const SALT_ROUNDS = 12;

/**
 * Hashea una contraseña con bcrypt
 * @param {string} password
 * @returns {Promise<string>}
 */
const hashPassword = (password) => bcrypt.hash(password, SALT_ROUNDS);

/**
 * Compara una contraseña en texto plano con su hash
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
const comparePassword = (password, hash) => bcrypt.compare(password, hash);

/**
 * Genera un código numérico de 6 dígitos para verificación
 * @returns {string}
 */
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Genera un token UUID seguro
 * @returns {string}
 */
const generateSecureToken = () => crypto.randomUUID();

module.exports = {
  hashPassword,
  comparePassword,
  generateVerificationCode,
  generateSecureToken,
};
