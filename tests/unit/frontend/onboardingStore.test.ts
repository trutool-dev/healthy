/**
 * Tests unitarios: onboardingStore.ts
 * Verifica los setters de cada sección del onboarding y el reset.
 */

jest.mock('expo-secure-store');

beforeEach(() => {
  jest.resetModules();
});

async function getStore() {
  const { useOnboardingStore } = await import('../../../frontend/src/stores/onboardingStore');
  return useOnboardingStore;
}

// ---------------------------------------------------------------------------
// Estado inicial
// ---------------------------------------------------------------------------

describe('estado inicial', () => {
  test('data empieza vacío', async () => {
    const store = await getStore();
    expect(store.getState().data).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// setGoal
// ---------------------------------------------------------------------------

describe('setGoal', () => {
  test('guarda el objetivo correctamente', async () => {
    const store = await getStore();
    store.getState().setGoal('lose_weight');
    expect(store.getState().data.goal).toBe('lose_weight');
  });

  test('actualiza el objetivo si se llama de nuevo', async () => {
    const store = await getStore();
    store.getState().setGoal('lose_weight');
    store.getState().setGoal('gain_muscle');
    expect(store.getState().data.goal).toBe('gain_muscle');
  });

  test('no borra otras propiedades de data al actualizar el goal', async () => {
    const store = await getStore();
    store.getState().setGoal('lose_weight');
    store.getState().setProfile({ gender: 'male', age: 30, weight: 80, height: 175, bodyType: 'average' });
    store.getState().setGoal('maintain');
    // El profile debe seguir ahí
    expect(store.getState().data.profile).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// setProfile
// ---------------------------------------------------------------------------

describe('setProfile', () => {
  const profile = { gender: 'male' as const, age: 30, weight: 80, height: 175, bodyType: 'athletic' as const };

  test('guarda el perfil completo', async () => {
    const store = await getStore();
    store.getState().setProfile(profile);
    expect(store.getState().data.profile).toEqual(profile);
  });

  test('sobreescribe el perfil anterior', async () => {
    const store = await getStore();
    store.getState().setProfile(profile);
    const updated = { ...profile, weight: 85 };
    store.getState().setProfile(updated);
    expect(store.getState().data.profile?.weight).toBe(85);
  });
});

// ---------------------------------------------------------------------------
// setLifestyle
// ---------------------------------------------------------------------------

describe('setLifestyle', () => {
  const lifestyle = { profession: 'developer', workSchedule: 'morning' as const, stressLevel: 3 as const };

  test('guarda el estilo de vida', async () => {
    const store = await getStore();
    store.getState().setLifestyle(lifestyle);
    expect(store.getState().data.lifestyle).toEqual(lifestyle);
  });
});

// ---------------------------------------------------------------------------
// setTraining
// ---------------------------------------------------------------------------

describe('setTraining', () => {
  const training = { daysPerWeek: 4, equipment: ['gym' as const], experience: 'intermediate' as const };

  test('guarda las preferencias de entrenamiento', async () => {
    const store = await getStore();
    store.getState().setTraining(training);
    expect(store.getState().data.training).toEqual(training);
  });

  test('guarda el array de equipamiento correctamente', async () => {
    const store = await getStore();
    store.getState().setTraining({ ...training, equipment: ['gym', 'home'] });
    expect(store.getState().data.training?.equipment).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// setNutrition
// ---------------------------------------------------------------------------

describe('setNutrition', () => {
  const nutrition = { dietType: 'omnivore' as const, restrictions: [], budget: 'medium' as const };

  test('guarda las preferencias de nutrición', async () => {
    const store = await getStore();
    store.getState().setNutrition(nutrition);
    expect(store.getState().data.nutrition).toEqual(nutrition);
  });
});

// ---------------------------------------------------------------------------
// setHealth
// ---------------------------------------------------------------------------

describe('setHealth', () => {
  const health = { conditions: ['diabetes'], injuries: [] };

  test('guarda las condiciones de salud', async () => {
    const store = await getStore();
    store.getState().setHealth(health);
    expect(store.getState().data.health).toEqual(health);
  });
});

// ---------------------------------------------------------------------------
// setMotivation
// ---------------------------------------------------------------------------

describe('setMotivation', () => {
  const motivation = {
    motivations: ['health', 'energy'],
    previousAttempts: 'few' as const,
    mainChallenge: 'consistency',
  };

  test('guarda la información de motivación', async () => {
    const store = await getStore();
    store.getState().setMotivation(motivation);
    expect(store.getState().data.motivation).toEqual(motivation);
  });
});

// ---------------------------------------------------------------------------
// reset
// ---------------------------------------------------------------------------

describe('reset', () => {
  test('vacía data después de haber rellenado varias secciones', async () => {
    const store = await getStore();
    store.getState().setGoal('gain_muscle');
    store.getState().setProfile({ gender: 'female', age: 25, weight: 60, height: 165, bodyType: 'slim' });
    store.getState().setTraining({ daysPerWeek: 3, equipment: ['home'], experience: 'beginner' });

    store.getState().reset();

    expect(store.getState().data).toEqual({});
  });

  test('después del reset se pueden volver a establecer valores', async () => {
    const store = await getStore();
    store.getState().setGoal('lose_weight');
    store.getState().reset();
    store.getState().setGoal('maintain');
    expect(store.getState().data.goal).toBe('maintain');
  });
});

// ---------------------------------------------------------------------------
// Flujo completo de onboarding
// ---------------------------------------------------------------------------

describe('flujo completo de onboarding', () => {
  test('acumula todas las secciones sin borrar las anteriores', async () => {
    const store = await getStore();

    store.getState().setGoal('lose_weight');
    store.getState().setProfile({ gender: 'male', age: 35, weight: 95, height: 178, bodyType: 'overweight' });
    store.getState().setLifestyle({ profession: 'office worker', workSchedule: 'morning', stressLevel: 4 });
    store.getState().setTraining({ daysPerWeek: 3, equipment: ['gym'], experience: 'beginner' });
    store.getState().setNutrition({ dietType: 'omnivore', restrictions: [], budget: 'medium' });
    store.getState().setHealth({ conditions: [], injuries: [] });
    store.getState().setMotivation({ motivations: ['health'], previousAttempts: 'few', mainChallenge: 'motivation' });

    const { data } = store.getState();
    expect(data.goal).toBe('lose_weight');
    expect(data.profile?.weight).toBe(95);
    expect(data.lifestyle?.stressLevel).toBe(4);
    expect(data.training?.daysPerWeek).toBe(3);
    expect(data.nutrition?.dietType).toBe('omnivore');
    expect(data.health?.conditions).toHaveLength(0);
    expect(data.motivation?.mainChallenge).toBe('motivation');
  });
});
