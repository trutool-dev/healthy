/**
 * Controlador de logs diarios (BE-06).
 * GET /logs/today — log del día (crea si no existe)
 * PUT /logs/today — actualizar log del día
 * GET /logs/history?days=30 — historial
 */

const prisma = require('../utils/prismaClient');
const {
  sendSuccess,
  sendServerError,
} = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Obtiene o crea el log del día actual.
 * @param {string} userId
 * @param {Date} todayStart - Inicio del día (medianoche)
 */
async function getOrCreateTodayLog(userId, todayStart) {
  let log = await prisma.dailyLog.findFirst({
    where: {
      user_id: userId,
      log_date: {
        gte: todayStart,
        lte: new Date(todayStart.getTime() + 86400000 - 1),
      },
    },
  });

  if (!log) {
    log = await prisma.dailyLog.create({
      data: {
        user_id: userId,
        log_date: todayStart,
      },
    });
  }

  return log;
}

// GET /logs/today — Log del día actual
async function getTodayLog(req, res) {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const log = await getOrCreateTodayLog(userId, today);

    return sendSuccess(res, { log }, 'Log del día');

  } catch (err) {
    logger.error('[logs] getTodayLog error:', err);
    return sendServerError(res);
  }
}

// PUT /logs/today — Actualizar log del día
async function updateTodayLog(req, res) {
  try {
    const userId = req.user.id;
    const { water_ml, sleep_hours, sleep_quality, energy_level, mood, steps } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Asegurar que existe el log del día
    await getOrCreateTodayLog(userId, today);

    const updated = await prisma.dailyLog.update({
      where: {
        user_id_log_date: {
          user_id: userId,
          log_date: today,
        },
      },
      data: {
        water_ml: water_ml !== undefined ? water_ml : undefined,
        sleep_hours: sleep_hours !== undefined ? sleep_hours : undefined,
        sleep_quality: sleep_quality !== undefined ? sleep_quality : undefined,
        energy_level: energy_level !== undefined ? energy_level : undefined,
        mood: mood !== undefined ? mood : undefined,
        steps: steps !== undefined ? steps : undefined,
      },
    });

    return sendSuccess(res, { log: updated }, 'Log del día actualizado correctamente');

  } catch (err) {
    logger.error('[logs] updateTodayLog error:', err);
    return sendServerError(res);
  }
}

// GET /logs/history?days=30 — Historial de logs
async function getLogHistory(req, res) {
  try {
    const userId = req.user.id;
    const days = Math.min(parseInt(req.query.days || '30', 10), 365);

    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const logs = await prisma.dailyLog.findMany({
      where: {
        user_id: userId,
        log_date: { gte: since },
      },
      orderBy: { log_date: 'desc' },
    });

    // Calcular promedios del período
    const withData = logs.filter(l => l.water_ml || l.sleep_hours || l.energy_level);
    const averages = withData.length > 0 ? {
      avg_water_ml: Math.round(withData.reduce((s, l) => s + (l.water_ml || 0), 0) / withData.length),
      avg_sleep_hours: parseFloat((withData.reduce((s, l) => s + parseFloat(l.sleep_hours || 0), 0) / withData.length).toFixed(1)),
      avg_energy_level: parseFloat((withData.reduce((s, l) => s + (l.energy_level || 0), 0) / withData.length).toFixed(1)),
      avg_mood: parseFloat((withData.reduce((s, l) => s + (l.mood || 0), 0) / withData.length).toFixed(1)),
      avg_steps: Math.round(withData.reduce((s, l) => s + (l.steps || 0), 0) / withData.length),
    } : null;

    return sendSuccess(res, {
      logs,
      total: logs.length,
      days_requested: days,
      averages,
    }, `Historial de los últimos ${days} días`);

  } catch (err) {
    logger.error('[logs] getLogHistory error:', err);
    return sendServerError(res);
  }
}

module.exports = { getTodayLog, updateTodayLog, getLogHistory };
