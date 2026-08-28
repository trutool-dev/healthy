'use strict';

/**
 * Tests unitarios para aiService.js — funciones relacionadas con ejercicios.
 * Cubre: comportamiento de buildUserContextPrompt y formatExercisesForPrompt
 * (funciones privadas del módulo) accedidas indirectamente a través de generatePlan,
 * verificando que el prompt enviado a Claude incluye/excluye el catálogo correctamente.
 *
 * Nota: buildUserContextPrompt y formatExercisesForPrompt NO son exportadas por aiService.js,
 * por lo que se testean de forma comportamental vía generatePlan con el cliente Anthropic mockeado.
 */

// ─── Mock de Redis (silencia warnings de conexión) ────────────────────────────
jest.mock('../../backend/src/services/redis.service', () => ({
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue('OK'),
  del: jest.fn().mockResolvedValue(1),
  ping: jest.fn().mockResolvedValue('PONG'),
  disconnect: jest.fn(),
}));

// ─── Mock de logger ───────────────────────────────────────────────────────────
jest.mock('../../backend/src/utils/logger.util', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

// ─── Mock de Anthropic SDK ────────────────────────────────────────────────────
// Capturamos el último prompt enviado para poder inspeccionarlo en los tests
let lastCalledMessages = null;

const mockAnthropicCreate = jest.fn().mockImplementation(async (params) => {
  lastCalledMessages = params.messages;
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          training_plan: {
            weeks: 4,
            sessions_per_week: 3,
            weekly_schedule: [
              {
                day_of_week: 1,
                day_name: 'Lunes',
                session_type: 'strength',
                duration_minutes: 60,
                muscle_groups: ['pecho'],
                exercises: [
                  {
                    name: 'Barbell Squat',
                    sets: 3,
                    reps: '10',
                    rest_seconds: 90,
                    equipment_needed: 'Barbell',
                    instructions: 'Baja hasta paralelo.',
                  },
                ],
                notes: 'Calentamiento 5 min.',
              },
            ],
          },
          nutrition_plan: {
            daily_calories: 2000,
            macros: { protein_g: 150, carbs_g: 220, fat_g: 55 },
            meals_per_day: 3,
            meal_suggestions: [
              {
                meal_type: 'breakfast',
                name: 'Avena',
                description: 'Avena con fruta.',
                approximate_calories: 400,
                protein_g: 15,
                carbs_g: 60,
                fat_g: 8,
                ingredients: ['avena', 'plátano'],
                prep_time_minutes: 5,
              },
            ],
          },
          notes: 'Plan de test generado correctamente.',
          generated_at: new Date().toISOString(),
          model_version: 'claude-sonnet-4-6',
        }),
      },
    ],
  };
});

jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: mockAnthropicCreate,
    },
  }));
});

// ─── Importar el servicio después de los mocks ────────────────────────────────

const { generatePlan } = require('../../backend/src/services/aiService');

// ─── Datos de onboarding mínimos para los tests ────────────────────────────────

const MINIMAL_ONBOARDING = {
  physical: {
    age: 30,
    weight_kg: 80,
    height_cm: 175,
    gender: 'male',
    body_type: 'mesomorph',
    activity_level: 'moderate',
    goal: 'gain_muscle',
  },
  lifestyle: {
    profession: 'Developer',
    stress_level: 3,
    sleep_hours_usual: 7,
    sleep_quality: 'good',
    smoker: false,
  },
  training: {
    available_days_per_week: 4,
    max_session_duration_minutes: 60,
    has_gym_access: true,
    home_equipment: 'barbell',
    experience_level: 'intermediate',
    injuries_or_limitations: null,
  },
  nutrition: {
    diet_type: 'omnivore',
    meals_per_day_preferred: 3,
    food_restrictions: [],
  },
  health: {
    conditions: [],
  },
  motivation: {
    main_motivation: 'health',
    tracking_preference: 'basic',
  },
};

const SAMPLE_EXERCISES = [
  {
    id: 'uuid-1',
    externalId: 'EX001',
    name: 'Barbell Squat',
    bodyPart: 'upper legs',
    equipment: 'Barbell',
    target: 'quadriceps',
    secondaryMuscles: ['glutes', 'hamstrings'],
  },
  {
    id: 'uuid-2',
    externalId: 'EX002',
    name: 'Push Up',
    bodyPart: 'chest',
    equipment: 'Body Weight',
    target: 'pectorals',
    secondaryMuscles: [],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extrae el texto completo del prompt de usuario enviado a Claude.
 * El prompt tiene dos partes de texto: system prompt y user context.
 */
function getLastUserContextText() {
  if (!lastCalledMessages) return '';
  const userMsg = lastCalledMessages.find((m) => m.role === 'user');
  if (!userMsg || !Array.isArray(userMsg.content)) return '';
  // El segundo elemento es el contexto del usuario (el primero es el system prompt cacheado)
  const contextPart = userMsg.content.find(
    (c) => c.type === 'text' && !c.cache_control
  );
  return contextPart ? contextPart.text : '';
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests: buildUserContextPrompt (vía generatePlan)
// ─────────────────────────────────────────────────────────────────────────────

describe('buildUserContextPrompt — catálogo de ejercicios', () => {
  // Necesitamos ANTHROPIC_API_KEY para que no entre al path de fallback
  beforeAll(() => {
    process.env.ANTHROPIC_API_KEY = 'test-api-key-mock';
  });

  beforeEach(() => {
    lastCalledMessages = null;
    mockAnthropicCreate.mockClear();
  });

  test('el prompt incluye CATÁLOGO DE EJERCICIOS cuando se pasan ejercicios', async () => {
    await generatePlan('user-test-1', MINIMAL_ONBOARDING, 'plan_generation', null, SAMPLE_EXERCISES);

    const userContext = getLastUserContextText();
    expect(userContext).toContain('CATÁLOGO DE EJERCICIOS DISPONIBLES');
  });

  test('el prompt incluye el número de ejercicios del catálogo', async () => {
    await generatePlan('user-test-2', MINIMAL_ONBOARDING, 'plan_generation', null, SAMPLE_EXERCISES);

    const userContext = getLastUserContextText();
    expect(userContext).toContain(`${SAMPLE_EXERCISES.length} ejercicios`);
  });

  test('el prompt incluye el nombre de cada ejercicio del catálogo', async () => {
    await generatePlan('user-test-3', MINIMAL_ONBOARDING, 'plan_generation', null, SAMPLE_EXERCISES);

    const userContext = getLastUserContextText();
    expect(userContext).toContain('Barbell Squat');
    expect(userContext).toContain('Push Up');
  });

  test('el prompt incluye el ID externo de cada ejercicio', async () => {
    await generatePlan('user-test-4', MINIMAL_ONBOARDING, 'plan_generation', null, SAMPLE_EXERCISES);

    const userContext = getLastUserContextText();
    expect(userContext).toContain('ID:EX001');
    expect(userContext).toContain('ID:EX002');
  });

  test('el prompt NO incluye la sección de catálogo cuando exercises es array vacío', async () => {
    await generatePlan('user-test-5', MINIMAL_ONBOARDING, 'plan_generation', null, []);

    const userContext = getLastUserContextText();
    expect(userContext).not.toContain('CATÁLOGO DE EJERCICIOS DISPONIBLES');
  });

  test('el prompt NO incluye la sección de catálogo cuando exercises no se pasa', async () => {
    await generatePlan('user-test-6', MINIMAL_ONBOARDING, 'plan_generation', null);

    const userContext = getLastUserContextText();
    expect(userContext).not.toContain('CATÁLOGO DE EJERCICIOS DISPONIBLES');
  });

  test('el prompt incluye los datos físicos del usuario (peso, objetivo)', async () => {
    await generatePlan('user-test-7', MINIMAL_ONBOARDING, 'plan_generation', null, []);

    const userContext = getLastUserContextText();
    expect(userContext).toContain('80');          // peso_kg
    expect(userContext).toContain('175');         // height_cm
    expect(userContext).toContain('gain_muscle'); // objetivo
  });

  test('el prompt incluye TMB y TDEE calculados (datos del metabolismo)', async () => {
    await generatePlan('user-test-8', MINIMAL_ONBOARDING, 'plan_generation', null, []);

    const userContext = getLastUserContextText();
    expect(userContext).toContain('TMB:');
    expect(userContext).toContain('TDEE:');
    expect(userContext).toContain('Calorías objetivo:');
  });

  test('el prompt incluye extraContext cuando se proporciona', async () => {
    const extraCtx = 'Contexto especial de prueba para el plan.';
    await generatePlan('user-test-9', MINIMAL_ONBOARDING, 'plan_generation', extraCtx, []);

    const userContext = getLastUserContextText();
    expect(userContext).toContain(extraCtx);
  });

  test('el prompt NO incluye sección CONTEXTO ADICIONAL cuando extraContext es null', async () => {
    await generatePlan('user-test-10', MINIMAL_ONBOARDING, 'plan_generation', null, []);

    const userContext = getLastUserContextText();
    expect(userContext).not.toContain('## CONTEXTO ADICIONAL');
  });

  test('generatePlan devuelve el plan parseado cuando Claude responde correctamente', async () => {
    const plan = await generatePlan('user-test-11', MINIMAL_ONBOARDING, 'plan_generation', null, SAMPLE_EXERCISES);

    expect(plan).toHaveProperty('training_plan');
    expect(plan).toHaveProperty('nutrition_plan');
    expect(plan.generated_by_ai).toBe(true);
  });

  test('generatePlan acepta exercises sin errores (compatibilidad de firma)', async () => {
    await expect(
      generatePlan('user-test-12', MINIMAL_ONBOARDING, 'plan_generation', null, SAMPLE_EXERCISES)
    ).resolves.not.toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests: formatExercisesForPrompt (función interna de aiService)
// Testeada indirectamente: comprobamos el formato concreto en el texto del prompt.
// ─────────────────────────────────────────────────────────────────────────────

describe('formatExercisesForPrompt en aiService — formato del catálogo', () => {
  beforeAll(() => {
    process.env.ANTHROPIC_API_KEY = 'test-api-key-mock';
  });

  beforeEach(() => {
    lastCalledMessages = null;
    mockAnthropicCreate.mockClear();
  });

  test('el catálogo incluye zona corporal y equipamiento de cada ejercicio', async () => {
    await generatePlan('user-fmt-1', MINIMAL_ONBOARDING, 'plan_generation', null, [SAMPLE_EXERCISES[0]]);

    const userContext = getLastUserContextText();
    expect(userContext).toContain('upper legs');  // bodyPart
    expect(userContext).toContain('Barbell');      // equipment
    expect(userContext).toContain('quadriceps');   // target
  });

  test('el catálogo incluye músculos secundarios cuando existen', async () => {
    await generatePlan('user-fmt-2', MINIMAL_ONBOARDING, 'plan_generation', null, [SAMPLE_EXERCISES[0]]);

    const userContext = getLastUserContextText();
    expect(userContext).toContain('glutes');
    expect(userContext).toContain('hamstrings');
  });

  test('el catálogo omite la línea de músculos secundarios cuando el array está vacío', async () => {
    // Push Up tiene secondaryMuscles: []
    await generatePlan('user-fmt-3', MINIMAL_ONBOARDING, 'plan_generation', null, [SAMPLE_EXERCISES[1]]);

    const userContext = getLastUserContextText();
    // La sección de músculos secundarios no debe aparecer
    expect(userContext).not.toMatch(/Músculos secundarios:\s*$/m);
  });

  test('usa externalId como ID del ejercicio (formato ID:XXXX)', async () => {
    await generatePlan('user-fmt-4', MINIMAL_ONBOARDING, 'plan_generation', null, [SAMPLE_EXERCISES[0]]);

    const userContext = getLastUserContextText();
    expect(userContext).toContain('(ID:EX001)');
  });

  test('usa id interno si externalId no está disponible', async () => {
    const exerciseWithoutExternalId = {
      id: 'internal-uuid-xyz',
      externalId: null,
      name: 'Custom Exercise',
      bodyPart: 'back',
      equipment: 'Cable',
      target: 'lats',
      secondaryMuscles: [],
    };

    await generatePlan('user-fmt-5', MINIMAL_ONBOARDING, 'plan_generation', null, [exerciseWithoutExternalId]);

    const userContext = getLastUserContextText();
    expect(userContext).toContain('Custom Exercise');
    expect(userContext).toContain('internal-uuid-xyz');
  });
});
