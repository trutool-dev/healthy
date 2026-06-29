/**
 * Respuesta de éxito estándar
 * @param {object} res - Objeto response de Express
 * @param {object} data - Datos a devolver
 * @param {string} message - Mensaje descriptivo
 * @param {number} statusCode - Código HTTP (default 200)
 */
const sendSuccess = (res, data = {}, message = 'OK', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
    error: null,
  });
};

/**
 * Respuesta de error estándar
 * @param {object} res - Objeto response de Express
 * @param {string} error - Código o tipo de error
 * @param {string} message - Mensaje legible para el cliente
 * @param {number} statusCode - Código HTTP (default 400)
 */
const sendError = (res, error = 'BAD_REQUEST', message = 'Ha ocurrido un error', statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    data: null,
    message,
    error,
  });
};

module.exports = { sendSuccess, sendError };
