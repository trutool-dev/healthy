/**
 * Tests unitarios: calculations.util.js del backend.
 * Cubre TMB (Mifflin-St Jeor), TDEE, calorías objetivo con floor de seguridad
 * y distribución de macros.
 */

const {
  calculateTMB,
  calculateTDEE,
  calculateTargetCalories,
  calculateMacros,
  calculateNutritionPlan,
  MIN_CALORIES,
} = require('../../../backend/src/utils/calculations.util');

// ---------------------------------------------------------------------------
// calculateTMB
// ---------------------------------------------------------------------------

describe('calculateTMB', () => {
  test('hombre 30 años 80 kg 175 cm', () => {
    // (10×80) + (6.25×175) - (5×30) + 5 = 800 + 1093.75 - 150 + 5 = 1748.75 → 1749
    expect(calculateTMB({ weight: 80, height: 175, age: 30, sex: 'male' })).toBe(1749);
  });

  test('mujer 25 años 60 kg 165 cm', () => {
    // (10×60) + (6.25×165) - (5×25) - 161 = 600 + 1031.25 - 125 - 161 = 1345.25 → 1345
    expect(calculateTMB({ weight: 60, height: 165, age: 25, sex: 'female' })).toBe(1345);
  });

  test('hombre 55 años 78 kg 176 cm (perfil 3)', () => {
    // (10×78) + (6.25×176) - (5×55) + 5 = 780 + 1100 - 275 + 5 = 1610
    expect(calculateTMB({ weight: 78, height: 176, age: 55, sex: 'male' })).toBe(1610);
  });

  test('mujer 45 años 70 kg 165 cm (perfil 4)', () => {
    // (10×70) + (6.25×165) - (5×45) - 161 = 700 + 1031.25 - 225 - 161 = 1345.25 → 1345
    expect(calculateTMB({ weight: 70, height: 165, age: 45, sex: 'female' })).toBe(1345);
  });

  test('devuelve entero positivo', () => {
    const result = calculateTMB({ weight: 70, height: 170, age: 30, sex: 'male' });
    expect(Number.isInteger(result)).toBe(true);
    expect(result).toBeGreaterThan(0);
  });

  describe('validaciones de entrada', () => {
    test('lanza error si el peso es 0', () => {
      expect(() => calculateTMB({ weight: 0, height: 170, age: 30, sex: 'male' }))
        .toThrow('peso');
    });

    test('lanza error si el peso es negativo', () => {
      expect(() => calculateTMB({ weight: -5, height: 170, age: 30, sex: 'male' }))
        .toThrow('peso');
    });

    test('lanza error si la altura es 0', () => {
      expect(() => calculateTMB({ weight: 70, height: 0, age: 30, sex: 'male' }))
        .toThrow('altura');
    });

    test('lanza error si la edad es 0', () => {
      expect(() => calculateTMB({ weight: 70, height: 170, age: 0, sex: 'male' }))
        .toThrow('edad');
    });

    test('lanza error si el sexo es inválido', () => {
      expect(() => calculateTMB({ weight: 70, height: 170, age: 30, sex: 'other' }))
        .toThrow('male');
    });
  });
});

// ---------------------------------------------------------------------------
// calculateTDEE
// ---------------------------------------------------------------------------

describe('calculateTDEE', () => {
  const TMB = 1749;

  test('sedentary: ×1.2', () => {
    expect(calculateTDEE(TMB, 'sedentary')).toBe(Math.round(TMB * 1.2));
  });

  test('light: ×1.375', () => {
    expect(calculateTDEE(TMB, 'light')).toBe(Math.round(TMB * 1.375));
  });

  test('moderate: ×1.55', () => {
    expect(calculateTDEE(TMB, 'moderate')).toBe(Math.round(TMB * 1.55));
  });

  test('active: ×1.725', () => {
    expect(calculateTDEE(TMB, 'active')).toBe(Math.round(TMB * 1.725));
  });

  test('very_active: ×1.9', () => {
    expect(calculateTDEE(TMB, 'very_active')).toBe(Math.round(TMB * 1.9));
  });

  test('lanza error con nivel de actividad inválido', () => {
    expect(() => calculateTDEE(TMB, 'superhuman')).toThrow('inválido');
  });

  test('el TDEE es siempre mayor que la TMB', () => {
    ['sedentary', 'light', 'moderate', 'active', 'very_active'].forEach((level) => {
      expect(calculateTDEE(1500, level)).toBeGreaterThan(1500);
    });
  });
});

// ---------------------------------------------------------------------------
// calculateTargetCalories  —  objetivo + floor de seguridad
// ---------------------------------------------------------------------------

describe('calculateTargetCalories', () => {
  describe('ajustes por objetivo', () => {
    test('lose_weight: déficit del 20%', () => {
      expect(calculateTargetCalories(2000, 'lose_weight', 'male')).toBe(1600);
    });

    test('gain_muscle: superávit del 10%', () => {
      expect(calculateTargetCalories(2000, 'gain_muscle', 'male')).toBe(2200);
    });

    test('maintenance: sin ajuste', () => {
      expect(calculateTargetCalories(2000, 'maintenance', 'male')).toBe(2000);
    });

    test('general_health: sin ajuste', () => {
      expect(calculateTargetCalories(2000, 'general_health', 'female')).toBe(2000);
    });
  });

  describe('mínimos de seguridad críticos (CLAUDE.md)', () => {
    test('mujer no recibe menos de 1200 kcal', () => {
      // TDEE muy bajo (700 kcal) con déficit → raw = 560, floor = 1200
      const result = calculateTargetCalories(700, 'lose_weight', 'female');
      expect(result).toBe(MIN_CALORIES.female); // 1200
    });

    test('hombre no recibe menos de 1500 kcal', () => {
      // TDEE bajo (1000 kcal) con déficit → raw = 800, floor = 1500
      const result = calculateTargetCalories(1000, 'lose_weight', 'male');
      expect(result).toBe(MIN_CALORIES.male); // 1500
    });

    test('floor no aplica cuando la dieta ya supera el mínimo', () => {
      const result = calculateTargetCalories(2000, 'lose_weight', 'female');
      expect(result).toBe(1600); // 2000 × 0.80 = 1600 > 1200
    });
  });

  test('lanza error con objetivo inválido', () => {
    expect(() => calculateTargetCalories(2000, 'detox', 'male')).toThrow('inválido');
  });
});

// ---------------------------------------------------------------------------
// calculateMacros
// ---------------------------------------------------------------------------

describe('calculateMacros', () => {
  describe('proteína según objetivo', () => {
    test('lose_weight: 2.0 g/kg', () => {
      const { protein } = calculateMacros({ targetCalories: 1600, weight: 80, goal: 'lose_weight' });
      expect(protein).toBe(Math.round(80 * 2.0));
    });

    test('gain_muscle: 2.2 g/kg', () => {
      const { protein } = calculateMacros({ targetCalories: 2200, weight: 60, goal: 'gain_muscle' });
      expect(protein).toBe(Math.round(60 * 2.2));
    });

    test('maintenance: 1.8 g/kg', () => {
      const { protein } = calculateMacros({ targetCalories: 2000, weight: 75, goal: 'maintenance' });
      expect(protein).toBe(Math.round(75 * 1.8));
    });

    test('general_health: 1.6 g/kg', () => {
      const { protein } = calculateMacros({ targetCalories: 2000, weight: 70, goal: 'general_health' });
      expect(protein).toBe(Math.round(70 * 1.6));
    });
  });

  describe('grasa al 30% de calorías objetivo', () => {
    test('2000 kcal → fat ≈ 67 g', () => {
      const { fat } = calculateMacros({ targetCalories: 2000, weight: 70, goal: 'maintenance' });
      expect(fat).toBe(Math.round((2000 * 0.30) / 9));
    });
  });

  describe('carbohidratos = calorías restantes', () => {
    test('carbs ≥ 0 siempre', () => {
      const { carbs } = calculateMacros({ targetCalories: 1200, weight: 80, goal: 'lose_weight' });
      expect(carbs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('estructura del resultado', () => {
    test('devuelve { protein, fat, carbs }', () => {
      const result = calculateMacros({ targetCalories: 2000, weight: 70, goal: 'maintenance' });
      expect(result).toHaveProperty('protein');
      expect(result).toHaveProperty('fat');
      expect(result).toHaveProperty('carbs');
    });

    test('todos los valores son enteros no negativos', () => {
      const result = calculateMacros({ targetCalories: 2000, weight: 70, goal: 'gain_muscle' });
      Object.values(result).forEach((v) => {
        expect(Number.isInteger(v)).toBe(true);
        expect(v).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('validaciones', () => {
    test('lanza error si las calorías son 0', () => {
      expect(() => calculateMacros({ targetCalories: 0, weight: 70, goal: 'maintenance' }))
        .toThrow('calorías');
    });

    test('lanza error si el peso es 0', () => {
      expect(() => calculateMacros({ targetCalories: 2000, weight: 0, goal: 'maintenance' }))
        .toThrow('peso');
    });

    test('lanza error con objetivo inválido', () => {
      expect(() => calculateMacros({ targetCalories: 2000, weight: 70, goal: 'bulk' }))
        .toThrow('inválido');
    });
  });
});

// ---------------------------------------------------------------------------
// calculateNutritionPlan  —  función integradora
// ---------------------------------------------------------------------------

describe('calculateNutritionPlan', () => {
  const BASE_PROFILE = {
    weight: 80, height: 175, age: 30, sex: 'male',
    activityLevel: 'sedentary', goal: 'lose_weight',
  };

  test('devuelve tmb, tdee, targetCalories y macros', () => {
    const result = calculateNutritionPlan(BASE_PROFILE);
    expect(result).toHaveProperty('tmb');
    expect(result).toHaveProperty('tdee');
    expect(result).toHaveProperty('targetCalories');
    expect(result).toHaveProperty('macros');
  });

  test('tdee > tmb para cualquier nivel de actividad', () => {
    ['sedentary', 'light', 'moderate', 'active', 'very_active'].forEach((activityLevel) => {
      const { tmb, tdee } = calculateNutritionPlan({ ...BASE_PROFILE, activityLevel });
      expect(tdee).toBeGreaterThan(tmb);
    });
  });

  test('lose_weight: targetCalories < tdee', () => {
    const { tdee, targetCalories } = calculateNutritionPlan(BASE_PROFILE);
    expect(targetCalories).toBeLessThan(tdee);
  });

  test('gain_muscle: targetCalories > tdee', () => {
    const { tdee, targetCalories } = calculateNutritionPlan({ ...BASE_PROFILE, goal: 'gain_muscle' });
    expect(targetCalories).toBeGreaterThan(tdee);
  });

  test('maintenance: targetCalories === tdee', () => {
    const { tdee, targetCalories } = calculateNutritionPlan({ ...BASE_PROFILE, goal: 'maintenance' });
    expect(targetCalories).toBe(tdee);
  });

  // Perfiles de prueba documentados en CLAUDE.md
  test('perfil 1 — hombre 35 años sobrepeso perder peso (sedentary)', () => {
    const result = calculateNutritionPlan({
      weight: 95, height: 178, age: 35, sex: 'male',
      activityLevel: 'sedentary', goal: 'lose_weight',
    });
    expect(result.targetCalories).toBeGreaterThanOrEqual(MIN_CALORIES.male);
    expect(result.macros.protein).toBe(Math.round(95 * 2.0));
  });

  test('perfil 2 — mujer 28 años ganar músculo (moderate)', () => {
    const result = calculateNutritionPlan({
      weight: 58, height: 163, age: 28, sex: 'female',
      activityLevel: 'moderate', goal: 'gain_muscle',
    });
    expect(result.targetCalories).toBeGreaterThan(result.tdee);
    expect(result.macros.protein).toBe(Math.round(58 * 2.2));
  });

  test('perfil 3 — hombre 55 años activo mantenimiento', () => {
    const result = calculateNutritionPlan({
      weight: 78, height: 176, age: 55, sex: 'male',
      activityLevel: 'active', goal: 'maintenance',
    });
    expect(result.targetCalories).toBe(result.tdee);
  });

  test('perfil 4 — mujer 45 años sedentaria salud general', () => {
    const result = calculateNutritionPlan({
      weight: 70, height: 165, age: 45, sex: 'female',
      activityLevel: 'sedentary', goal: 'general_health',
    });
    expect(result.targetCalories).toBeGreaterThanOrEqual(MIN_CALORIES.female);
  });
});
