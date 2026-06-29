/**
 * Middleware de validación con Zod.
 * Recibe un schema Zod y valida req.body (o req.query, req.params).
 * Devuelve 422 con los errores si la validación falla.
 */

const { z } = require('zod');
const { sendValidationError } = require('../utils/response');

/**
 * Factory que devuelve un middleware validador para el schema dado.
 *
 * @param {z.ZodSchema} schema - Schema Zod a validar
 * @param {'body'|'query'|'params'} source - Fuente del request a validar (default: 'body')
 * @returns Express middleware
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return sendValidationError(res, errors, 'Los datos enviados no son válidos');
    }

    // Reemplazar la fuente con los datos parseados (incluye defaults de Zod)
    req[source] = result.data;
    next();
  };
}

module.exports = { validate };

// ─────────────────────────────────────────────────────────────
// SCHEMAS ZOD COMPARTIDOS
// ─────────────────────────────────────────────────────────────

const { z: zod } = require('zod');

const registerSchema = zod.object({
  email: zod.string().email('Email inválido'),
  phone_number: zod.string().optional(),
});

const verifyEmailSchema = zod.object({
  email: zod.string().email('Email inválido'),
  code: zod.string().length(6, 'El código debe tener 6 dígitos'),
});

const setPasswordSchema = zod.object({
  email: zod.string().email('Email inválido'),
  password: zod.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

const loginSchema = zod.object({
  email: zod.string().email('Email inválido'),
  password: zod.string().min(1, 'La contraseña es obligatoria'),
});

const forgotPasswordSchema = zod.object({
  email: zod.string().email('Email inválido'),
});

const resetPasswordSchema = zod.object({
  token: zod.string().uuid('Token inválido'),
  password: zod.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

const refreshTokenSchema = zod.object({
  refresh_token: zod.string().min(1, 'Refresh token requerido'),
});

const onboardingProfileSchema = zod.object({
  name: zod.string().min(1, 'El nombre es obligatorio'),
  birthdate: zod.string().refine(v => !isNaN(Date.parse(v)), 'Fecha de nacimiento inválida'),
  gender: zod.enum(['male', 'female']).optional(),
  weight_kg: zod.number().positive().optional(),
  height_cm: zod.number().positive().optional(),
  body_type: zod.enum(['ectomorph', 'mesomorph', 'endomorph']).optional(),
  activity_level: zod.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']).optional(),
  goal: zod.enum(['lose_weight', 'gain_muscle', 'maintain', 'general_health']).optional(),
});

const onboardingLifestyleSchema = zod.object({
  profession: zod.string().optional(),
  work_type: zod.enum(['office', 'physical', 'standing', 'mixed']).optional(),
  work_hours_per_day: zod.number().int().min(0).max(24).optional(),
  stress_level: zod.number().int().min(1).max(5).optional(),
  usual_schedule: zod.enum(['morning', 'afternoon', 'night']).optional(),
  sleep_hours_usual: zod.number().min(0).max(24).optional(),
  sleep_quality: zod.enum(['good', 'regular', 'bad']).optional(),
  alcohol_consumption: zod.enum(['never', 'occasional', 'frequent']).optional(),
  smoker: zod.boolean().optional(),
  daily_water_glasses: zod.number().int().min(0).optional(),
});

const onboardingTrainingSchema = zod.object({
  available_days_per_week: zod.number().int().min(1).max(7),
  max_session_duration_minutes: zod.number().int().positive().optional(),
  preferred_training_time: zod.enum(['morning', 'afternoon', 'night']).optional(),
  has_gym_access: zod.boolean().default(false),
  home_equipment: zod.enum(['none', 'dumbbells', 'bands', 'machines', 'full']).optional(),
  experience_level: zod.enum(['beginner', 'intermediate', 'advanced']).optional(),
  injuries_or_limitations: zod.string().optional(),
});

const onboardingNutritionSchema = zod.object({
  diet_type: zod.enum(['omnivore', 'vegetarian', 'vegan', 'gluten_free', 'lactose_free']).optional(),
  meals_per_day_preferred: zod.number().int().min(1).max(8).optional(),
  cooks_at_home: zod.boolean().optional(),
  eats_out_frequency: zod.enum(['never', 'sometimes', 'often', 'always']).optional(),
  monthly_food_budget_range: zod.enum(['low', 'medium', 'high']).optional(),
});

const onboardingHealthSchema = zod.object({
  conditions: zod.array(zod.object({
    condition_name: zod.string().min(1),
    condition_type: zod.enum(['injury', 'disease', 'medication']),
    affects_training: zod.boolean().default(false),
    affects_nutrition: zod.boolean().default(false),
    notes: zod.string().optional(),
  })).optional(),
  food_restrictions: zod.array(zod.object({
    restriction_type: zod.enum(['allergy', 'intolerance', 'dislike']),
    food_name: zod.string().min(1),
    severity: zod.enum(['mild', 'moderate', 'severe']),
  })).optional(),
});

const onboardingMotivationSchema = zod.object({
  main_motivation: zod.enum(['health', 'aesthetics', 'performance', 'mental_wellbeing']).optional(),
  previous_attempts: zod.boolean().optional(),
  previous_attempts_notes: zod.string().optional(),
  tracking_preference: zod.enum(['detailed', 'basic', 'results_only']).optional(),
  has_support_network: zod.boolean().optional(),
});

const progressSchema = zod.object({
  log_date: zod.string().refine(v => !isNaN(Date.parse(v)), 'Fecha inválida'),
  weight_kg: zod.number().positive().optional(),
  body_fat_percentage: zod.number().min(0).max(100).optional(),
  muscle_mass_kg: zod.number().positive().optional(),
  waist_cm: zod.number().positive().optional(),
  hip_cm: zod.number().positive().optional(),
  chest_cm: zod.number().positive().optional(),
  notes: zod.string().optional(),
  photo_url: zod.string().url().optional(),
});

const dailyLogSchema = zod.object({
  water_ml: zod.number().int().min(0).optional(),
  sleep_hours: zod.number().min(0).max(24).optional(),
  sleep_quality: zod.number().int().min(1).max(5).optional(),
  energy_level: zod.number().int().min(1).max(5).optional(),
  mood: zod.number().int().min(1).max(5).optional(),
  steps: zod.number().int().min(0).optional(),
});

const exerciseSetsSchema = zod.object({
  weight_kg: zod.number().positive().optional(),
  reps: zod.number().int().positive(),
  notes: zod.string().optional(),
});

module.exports = {
  validate,
  schemas: {
    registerSchema,
    verifyEmailSchema,
    setPasswordSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    refreshTokenSchema,
    onboardingProfileSchema,
    onboardingLifestyleSchema,
    onboardingTrainingSchema,
    onboardingNutritionSchema,
    onboardingHealthSchema,
    onboardingMotivationSchema,
    progressSchema,
    dailyLogSchema,
    exerciseSetsSchema,
  },
};
