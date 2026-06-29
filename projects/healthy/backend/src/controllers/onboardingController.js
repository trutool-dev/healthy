/**
 * Controlador de onboarding (BE-02).
 * Gestiona los pasos del onboarding y la generación del plan inicial con IA.
 */

const prisma = require('../utils/prismaClient');
const { generatePlan, calculateMetabolism } = require('../services/aiService');
const { invalidateUserCache } = require('../services/cacheService');
const {
  sendSuccess,
  sendError,
  sendNotFound,
  sendServerError,
} = require('../utils/response');
const logger = require('../utils/logger');

// ─────────────────────────────────────────────────────────────
// PUT /onboarding/profile — Paso 2: Perfil físico
// ─────────────────────────────────────────────────────────────

async function saveProfile(req, res) {
  try {
    const userId = req.user.id;
    const {
      name, birthdate, gender, weight_kg, height_cm,
      body_type, activity_level, goal,
    } = req.body;

    const profile = await prisma.profile.upsert({
      where: { user_id: userId },
      create: {
        user_id: userId,
        name,
        birthdate: new Date(birthdate),
        gender,
        weight_kg,
        height_cm,
        body_type,
        activity_level,
        goal,
      },
      update: {
        name,
        birthdate: new Date(birthdate),
        gender,
        weight_kg,
        height_cm,
        body_type,
        activity_level,
        goal,
      },
    });

    await invalidateUserCache(userId);
    return sendSuccess(res, { profile }, 'Perfil guardado correctamente');

  } catch (err) {
    logger.error('[onboarding] saveProfile error:', err);
    return sendServerError(res);
  }
}

// ─────────────────────────────────────────────────────────────
// PUT /onboarding/lifestyle — Paso 3: Estilo de vida
// ─────────────────────────────────────────────────────────────

async function saveLifestyle(req, res) {
  try {
    const userId = req.user.id;
    const {
      profession, work_type, work_hours_per_day, stress_level,
      usual_schedule, sleep_hours_usual, sleep_quality,
      alcohol_consumption, smoker, daily_water_glasses,
    } = req.body;

    const lifestyle = await prisma.lifestyleProfile.upsert({
      where: { user_id: userId },
      create: { user_id: userId, profession, work_type, work_hours_per_day, stress_level, usual_schedule, sleep_hours_usual, sleep_quality, alcohol_consumption, smoker, daily_water_glasses },
      update: { profession, work_type, work_hours_per_day, stress_level, usual_schedule, sleep_hours_usual, sleep_quality, alcohol_consumption, smoker, daily_water_glasses },
    });

    return sendSuccess(res, { lifestyle }, 'Estilo de vida guardado correctamente');

  } catch (err) {
    logger.error('[onboarding] saveLifestyle error:', err);
    return sendServerError(res);
  }
}

// ─────────────────────────────────────────────────────────────
// PUT /onboarding/training — Paso 4: Entrenamiento
// ─────────────────────────────────────────────────────────────

async function saveTraining(req, res) {
  try {
    const userId = req.user.id;
    const {
      available_days_per_week, max_session_duration_minutes,
      preferred_training_time, has_gym_access, home_equipment,
      experience_level, injuries_or_limitations,
    } = req.body;

    const training = await prisma.trainingPreferences.upsert({
      where: { user_id: userId },
      create: { user_id: userId, available_days_per_week, max_session_duration_minutes, preferred_training_time, has_gym_access: has_gym_access ?? false, home_equipment, experience_level, injuries_or_limitations },
      update: { available_days_per_week, max_session_duration_minutes, preferred_training_time, has_gym_access: has_gym_access ?? false, home_equipment, experience_level, injuries_or_limitations },
    });

    return sendSuccess(res, { training }, 'Preferencias de entrenamiento guardadas correctamente');

  } catch (err) {
    logger.error('[onboarding] saveTraining error:', err);
    return sendServerError(res);
  }
}

// ─────────────────────────────────────────────────────────────
// PUT /onboarding/nutrition — Paso 5: Nutrición
// ─────────────────────────────────────────────────────────────

async function saveNutrition(req, res) {
  try {
    const userId = req.user.id;
    const {
      diet_type, meals_per_day_preferred, cooks_at_home,
      eats_out_frequency, monthly_food_budget_range,
    } = req.body;

    const nutrition = await prisma.nutritionPreferences.upsert({
      where: { user_id: userId },
      create: { user_id: userId, diet_type, meals_per_day_preferred, cooks_at_home, eats_out_frequency, monthly_food_budget_range },
      update: { diet_type, meals_per_day_preferred, cooks_at_home, eats_out_frequency, monthly_food_budget_range },
    });

    return sendSuccess(res, { nutrition }, 'Preferencias nutricionales guardadas correctamente');

  } catch (err) {
    logger.error('[onboarding] saveNutrition error:', err);
    return sendServerError(res);
  }
}

// ─────────────────────────────────────────────────────────────
// PUT /onboarding/health — Paso 6: Salud
// ─────────────────────────────────────────────────────────────

async function saveHealth(req, res) {
  try {
    const userId = req.user.id;
    const { conditions = [], food_restrictions = [] } = req.body;

    // Reemplazar condiciones de salud
    if (conditions.length > 0) {
      await prisma.healthCondition.deleteMany({ where: { user_id: userId } });
      await prisma.healthCondition.createMany({
        data: conditions.map(c => ({ ...c, user_id: userId })),
      });
    }

    // Reemplazar restricciones alimentarias
    if (food_restrictions.length > 0) {
      await prisma.foodRestriction.deleteMany({ where: { user_id: userId } });
      await prisma.foodRestriction.createMany({
        data: food_restrictions.map(r => ({ ...r, user_id: userId })),
      });
    }

    return sendSuccess(res, {}, 'Condiciones de salud guardadas correctamente');

  } catch (err) {
    logger.error('[onboarding] saveHealth error:', err);
    return sendServerError(res);
  }
}

// ─────────────────────────────────────────────────────────────
// PUT /onboarding/motivation — Paso 7: Motivación
// ─────────────────────────────────────────────────────────────

async function saveMotivation(req, res) {
  try {
    const userId = req.user.id;
    const {
      main_motivation, previous_attempts, previous_attempts_notes,
      tracking_preference, has_support_network,
    } = req.body;

    const motivation = await prisma.motivationProfile.upsert({
      where: { user_id: userId },
      create: { user_id: userId, main_motivation, previous_attempts, previous_attempts_notes, tracking_preference, has_support_network },
      update: { main_motivation, previous_attempts, previous_attempts_notes, tracking_preference, has_support_network },
    });

    return sendSuccess(res, { motivation }, 'Perfil de motivación guardado correctamente');

  } catch (err) {
    logger.error('[onboarding] saveMotivation error:', err);
    return sendServerError(res);
  }
}

// ─────────────────────────────────────────────────────────────
// POST /onboarding/complete — Finalizar y generar plan
// ─────────────────────────────────────────────────────────────

async function complete(req, res) {
  try {
    const userId = req.user.id;
    const answers = req.body.answers || []; // Array de { question_key, answer_value, question_category }

    // Cargar todos los datos del usuario para generar el plan
    const [profile, lifestyle, training, nutrition, healthConditions, foodRestrictions, motivation] = await Promise.all([
      prisma.profile.findUnique({ where: { user_id: userId } }),
      prisma.lifestyleProfile.findUnique({ where: { user_id: userId } }),
      prisma.trainingPreferences.findUnique({ where: { user_id: userId } }),
      prisma.nutritionPreferences.findUnique({ where: { user_id: userId } }),
      prisma.healthCondition.findMany({ where: { user_id: userId } }),
      prisma.foodRestriction.findMany({ where: { user_id: userId } }),
      prisma.motivationProfile.findUnique({ where: { user_id: userId } }),
    ]);

    if (!profile) {
      return sendError(res, 'PROFILE_REQUIRED', 'Debes completar tu perfil físico antes de generar el plan', 400);
    }

    if (!training) {
      return sendError(res, 'TRAINING_REQUIRED', 'Debes completar tus preferencias de entrenamiento antes de generar el plan', 400);
    }

    // Guardar respuestas del onboarding si se proporcionan
    if (answers.length > 0) {
      await prisma.onboardingAnswer.deleteMany({ where: { user_id: userId } });
      await prisma.onboardingAnswer.createMany({
        data: answers.map(a => ({ ...a, user_id: userId })),
      });
    }

    // Calcular TMB/TDEE con Mifflin-St Jeor
    const birthdate = new Date(profile.birthdate);
    const today = new Date();
    const age = today.getFullYear() - birthdate.getFullYear();

    const physicalProfile = {
      age,
      weight_kg: parseFloat(profile.weight_kg) || 70,
      height_cm: parseFloat(profile.height_cm) || 170,
      gender: profile.gender || 'male',
      body_type: profile.body_type,
      activity_level: profile.activity_level || 'moderate',
      goal: profile.goal || 'general_health',
    };

    const metabolism = calculateMetabolism(physicalProfile);

    // Actualizar targets en el perfil
    const macros = calculateMacros(metabolism.target_calories, physicalProfile.goal);
    await prisma.profile.update({
      where: { user_id: userId },
      data: {
        daily_calories_target: metabolism.target_calories,
        daily_protein_target: macros.protein_g,
        daily_carbs_target: macros.carbs_g,
        daily_fat_target: macros.fat_g,
      },
    });

    // Construir objeto onboardingData para el generador de plan
    const onboardingData = {
      physical: physicalProfile,
      lifestyle: lifestyle ? {
        profession: lifestyle.profession,
        work_hours_per_day: lifestyle.work_hours_per_day,
        stress_level: lifestyle.stress_level,
        usual_schedule: lifestyle.usual_schedule,
        sleep_hours_usual: lifestyle.sleep_hours_usual ? parseFloat(lifestyle.sleep_hours_usual) : undefined,
        sleep_quality: lifestyle.sleep_quality,
        alcohol_consumption: lifestyle.alcohol_consumption,
        smoker: lifestyle.smoker,
      } : undefined,
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
      health: healthConditions.length > 0 ? {
        conditions: healthConditions.map(c => ({
          condition_name: c.condition_name,
          condition_type: c.condition_type,
          affects_training: c.affects_training,
          affects_nutrition: c.affects_nutrition,
          notes: c.notes,
        })),
      } : undefined,
      motivation: motivation ? {
        main_motivation: motivation.main_motivation,
        previous_attempts: motivation.previous_attempts,
        previous_attempts_notes: motivation.previous_attempts_notes,
        tracking_preference: motivation.tracking_preference,
      } : undefined,
    };

    // Generar plan con IA (con fallback automático)
    const generatedPlan = await generatePlan(userId, onboardingData);

    // Guardar el plan en la base de datos
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (generatedPlan.training_plan.weeks * 7));

    // Desactivar planes activos previos
    await prisma.plan.updateMany({
      where: { user_id: userId, status: 'active' },
      data: { status: 'completed' },
    });

    const plan = await prisma.plan.create({
      data: {
        user_id: userId,
        type: 'combined',
        start_date: startDate,
        end_date: endDate,
        status: 'active',
        generated_by_ai: generatedPlan.generated_by_ai,
        ai_model_version: generatedPlan.model_version,
        ai_prompt_used: generatedPlan.generated_by_ai ? 'onboarding_complete' : null,
      },
    });

    // Guardar sesiones de entrenamiento del plan
    const trainingSessions = [];
    const weeklySchedule = generatedPlan.training_plan.weekly_schedule;
    const totalWeeks = generatedPlan.training_plan.weeks;

    for (let week = 0; week < totalWeeks; week++) {
      for (const daySession of weeklySchedule) {
        if (daySession.session_type === 'rest') continue;

        const sessionDate = new Date(startDate);
        // Calcular fecha: semana + día de la semana (1=lunes)
        sessionDate.setDate(startDate.getDate() + (week * 7) + (daySession.day_of_week - 1));

        trainingSessions.push({
          plan_id: plan.id,
          user_id: userId,
          scheduled_date: sessionDate,
          status: 'scheduled',
          notes: daySession.notes || null,
        });
      }
    }

    if (trainingSessions.length > 0) {
      await prisma.trainingSession.createMany({ data: trainingSessions });
    }

    // Guardar comidas del plan (primera semana como referencia)
    const meals = [];
    const mealSuggestions = generatedPlan.nutrition_plan.meal_suggestions;

    for (let day = 0; day < 7; day++) {
      const mealDate = new Date(startDate);
      mealDate.setDate(startDate.getDate() + day);

      for (const suggestion of mealSuggestions) {
        meals.push({
          plan_id: plan.id,
          user_id: userId,
          meal_type: suggestion.meal_type,
          scheduled_date: mealDate,
          calories: suggestion.approximate_calories,
          protein_g: suggestion.protein_g,
          carbs_g: suggestion.carbs_g,
          fat_g: suggestion.fat_g,
          status: 'scheduled',
        });
      }
    }

    if (meals.length > 0) {
      await prisma.meal.createMany({ data: meals });
    }

    logger.info(`[onboarding] Onboarding completado para usuario ${userId}. Plan ${plan.id} creado.`);
    return sendSuccess(res, {
      plan: {
        id: plan.id,
        status: plan.status,
        start_date: plan.start_date,
        end_date: plan.end_date,
        generated_by_ai: plan.generated_by_ai,
      },
      generated_plan: generatedPlan,
      metabolism,
    }, 'Onboarding completado. Tu plan personalizado ha sido generado.');

  } catch (err) {
    logger.error('[onboarding] complete error:', err);
    return sendServerError(res);
  }
}

// Helper para calcular macros (igual que en aiService.js)
function calculateMacros(dailyCalories, goal) {
  const ratios = {
    lose_weight:    [0.35, 0.35, 0.30],
    gain_muscle:    [0.30, 0.45, 0.25],
    maintain:       [0.25, 0.50, 0.25],
    general_health: [0.25, 0.50, 0.25],
  };
  const [proteinRatio, carbsRatio, fatRatio] = ratios[goal] || ratios.general_health;
  return {
    protein_g: Math.round((dailyCalories * proteinRatio) / 4),
    carbs_g:   Math.round((dailyCalories * carbsRatio) / 4),
    fat_g:     Math.round((dailyCalories * fatRatio) / 9),
  };
}

module.exports = {
  saveProfile,
  saveLifestyle,
  saveTraining,
  saveNutrition,
  saveHealth,
  saveMotivation,
  complete,
};
