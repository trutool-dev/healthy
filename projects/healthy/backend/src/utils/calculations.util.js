/**
 * calculations.util.js
 * Utilidades para cálculos nutricionales y de composición corporal.
 *
 * Fórmula TMB: Mifflin-St Jeor (la más precisa en población general)
 *   Hombre: 10×peso(kg) + 6.25×altura(cm) − 5×edad(años) + 5
 *   Mujer:  10×peso(kg) + 6.25×altura(cm) − 5×edad(años) − 161
 */

/** Sexo biológico aceptado por la fórmula */
const SEX = { MALE: 'male', FEMALE: 'female' };

/** Multiplicadores de actividad (Ainsworth et al.) */
const ACTIVITY_MULTIPLIERS = {
  sedentary:   1.2,    // Poco o ningún ejercicio
  light:       1.375,  // Ejercicio ligero 1-3 días/semana
  moderate:    1.55,   // Ejercicio moderado 3-5 días/semana
  active:      1.725,  // Ejercicio intenso 6-7 días/semana
  very_active: 1.9,    // Trabajo físico muy duro o doble sesión diaria
};

/** Ajuste calórico según objetivo */
const GOAL_MULTIPLIERS = {
  lose_weight:    0.80,  // Déficit del 20 %
  gain_muscle:    1.10,  // Superávit del 10 %
  maintenance:    1.00,
  general_health: 1.00,
};

/** Proteína objetivo en g/kg de peso corporal según objetivo */
const PROTEIN_PER_KG = {
  lose_weight:    2.0,
  gain_muscle:    2.2,
  maintenance:    1.8,
  general_health: 1.6,
};

/** Calorías mínimas de seguridad */
const MIN_CALORIES = {
  male:   1500,
  female: 1200,
};

/** Porcentaje de calorías destinadas a grasa */
const FAT_CALORIES_RATIO = 0.30;

/**
 * Calcula la Tasa Metabólica Basal (TMB) con la ecuación de Mifflin-St Jeor.
 *
 * @param {Object} params
 * @param {number} params.weight  - Peso en kg
 * @param {number} params.height  - Altura en cm
 * @param {number} params.age     - Edad en años
 * @param {'male'|'female'} params.sex - Sexo biológico
 * @returns {number} TMB redondeada al entero más cercano (kcal/día)
 * @throws {Error} Si algún parámetro es inválido
 */
function calculateTMB({ weight, height, age, sex }) {
  if (!weight || weight <= 0) throw new Error('El peso debe ser un número positivo');
  if (!height || height <= 0) throw new Error('La altura debe ser un número positivo');
  if (!age || age <= 0)       throw new Error('La edad debe ser un número positivo');
  if (sex !== SEX.MALE && sex !== SEX.FEMALE) {
    throw new Error('El sexo debe ser "male" o "female"');
  }

  const base = 10 * weight + 6.25 * height - 5 * age;
  const constant = sex === SEX.MALE ? 5 : -161;
  return Math.round(base + constant);
}

/**
 * Calcula el Gasto Energético Total Diario (TDEE).
 *
 * @param {number} tmb              - TMB en kcal/día
 * @param {string} activityLevel    - Nivel de actividad (ver ACTIVITY_MULTIPLIERS)
 * @returns {number} TDEE redondeado al entero más cercano (kcal/día)
 * @throws {Error} Si el nivel de actividad no es válido
 */
function calculateTDEE(tmb, activityLevel) {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel];
  if (!multiplier) {
    throw new Error(
      `Nivel de actividad inválido: "${activityLevel}". ` +
      `Valores permitidos: ${Object.keys(ACTIVITY_MULTIPLIERS).join(', ')}`
    );
  }
  return Math.round(tmb * multiplier);
}

/**
 * Calcula el objetivo calórico diario ajustado al meta del usuario,
 * respetando los mínimos de seguridad.
 *
 * @param {number} tdee             - TDEE en kcal/día
 * @param {string} goal             - Objetivo (ver GOAL_MULTIPLIERS)
 * @param {'male'|'female'} sex     - Sexo biológico (para aplicar el mínimo correcto)
 * @returns {number} Calorías objetivo redondeadas (kcal/día)
 * @throws {Error} Si el objetivo no es válido
 */
function calculateTargetCalories(tdee, goal, sex) {
  const multiplier = GOAL_MULTIPLIERS[goal];
  if (multiplier === undefined) {
    throw new Error(
      `Objetivo inválido: "${goal}". ` +
      `Valores permitidos: ${Object.keys(GOAL_MULTIPLIERS).join(', ')}`
    );
  }
  const raw = Math.round(tdee * multiplier);
  const minCalories = MIN_CALORIES[sex] ?? MIN_CALORIES.female;
  return Math.max(raw, minCalories);
}

/**
 * Distribuye las calorías objetivo en macronutrientes.
 *
 * Estrategia:
 *  1. Proteína fijada por g/kg según objetivo
 *  2. Grasa = 30 % de las calorías objetivo
 *  3. Carbohidratos = calorías restantes
 *
 * @param {Object} params
 * @param {number} params.targetCalories - Calorías objetivo (kcal/día)
 * @param {number} params.weight         - Peso en kg
 * @param {string} params.goal           - Objetivo nutricional
 * @returns {{ protein: number, fat: number, carbs: number }} Gramos de cada macro
 * @throws {Error} Si los parámetros son inválidos
 */
function calculateMacros({ targetCalories, weight, goal }) {
  if (!targetCalories || targetCalories <= 0) {
    throw new Error('Las calorías objetivo deben ser un número positivo');
  }
  if (!weight || weight <= 0) {
    throw new Error('El peso debe ser un número positivo');
  }
  if (!PROTEIN_PER_KG[goal]) {
    throw new Error(`Objetivo inválido: "${goal}"`);
  }

  const proteinG  = Math.round(PROTEIN_PER_KG[goal] * weight);
  const fatG      = Math.round((targetCalories * FAT_CALORIES_RATIO) / 9);
  const proteinKcal = proteinG * 4;
  const fatKcal     = fatG * 9;
  const carbsKcal   = targetCalories - proteinKcal - fatKcal;
  const carbsG      = Math.round(Math.max(carbsKcal, 0) / 4);

  return { protein: proteinG, fat: fatG, carbs: carbsG };
}

/**
 * Calcula el plan nutricional completo de un usuario en un solo paso.
 *
 * @param {Object} profile
 * @param {number} profile.weight        - Peso en kg
 * @param {number} profile.height        - Altura en cm
 * @param {number} profile.age           - Edad en años
 * @param {'male'|'female'} profile.sex  - Sexo biológico
 * @param {string} profile.activityLevel - Nivel de actividad
 * @param {string} profile.goal          - Objetivo
 * @returns {{ tmb: number, tdee: number, targetCalories: number, macros: Object }}
 */
function calculateNutritionPlan(profile) {
  const tmb            = calculateTMB(profile);
  const tdee           = calculateTDEE(tmb, profile.activityLevel);
  const targetCalories = calculateTargetCalories(tdee, profile.goal, profile.sex);
  const macros         = calculateMacros({ targetCalories, weight: profile.weight, goal: profile.goal });

  return { tmb, tdee, targetCalories, macros };
}

module.exports = {
  calculateTMB,
  calculateTDEE,
  calculateTargetCalories,
  calculateMacros,
  calculateNutritionPlan,
  ACTIVITY_MULTIPLIERS,
  GOAL_MULTIPLIERS,
  MIN_CALORIES,
};
