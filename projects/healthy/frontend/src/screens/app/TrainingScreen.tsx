/**
 * TrainingScreen — sesión de entrenamiento del día con lista de ejercicios
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, Easing, SafeAreaView,
  ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { usePlanStore }   from '@/stores/planStore';
import { WorkoutCard, ExerciseRow, RestTimer, WorkoutSummary } from '@/components/ui/WorkoutCard';
import { DailyProgressRing } from '@/components/ui/ProgressRing';
import { Button }         from '@/components/ui/Button';
import { colors }         from '@/theme/colors';
import { textStyles }     from '@/theme/typography';
import { spacing, borderRadius } from '@/theme/spacing';

export function TrainingScreen() {
  const { todayWorkout, toggleExercise } = usePlanStore();
  const [restTimer, setRestTimer]        = useState<number | null>(null);
  const [timerRunning, setTimerRunning]  = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const completedCount = todayWorkout.exercises.filter((e) => e.completed).length;
  const totalCount     = todayWorkout.exercises.length;
  const allDone        = completedCount === totalCount;
  const pct            = totalCount > 0 ? completedCount / totalCount : 0;

  // Id del primer ejercicio no completado (activo actual)
  const activeExerciseId = todayWorkout.exercises.find((e) => !e.completed)?.id ?? null;

  // Pulso en el contador cuando queda poco
  useEffect(() => {
    if (pct > 0.5) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    }
  }, [pct > 0.5]);

  // Temporizador de descanso
  useEffect(() => {
    if (!timerRunning || restTimer === null) return;
    if (restTimer === 0) { setTimerRunning(false); return; }
    const t = setTimeout(() => setRestTimer((v) => (v ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [timerRunning, restTimer]);

  const handleToggle = (id: string) => {
    const ex = todayWorkout.exercises.find((e) => e.id === id);
    if (ex && !ex.completed) {
      setRestTimer(ex.restSeconds);
      setTimerRunning(true);
    } else {
      setTimerRunning(false);
      setRestTimer(null);
    }
    toggleExercise(id);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Cabecera */}
        <Text style={styles.title}>{todayWorkout.name}</Text>
        <View style={styles.metaRow}>
          {todayWorkout.muscleGroups.map((g) => (
            <View key={g} style={styles.chip}>
              <Text style={styles.chipText}>{g}</Text>
            </View>
          ))}
          <View style={styles.chip}>
            <Text style={styles.chipText}>⏱ {todayWorkout.durationMinutes} min</Text>
          </View>
        </View>

        {/* Anillo de progreso diario */}
        <View style={styles.ringWrapper}>
          <DailyProgressRing progress={pct} label="Sesión de hoy" size={160} />
        </View>

        {/* Temporizador de descanso */}
        {timerRunning && restTimer !== null && restTimer > 0 && (
          <RestTimer
            totalSeconds={restTimer ?? 90}
            remaining={restTimer ?? 0}
            onComplete={() => { setTimerRunning(false); setRestTimer(null); }}
          />
        )}

        {/* Lista de ejercicios agrupada por músculo */}
        {todayWorkout.muscleGroups.map((group) => {
          const exs = todayWorkout.exercises.filter((e) => e.muscleGroup === group);
          if (exs.length === 0) return null;
          return (
            <View key={group}>
              <Text style={styles.groupTitle}>{group}</Text>
              {exs.map((e) => (
                <ExerciseRow
                  key={e.id}
                  name={e.name}
                  detail={`${e.sets} × ${e.reps} reps`}
                  completed={e.completed}
                  active={activeExerciseId === e.id}
                  onToggle={() => handleToggle(e.id)}
                />
              ))}
            </View>
          );
        })}

        {/* Resumen al finalizar */}
        {allDone && (
          <WorkoutSummary
            duration={todayWorkout.durationMinutes}
            calories={todayWorkout.estimatedCalories ?? 0}
            exercises={totalCount}
            sets={todayWorkout.exercises.reduce((acc, e) => acc + (e.sets ?? 1), 0)}
            workoutName={todayWorkout.name}
          />
        )}

        {/* CTA finalizar */}
        <Button
          label={allDone ? '✓ Sesión completada' : `Completar sesión (${completedCount}/${totalCount})`}
          variant={allDone ? 'secondary' : 'primary'}
          disabled={!allDone}
          style={styles.cta}
        />

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.neutral.offWhite },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  title:  { ...textStyles.titleMedium, color: colors.neutral.black, marginBottom: spacing.sm },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  chip: {
    backgroundColor: colors.neutral.lightGray, borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
  },
  chipText: { ...textStyles.caption, color: colors.neutral.darkGray, fontWeight: '600' },

  ringWrapper: { alignItems: 'center', marginBottom: spacing.lg },

  groupTitle: { ...textStyles.label, color: colors.neutral.midGray, marginTop: spacing.lg, marginBottom: spacing.sm },
  cta:        { marginTop: spacing.lg },
});

export default TrainingScreen;
