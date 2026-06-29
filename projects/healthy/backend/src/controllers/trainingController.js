/**
 * Controlador de entrenamiento (BE-03).
 * GET /training/today
 * GET /training/sessions/:id
 * PUT /training/sessions/:id/complete
 * POST /training/sessions/:id/exercises/:exerciseId/sets
 */

const prisma = require('../utils/prismaClient');
const {
  sendSuccess,
  sendNotFound,
  sendError,
  sendServerError,
} = require('../utils/response');
const logger = require('../utils/logger');

// GET /training/today — Sesión programada para hoy
async function getTodaySession(req, res) {
  try {
    const userId = req.user.id;
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const session = await prisma.trainingSession.findFirst({
      where: {
        user_id: userId,
        scheduled_date: { gte: startOfDay, lte: endOfDay },
        status: 'scheduled',
      },
      include: {
        session_exercises: {
          include: { exercise: true },
          orderBy: { order_index: 'asc' },
        },
      },
    });

    if (!session) {
      return sendSuccess(res, { session: null }, 'No hay sesión programada para hoy');
    }

    return sendSuccess(res, { session }, 'Sesión de hoy');

  } catch (err) {
    logger.error('[training] getTodaySession error:', err);
    return sendServerError(res);
  }
}

// GET /training/sessions/:id — Detalle de sesión
async function getSessionById(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const session = await prisma.trainingSession.findFirst({
      where: { id, user_id: userId },
      include: {
        session_exercises: {
          include: { exercise: true },
          orderBy: { order_index: 'asc' },
        },
        plan: { select: { id: true, status: true } },
      },
    });

    if (!session) {
      return sendNotFound(res, 'Sesión no encontrada');
    }

    return sendSuccess(res, { session }, 'Detalle de sesión');

  } catch (err) {
    logger.error('[training] getSessionById error:', err);
    return sendServerError(res);
  }
}

// PUT /training/sessions/:id/complete — Marcar sesión completada
async function completeSession(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { duration_minutes, calories_burned, notes } = req.body;

    const session = await prisma.trainingSession.findFirst({
      where: { id, user_id: userId },
    });

    if (!session) {
      return sendNotFound(res, 'Sesión no encontrada');
    }

    if (session.status === 'completed') {
      return sendError(res, 'SESSION_ALREADY_COMPLETED', 'Esta sesión ya fue completada', 400);
    }

    const updated = await prisma.trainingSession.update({
      where: { id },
      data: {
        status: 'completed',
        completed_at: new Date(),
        duration_minutes: duration_minutes || null,
        calories_burned: calories_burned || null,
        notes: notes || null,
      },
    });

    return sendSuccess(res, { session: updated }, 'Sesión completada correctamente');

  } catch (err) {
    logger.error('[training] completeSession error:', err);
    return sendServerError(res);
  }
}

// POST /training/sessions/:id/exercises/:exerciseId/sets — Registrar serie
async function addExerciseSet(req, res) {
  try {
    const userId = req.user.id;
    const { id: sessionId, exerciseId } = req.params;
    const { weight_kg, reps } = req.body;

    // Verificar que la sesión pertenece al usuario
    const session = await prisma.trainingSession.findFirst({
      where: { id: sessionId, user_id: userId },
    });

    if (!session) {
      return sendNotFound(res, 'Sesión no encontrada');
    }

    // Buscar el session_exercise correspondiente
    const sessionExercise = await prisma.sessionExercise.findFirst({
      where: { session_id: sessionId, exercise_id: exerciseId },
    });

    if (!sessionExercise) {
      return sendNotFound(res, 'Ejercicio no encontrado en esta sesión');
    }

    // Actualizar el ejercicio con el peso y reps registrados
    const updated = await prisma.sessionExercise.update({
      where: { id: sessionExercise.id },
      data: {
        weight_kg: weight_kg || null,
        reps: reps || sessionExercise.reps,
        completed: true,
      },
    });

    return sendSuccess(res, { session_exercise: updated }, 'Serie registrada correctamente');

  } catch (err) {
    logger.error('[training] addExerciseSet error:', err);
    return sendServerError(res);
  }
}

module.exports = {
  getTodaySession,
  getSessionById,
  completeSession,
  addExerciseSet,
};
