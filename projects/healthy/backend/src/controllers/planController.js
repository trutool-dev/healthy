/**
 * Controlador de planes (BE-02 / plans routes).
 * GET /plans — plan activo
 * GET /plans/:id — plan concreto
 * POST /plans/regenerate — regenerar plan con IA
 * PUT /plans/:id/pause — pausar plan
 */

const prisma = require('../utils/prismaClient');
const { regeneratePlan, calculateMetabolism } = require('../services/aiService');
const {
  sendSuccess,
  sendNotFound,
  sendError,
  sendServerError,
} = require('../utils/response');
const logger = require('../utils/logger');

// GET /plans — Plan activo del usuario
async function getActivePlan(req, res) {
  try {
    const userId = req.user.id;

    const plan = await prisma.plan.findFirst({
      where: { user_id: userId, status: 'active' },
      include: {
        training_sessions: {
          orderBy: { scheduled_date: 'asc' },
          take: 30, // Próximas 30 sesiones
        },
        meals: {
          where: {
            scheduled_date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lte: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    if (!plan) {
      return sendNotFound(res, 'No tienes un plan activo. Completa el onboarding primero.');
    }

    return sendSuccess(res, { plan }, 'Plan activo');

  } catch (err) {
    logger.error('[plan] getActivePlan error:', err);
    return sendServerError(res);
  }
}

// GET /plans/:id — Plan concreto
async function getPlanById(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const plan = await prisma.plan.findFirst({
      where: { id, user_id: userId },
      include: {
        training_sessions: {
          orderBy: { scheduled_date: 'asc' },
          include: {
            session_exercises: {
              include: { exercise: true },
              orderBy: { order_index: 'asc' },
            },
          },
        },
        meals: {
          orderBy: { scheduled_date: 'asc' },
          include: { meal_foods: { include: { food: true } } },
        },
      },
    });

    if (!plan) {
      return sendNotFound(res, 'Plan no encontrado');
    }

    return sendSuccess(res, { plan }, 'Plan');

  } catch (err) {
    logger.error('[plan] getPlanById error:', err);
    return sendServerError(res);
  }
}

// POST /plans/regenerate — Regenerar plan con IA
async function regenerate(req, res) {
  try {
    const userId = req.user.id;
    const { reason = 'manual_request' } = req.body;

    // Cargar datos del usuario
    const [profile, lifestyle, training, nutrition, healthConditions, foodRestrictions, motivation, progressLogs] = await Promise.all([
      prisma.profile.findUnique({ where: { user_id: userId } }),
      prisma.lifestyleProfile.findUnique({ where: { user_id: userId } }),
      prisma.trainingPreferences.findUnique({ where: { user_id: userId } }),
      prisma.nutritionPreferences.findUnique({ where: { user_id: userId } }),
      prisma.healthCondition.findMany({ where: { user_id: userId } }),
      prisma.foodRestriction.findMany({ where: { user_id: userId } }),
      prisma.motivationProfile.findUnique({ where: { user_id: userId } }),
      prisma.progressLog.findMany({
        where: { user_id: userId },
        orderBy: { log_date: 'desc' },
        take: 30,
      }),
    ]);

    if (!profile || !training) {
      return sendError(res, 'ONBOARDING_INCOMPLETE', 'Debes completar el onboarding primero', 400);
    }

    const birthdate = new Date(profile.birthdate);
    const age = new Date().getFullYear() - birthdate.getFullYear();

    const onboardingData = {
      physical: {
        age,
        weight_kg: parseFloat(profile.weight_kg) || 70,
        height_cm: parseFloat(profile.height_cm) || 170,
        gender: profile.gender || 'male',
        body_type: profile.body_type,
        activity_level: profile.activity_level || 'moderate',
        goal: profile.goal || 'general_health',
      },
      lifestyle: lifestyle || undefined,
      training: {
        available_days_per_week: training.available_days_per_week,
        max_session_duration_minutes: training.max_session_duration_minutes,
        has_gym_access: training.has_gym_access,
        home_equipment: training.home_equipment,
        experience_level: training.experience_level || 'beginner',
        injuries_or_limitations: training.injuries_or_limitations,
      },
      nutrition: nutrition ? {
        diet_type: nutrition.diet_type,
        meals_per_day_preferred: nutrition.meals_per_day_preferred,
        food_restrictions: foodRestrictions.map(r => ({
          restriction_type: r.restriction_type,
          food_name: r.food_name,
        })),
      } : undefined,
      health: healthConditions.length > 0 ? { conditions: healthConditions } : undefined,
      motivation: motivation || undefined,
    };

    const newPlan = await regeneratePlan(userId, onboardingData, reason, progressLogs);

    // Pausar el plan activo actual
    await prisma.plan.updateMany({
      where: { user_id: userId, status: 'active' },
      data: { status: 'paused' },
    });

    // Crear nuevo plan en DB
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (newPlan.training_plan.weeks * 7));

    const savedPlan = await prisma.plan.create({
      data: {
        user_id: userId,
        type: 'combined',
        start_date: startDate,
        end_date: endDate,
        status: 'active',
        generated_by_ai: newPlan.generated_by_ai,
        ai_model_version: newPlan.model_version,
        ai_prompt_used: reason,
      },
    });

    return sendSuccess(res, {
      plan_id: savedPlan.id,
      generated_plan: newPlan,
    }, 'Plan regenerado correctamente');

  } catch (err) {
    logger.error('[plan] regenerate error:', err);
    return sendServerError(res);
  }
}

// PUT /plans/:id/pause — Pausar plan
async function pausePlan(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const plan = await prisma.plan.findFirst({ where: { id, user_id: userId } });
    if (!plan) {
      return sendNotFound(res, 'Plan no encontrado');
    }

    if (plan.status === 'paused') {
      return sendError(res, 'PLAN_ALREADY_PAUSED', 'El plan ya está pausado', 400);
    }

    await prisma.plan.update({
      where: { id },
      data: { status: 'paused' },
    });

    return sendSuccess(res, {}, 'Plan pausado correctamente');

  } catch (err) {
    logger.error('[plan] pausePlan error:', err);
    return sendServerError(res);
  }
}

module.exports = { getActivePlan, getPlanById, regenerate, pausePlan };
