/**
 * Store del plan activo
 * Contiene el plan del día: entrenamiento, comidas, métricas y log diario
 * Los datos mock se reemplazarán por llamadas a la API
 */

import { create } from 'zustand';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface FoodItem {
  id: string; name: string; grams: number;
  calories: number; protein: number; carbs: number; fat: number;
}

export interface Meal {
  id: string; name: string; icon: string;
  foods: FoodItem[]; completed: boolean;
}

export interface Exercise {
  id: string; name: string; muscleGroup: string;
  sets: number; reps: number; weight?: number; restSeconds: number;
  completed: boolean;
}

export interface WorkoutSession {
  id: string; name: string; muscleGroups: string[];
  durationMinutes: number; exercises: Exercise[]; completed: boolean;
}

export interface DayTargets {
  calories: number; protein: number; carbs: number; fat: number;
  waterMl: number; steps: number;
}

export interface DayLog {
  waterMl: number; steps: number; sleepHours: number;
}

export interface WeightEntry { date: string; value: number }

interface PlanState {
  todayWorkout:  WorkoutSession;
  todayMeals:    Meal[];
  targets:       DayTargets;
  log:           DayLog;
  streak:        number;
  weightHistory: WeightEntry[];
  // Acciones
  toggleExercise: (exerciseId: string) => void;
  toggleMeal:     (mealId: string)     => void;
  logWater:       (ml: number)         => void;
  logSteps:       (steps: number)      => void;
  logSleep:       (hours: number)      => void;
}

// ── Datos mock ───────────────────────────────────────────────────────────────

const MOCK_WORKOUT: WorkoutSession = {
  id: 'w1', name: 'Pecho y Tríceps', muscleGroups: ['Pecho', 'Tríceps', 'Hombros'],
  durationMinutes: 55, completed: false,
  exercises: [
    { id: 'e1', name: 'Press banca', muscleGroup: 'Pecho',    sets: 4, reps: 10, weight: 60, restSeconds: 90,  completed: false },
    { id: 'e2', name: 'Press inclinado mancuernas', muscleGroup: 'Pecho', sets: 3, reps: 12, weight: 22, restSeconds: 75,  completed: false },
    { id: 'e3', name: 'Aperturas en polea', muscleGroup: 'Pecho', sets: 3, reps: 15, weight: 12, restSeconds: 60, completed: false },
    { id: 'e4', name: 'Fondos en paralelas', muscleGroup: 'Tríceps', sets: 3, reps: 12, restSeconds: 75, completed: false },
    { id: 'e5', name: 'Press francés', muscleGroup: 'Tríceps', sets: 3, reps: 12, weight: 30, restSeconds: 60, completed: false },
    { id: 'e6', name: 'Elevaciones laterales', muscleGroup: 'Hombros', sets: 3, reps: 15, weight: 8, restSeconds: 60, completed: false },
  ],
};

const MOCK_MEALS: Meal[] = [
  {
    id: 'm1', name: 'Desayuno', icon: '☀️', completed: false,
    foods: [
      { id: 'f1', name: 'Avena con leche',     grams: 80,  calories: 310, protein: 12, carbs: 55, fat: 5  },
      { id: 'f2', name: 'Plátano',             grams: 100, calories:  89, protein:  1, carbs: 23, fat: 0  },
      { id: 'f3', name: 'Claras de huevo (3)', grams: 99,  calories:  50, protein: 10, carbs:  1, fat: 0  },
    ],
  },
  {
    id: 'm2', name: 'Media mañana', icon: '🥜', completed: false,
    foods: [
      { id: 'f4', name: 'Batido de proteínas', grams: 30,  calories: 120, protein: 25, carbs:  3, fat: 2  },
      { id: 'f5', name: 'Manzana',             grams: 150, calories:  78, protein:  0, carbs: 21, fat: 0  },
    ],
  },
  {
    id: 'm3', name: 'Almuerzo', icon: '🍽️', completed: false,
    foods: [
      { id: 'f6', name: 'Pechuga de pollo a la plancha', grams: 200, calories: 220, protein: 46, carbs:  0, fat: 4  },
      { id: 'f7', name: 'Arroz integral',                grams: 150, calories: 194, protein:  4, carbs: 41, fat: 2  },
      { id: 'f8', name: 'Brócoli al vapor',              grams: 200, calories:  68, protein:  6, carbs: 13, fat: 1  },
    ],
  },
  {
    id: 'm4', name: 'Merienda', icon: '🧃', completed: false,
    foods: [
      { id: 'f9',  name: 'Yogur griego 0%', grams: 200, calories: 118, protein: 20, carbs:  8, fat: 0 },
      { id: 'f10', name: 'Frutos rojos',    grams: 100, calories:  57, protein:  1, carbs: 14, fat: 0 },
    ],
  },
  {
    id: 'm5', name: 'Cena', icon: '🌙', completed: false,
    foods: [
      { id: 'f11', name: 'Salmón al horno',    grams: 180, calories: 367, protein: 36, carbs:  0, fat: 24 },
      { id: 'f12', name: 'Ensalada mixta',     grams: 200, calories:  50, protein:  3, carbs:  7, fat: 2  },
      { id: 'f13', name: 'Patata al vapor',    grams: 150, calories: 130, protein:  3, carbs: 30, fat: 0  },
    ],
  },
];

const MOCK_TARGETS: DayTargets = {
  calories: 2200, protein: 165, carbs: 242, fat: 61, waterMl: 2500, steps: 8000,
};

const MOCK_WEIGHT_HISTORY: WeightEntry[] = [
  { date: '01/04', value: 82.5 }, { date: '03/04', value: 82.1 },
  { date: '05/04', value: 81.8 }, { date: '08/04', value: 81.4 },
  { date: '10/04', value: 81.0 }, { date: '13/04', value: 80.6 },
  { date: '15/04', value: 80.2 }, { date: '17/04', value: 79.9 },
];

// ── Store ────────────────────────────────────────────────────────────────────

export const usePlanStore = create<PlanState>((set) => ({
  todayWorkout:  MOCK_WORKOUT,
  todayMeals:    MOCK_MEALS,
  targets:       MOCK_TARGETS,
  streak:        7,
  weightHistory: MOCK_WEIGHT_HISTORY,
  log: { waterMl: 750, steps: 3240, sleepHours: 7.5 },

  toggleExercise: (id) => set((s) => ({
    todayWorkout: {
      ...s.todayWorkout,
      exercises: s.todayWorkout.exercises.map((e) =>
        e.id === id ? { ...e, completed: !e.completed } : e
      ),
    },
  })),

  toggleMeal: (id) => set((s) => ({
    todayMeals: s.todayMeals.map((m) =>
      m.id === id ? { ...m, completed: !m.completed } : m
    ),
  })),

  logWater: (ml) => set((s) => ({
    log: { ...s.log, waterMl: Math.min(s.log.waterMl + ml, s.targets.waterMl) },
  })),

  logSteps: (steps) => set((s) => ({ log: { ...s.log, steps } })),
  logSleep: (hours) => set((s) => ({ log: { ...s.log, sleepHours: hours } })),
}));

// ── Selectores derivados ─────────────────────────────────────────────────────

export function calcMealTotals(meal: Meal) {
  return meal.foods.reduce(
    (acc, f) => ({
      calories: acc.calories + f.calories,
      protein:  acc.protein  + f.protein,
      carbs:    acc.carbs    + f.carbs,
      fat:      acc.fat      + f.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

export function calcDayTotals(meals: Meal[]) {
  return meals.reduce(
    (acc, m) => {
      const t = calcMealTotals(m);
      return {
        calories: acc.calories + t.calories,
        protein:  acc.protein  + t.protein,
        carbs:    acc.carbs    + t.carbs,
        fat:      acc.fat      + t.fat,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}
