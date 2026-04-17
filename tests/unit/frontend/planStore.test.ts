/**
 * Tests unitarios: planStore.ts + selectores calcMealTotals / calcDayTotals.
 * Verifica las acciones del store y los cálculos de totales de macros.
 * Las acciones de Zustand en Node son síncronas; no se necesita act().
 */

jest.mock('expo-secure-store');

beforeEach(() => {
  jest.resetModules();
});

// ---------------------------------------------------------------------------
// Estado inicial
// ---------------------------------------------------------------------------

describe('estado inicial del store', () => {
  test('tiene entrenamiento del día', async () => {
    const { usePlanStore } = await import('../../../frontend/src/stores/planStore');
    expect(usePlanStore.getState().todayWorkout).toBeDefined();
    expect(usePlanStore.getState().todayWorkout.exercises.length).toBeGreaterThan(0);
  });

  test('tiene 5 comidas del día', async () => {
    const { usePlanStore } = await import('../../../frontend/src/stores/planStore');
    expect(usePlanStore.getState().todayMeals).toHaveLength(5);
  });

  test('todos los ejercicios empiezan sin completar', async () => {
    const { usePlanStore } = await import('../../../frontend/src/stores/planStore');
    usePlanStore.getState().todayWorkout.exercises.forEach((e) => {
      expect(e.completed).toBe(false);
    });
  });

  test('todas las comidas empiezan sin completar', async () => {
    const { usePlanStore } = await import('../../../frontend/src/stores/planStore');
    usePlanStore.getState().todayMeals.forEach((m) => {
      expect(m.completed).toBe(false);
    });
  });

  test('racha (streak) inicial de 7 días', async () => {
    const { usePlanStore } = await import('../../../frontend/src/stores/planStore');
    expect(usePlanStore.getState().streak).toBe(7);
  });

  test('objetivos del día están definidos', async () => {
    const { usePlanStore } = await import('../../../frontend/src/stores/planStore');
    const { targets } = usePlanStore.getState();
    expect(targets.calories).toBeGreaterThan(0);
    expect(targets.protein).toBeGreaterThan(0);
    expect(targets.waterMl).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// toggleExercise
// ---------------------------------------------------------------------------

describe('toggleExercise', () => {
  test('marca un ejercicio como completado', async () => {
    const { usePlanStore } = await import('../../../frontend/src/stores/planStore');
    usePlanStore.getState().toggleExercise('e1');
    const exercise = usePlanStore.getState().todayWorkout.exercises.find((e) => e.id === 'e1');
    expect(exercise?.completed).toBe(true);
  });

  test('desmarcar un ejercicio ya completado lo vuelve a false', async () => {
    const { usePlanStore } = await import('../../../frontend/src/stores/planStore');
    usePlanStore.getState().toggleExercise('e1');
    usePlanStore.getState().toggleExercise('e1');
    const exercise = usePlanStore.getState().todayWorkout.exercises.find((e) => e.id === 'e1');
    expect(exercise?.completed).toBe(false);
  });

  test('solo modifica el ejercicio con el id correcto', async () => {
    const { usePlanStore } = await import('../../../frontend/src/stores/planStore');
    usePlanStore.getState().toggleExercise('e1');
    const others = usePlanStore.getState().todayWorkout.exercises.filter((e) => e.id !== 'e1');
    others.forEach((e) => expect(e.completed).toBe(false));
  });

  test('id inexistente no rompe el store', async () => {
    const { usePlanStore } = await import('../../../frontend/src/stores/planStore');
    expect(() => usePlanStore.getState().toggleExercise('id-que-no-existe')).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// toggleMeal
// ---------------------------------------------------------------------------

describe('toggleMeal', () => {
  test('marca una comida como completada', async () => {
    const { usePlanStore } = await import('../../../frontend/src/stores/planStore');
    usePlanStore.getState().toggleMeal('m1');
    const meal = usePlanStore.getState().todayMeals.find((m) => m.id === 'm1');
    expect(meal?.completed).toBe(true);
  });

  test('toggle doble devuelve a false', async () => {
    const { usePlanStore } = await import('../../../frontend/src/stores/planStore');
    usePlanStore.getState().toggleMeal('m2');
    usePlanStore.getState().toggleMeal('m2');
    const meal = usePlanStore.getState().todayMeals.find((m) => m.id === 'm2');
    expect(meal?.completed).toBe(false);
  });

  test('solo modifica la comida con el id correcto', async () => {
    const { usePlanStore } = await import('../../../frontend/src/stores/planStore');
    usePlanStore.getState().toggleMeal('m3');
    const others = usePlanStore.getState().todayMeals.filter((m) => m.id !== 'm3');
    others.forEach((m) => expect(m.completed).toBe(false));
  });
});

// ---------------------------------------------------------------------------
// logWater
// ---------------------------------------------------------------------------

describe('logWater', () => {
  test('incrementa el agua registrada', async () => {
    const { usePlanStore } = await import('../../../frontend/src/stores/planStore');
    const before = usePlanStore.getState().log.waterMl;
    usePlanStore.getState().logWater(250);
    expect(usePlanStore.getState().log.waterMl).toBe(before + 250);
  });

  test('no supera el objetivo de agua (targets.waterMl)', async () => {
    const { usePlanStore } = await import('../../../frontend/src/stores/planStore');
    const target = usePlanStore.getState().targets.waterMl;
    usePlanStore.getState().logWater(999999);
    expect(usePlanStore.getState().log.waterMl).toBe(target);
  });

  test('múltiples adiciones se acumulan correctamente', async () => {
    const { usePlanStore } = await import('../../../frontend/src/stores/planStore');
    const before = usePlanStore.getState().log.waterMl;
    usePlanStore.getState().logWater(200);
    usePlanStore.getState().logWater(300);
    const expected = Math.min(before + 500, usePlanStore.getState().targets.waterMl);
    expect(usePlanStore.getState().log.waterMl).toBe(expected);
  });
});

// ---------------------------------------------------------------------------
// logSteps / logSleep
// ---------------------------------------------------------------------------

describe('logSteps', () => {
  test('establece el número de pasos', async () => {
    const { usePlanStore } = await import('../../../frontend/src/stores/planStore');
    usePlanStore.getState().logSteps(7500);
    expect(usePlanStore.getState().log.steps).toBe(7500);
  });

  test('sobreescribe el valor anterior', async () => {
    const { usePlanStore } = await import('../../../frontend/src/stores/planStore');
    usePlanStore.getState().logSteps(3000);
    usePlanStore.getState().logSteps(6000);
    expect(usePlanStore.getState().log.steps).toBe(6000);
  });
});

describe('logSleep', () => {
  test('establece las horas de sueño', async () => {
    const { usePlanStore } = await import('../../../frontend/src/stores/planStore');
    usePlanStore.getState().logSleep(8);
    expect(usePlanStore.getState().log.sleepHours).toBe(8);
  });
});

// ---------------------------------------------------------------------------
// calcMealTotals
// ---------------------------------------------------------------------------

describe('calcMealTotals', () => {
  const meal = {
    id: 'test', name: 'Test', icon: '🍎', completed: false,
    foods: [
      { id: 'f1', name: 'A', grams: 100, calories: 300, protein: 20, carbs: 40, fat: 5 },
      { id: 'f2', name: 'B', grams: 50,  calories: 150, protein: 10, carbs: 15, fat: 8 },
    ],
  };

  test('suma correctamente las calorías', async () => {
    const { calcMealTotals } = await import('../../../frontend/src/stores/planStore');
    expect(calcMealTotals(meal).calories).toBe(450);
  });

  test('suma correctamente la proteína', async () => {
    const { calcMealTotals } = await import('../../../frontend/src/stores/planStore');
    expect(calcMealTotals(meal).protein).toBe(30);
  });

  test('suma correctamente los carbohidratos', async () => {
    const { calcMealTotals } = await import('../../../frontend/src/stores/planStore');
    expect(calcMealTotals(meal).carbs).toBe(55);
  });

  test('suma correctamente la grasa', async () => {
    const { calcMealTotals } = await import('../../../frontend/src/stores/planStore');
    expect(calcMealTotals(meal).fat).toBe(13);
  });

  test('comida sin alimentos devuelve todo a 0', async () => {
    const { calcMealTotals } = await import('../../../frontend/src/stores/planStore');
    const empty = { ...meal, foods: [] };
    expect(calcMealTotals(empty)).toEqual({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  });
});

// ---------------------------------------------------------------------------
// calcDayTotals
// ---------------------------------------------------------------------------

describe('calcDayTotals', () => {
  const meals = [
    {
      id: 'm1', name: 'A', icon: '', completed: false,
      foods: [{ id: 'f1', name: 'x', grams: 100, calories: 400, protein: 30, carbs: 50, fat: 10 }],
    },
    {
      id: 'm2', name: 'B', icon: '', completed: false,
      foods: [{ id: 'f2', name: 'y', grams: 100, calories: 300, protein: 20, carbs: 30, fat: 15 }],
    },
  ];

  test('suma calorías de todas las comidas', async () => {
    const { calcDayTotals } = await import('../../../frontend/src/stores/planStore');
    expect(calcDayTotals(meals).calories).toBe(700);
  });

  test('suma proteína de todas las comidas', async () => {
    const { calcDayTotals } = await import('../../../frontend/src/stores/planStore');
    expect(calcDayTotals(meals).protein).toBe(50);
  });

  test('array vacío devuelve 0 en todos los macros', async () => {
    const { calcDayTotals } = await import('../../../frontend/src/stores/planStore');
    expect(calcDayTotals([])).toEqual({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  });

  test('los totales del día con datos mock son positivos', async () => {
    const { usePlanStore, calcDayTotals } = await import('../../../frontend/src/stores/planStore');
    const totals = calcDayTotals(usePlanStore.getState().todayMeals);
    expect(totals.calories).toBeGreaterThan(0);
    expect(totals.protein).toBeGreaterThan(0);
  });
});
