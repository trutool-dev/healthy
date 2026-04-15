/**
 * Store de onboarding con Zustand
 * Acumula los datos de cada paso para enviarlos juntos al finalizar
 */

import { create } from 'zustand';

export type Goal =
  | 'lose_weight'
  | 'gain_muscle'
  | 'stay_active'
  | 'improve_habits';

export type BodyType   = 'slim' | 'athletic' | 'average' | 'overweight';
export type Gender     = 'male' | 'female' | 'other';
export type Schedule   = 'morning' | 'afternoon' | 'night' | 'flexible';
export type Equipment  = 'gym' | 'home' | 'outdoors' | 'none';
export type Experience = 'beginner' | 'intermediate' | 'advanced';
export type DietType   = 'omnivore' | 'vegetarian' | 'vegan' | 'gluten_free' | 'keto' | 'other';
export type Budget     = 'low' | 'medium' | 'high';
export type PreviousAttempts = 'none' | 'few' | 'many';

export interface OnboardingData {
  // Paso 1 — Objetivo
  goal?: Goal;

  // Paso 2 — Perfil físico
  profile?: {
    gender:   Gender;
    age:      number;
    weight:   number; // kg
    height:   number; // cm
    bodyType: BodyType;
  };

  // Paso 3 — Estilo de vida
  lifestyle?: {
    profession:   string;
    workSchedule: Schedule;
    stressLevel:  1 | 2 | 3 | 4 | 5;
  };

  // Paso 4 — Entrenamiento
  training?: {
    daysPerWeek: number;        // 1-7
    equipment:   Equipment[];
    experience:  Experience;
  };

  // Paso 5 — Nutrición
  nutrition?: {
    dietType:     DietType;
    restrictions: string[];     // alergias / intolerancias
    budget:       Budget;
  };

  // Paso 6 — Salud
  health?: {
    conditions: string[];
    injuries:   string[];
  };

  // Paso 7 — Motivación
  motivation?: {
    motivations:      string[];
    previousAttempts: PreviousAttempts;
    mainChallenge:    string;
  };
}

interface OnboardingState {
  data:       OnboardingData;
  setGoal:        (goal: Goal)                        => void;
  setProfile:     (p: OnboardingData['profile'])      => void;
  setLifestyle:   (l: OnboardingData['lifestyle'])    => void;
  setTraining:    (t: OnboardingData['training'])     => void;
  setNutrition:   (n: OnboardingData['nutrition'])    => void;
  setHealth:      (h: OnboardingData['health'])       => void;
  setMotivation:  (m: OnboardingData['motivation'])   => void;
  reset:          ()                                  => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  data: {},

  setGoal:       (goal)       => set((s) => ({ data: { ...s.data, goal } })),
  setProfile:    (profile)    => set((s) => ({ data: { ...s.data, profile } })),
  setLifestyle:  (lifestyle)  => set((s) => ({ data: { ...s.data, lifestyle } })),
  setTraining:   (training)   => set((s) => ({ data: { ...s.data, training } })),
  setNutrition:  (nutrition)  => set((s) => ({ data: { ...s.data, nutrition } })),
  setHealth:     (health)     => set((s) => ({ data: { ...s.data, health } })),
  setMotivation: (motivation) => set((s) => ({ data: { ...s.data, motivation } })),
  reset:         ()           => set({ data: {} }),
}));
