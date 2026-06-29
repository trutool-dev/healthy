/**
 * Controlador de progreso (BE-05).
 * GET /progress — historial
 * POST /progress — nuevo registro
 * GET /progress/stats — estadísticas
 */

const prisma = require('../utils/prismaClient');
const { shouldRegeneratePlan } = require('../services/aiService');
const {
  sendSuccess,
  sendError,
  sendServerError,
} = require('../utils/response');
const logger = require('../utils/logger');

// GET /progress — Historial de progreso ordenado desc
async function getProgress(req, res) {
  try {
    const userId = req.user.id;
    const { limit = 30, offset = 0 } = req.query;

    const logs = await prisma.progressLog.findMany({
      where: { user_id: userId },
      orderBy: { log_date: 'desc' },
      take: parseInt(limit, 10),
      skip: parseInt(offset, 10),
    });

    const total = await prisma.progressLog.count({ where: { user_id: userId } });

    return sendSuccess(res, { logs, total, limit: parseInt(limit, 10), offset: parseInt(offset, 10) }, 'Historial de progreso');

  } catch (err) {
    logger.error('[progress] getProgress error:', err);
    return sendServerError(res);
  }
}

// POST /progress — Crear nuevo registro de progreso
async function createProgress(req, res) {
  try {
    const userId = req.user.id;
    const {
      log_date, weight_kg, body_fat_percentage, muscle_mass_kg,
      waist_cm, hip_cm, chest_cm, notes, photo_url,
    } = req.body;

    // Verificar si ya existe registro para esa fecha
    const existing = await prisma.progressLog.findFirst({
      where: {
        user_id: userId,
        log_date: {
          gte: new Date(new Date(log_date).setHours(0, 0, 0, 0)),
          lte: new Date(new Date(log_date).setHours(23, 59, 59, 999)),
        },
      },
    });

    if (existing) {
      return sendError(res, 'PROGRESS_ALREADY_EXISTS', 'Ya existe un registro de progreso para esa fecha', 409);
    }

    const log = await prisma.progressLog.create({
      data: {
        user_id: userId,
        log_date: new Date(log_date),
        weight_kg: weight_kg || null,
        body_fat_percentage: body_fat_percentage || null,
        muscle_mass_kg: muscle_mass_kg || null,
        waist_cm: waist_cm || null,
        hip_cm: hip_cm || null,
        chest_cm: chest_cm || null,
        notes: notes || null,
        photo_url: photo_url || null,
      },
    });

    // Verificar si es necesario regenerar el plan por estancamiento (AI-04)
    const recentLogs = await prisma.progressLog.findMany({
      where: { user_id: userId },
      orderBy: { log_date: 'desc' },
      take: 30,
    });

    const needsRegeneration = shouldRegeneratePlan(
      recentLogs.map(l => ({ log_date: l.log_date.toISOString(), weight_kg: l.weight_kg ? parseFloat(l.weight_kg) : null }))
    );

    return sendSuccess(res, {
      log,
      needs_plan_regeneration: needsRegeneration,
    }, 'Registro de progreso creado correctamente');

  } catch (err) {
    logger.error('[progress] createProgress error:', err);
    return sendServerError(res);
  }
}

// GET /progress/stats — Estadísticas de progreso
async function getProgressStats(req, res) {
  try {
    const userId = req.user.id;

    const logs = await prisma.progressLog.findMany({
      where: { user_id: userId },
      orderBy: { log_date: 'desc' },
    });

    if (logs.length === 0) {
      return sendSuccess(res, {
        last_weight: null,
        total_change: null,
        streak: 0,
        total_logs: 0,
      }, 'Sin registros de progreso aún');
    }

    const withWeight = logs.filter(l => l.weight_kg !== null);

    const lastWeight = withWeight.length > 0 ? parseFloat(withWeight[0].weight_kg) : null;
    const firstWeight = withWeight.length > 0 ? parseFloat(withWeight[withWeight.length - 1].weight_kg) : null;
    const totalChange = lastWeight !== null && firstWeight !== null ? lastWeight - firstWeight : null;

    // Calcular racha actual (días consecutivos con registro)
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < logs.length; i++) {
      const logDate = new Date(logs[i].log_date);
      logDate.setHours(0, 0, 0, 0);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);

      if (logDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return sendSuccess(res, {
      last_weight: lastWeight,
      first_weight: firstWeight,
      total_change: totalChange !== null ? parseFloat(totalChange.toFixed(2)) : null,
      total_change_direction: totalChange !== null ? (totalChange < 0 ? 'down' : totalChange > 0 ? 'up' : 'stable') : null,
      streak,
      total_logs: logs.length,
      last_log_date: logs[0].log_date,
    }, 'Estadísticas de progreso');

  } catch (err) {
    logger.error('[progress] getProgressStats error:', err);
    return sendServerError(res);
  }
}

module.exports = { getProgress, createProgress, getProgressStats };
