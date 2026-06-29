/**
 * Logger centralizado usando winston.
 * Nivel de log configurable por variable de entorno LOG_LEVEL.
 * En producción solo muestra warn y error; en desarrollo muestra debug.
 */

const winston = require('winston');

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Formato personalizado para logs de desarrollo
const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack }) => {
    return stack
      ? `${ts} [${level}]: ${message}\n${stack}`
      : `${ts} [${level}]: ${message}`;
  }),
);

// Formato JSON para producción
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  winston.format.json(),
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'warn' : 'debug'),
  format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console(),
  ],
});

module.exports = logger;
