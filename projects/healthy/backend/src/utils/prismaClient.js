/**
 * Singleton de PrismaClient para evitar múltiples conexiones en desarrollo
 * (hot-reload de nodemon crearía instancias duplicadas sin este patrón).
 */

const { PrismaClient } = require('@prisma/client');

// Reutilizar instancia en desarrollo para evitar agotamiento de conexiones
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error'],
  });
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = global.__prisma;
}

module.exports = prisma;
