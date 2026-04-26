/**
 * TrainingScreen — sesión de entrenamiento del día con lista de ejercicios
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, Easing, Pressable, SafeAreaView,
  ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { usePlanStore }   from '@/stores/planStore';
import { ExerciseCard }   from '@/components/ui/ExerciseCard';
import { Button }         from '@/components/ui/Button';
import { colors }         from '@/theme/colors';
import { textStyles }     from '@/theme/typography';
import { spacing, borderRadius, shadows } from '@/theme/spacing';

export function TrainingScreen() {
  const { todayWorkout, toggleExercise } = usePlanStore();
  const [restTimer, setRestTimer]        = useState<number | null>(null);
  const [timerRunning, setTimerRunning]  = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const completedCount = todayWorkout.exercises.filter((e) => e.completed).length;
  const totalCount     = todayWorkout.exercises.length;
  const allDone        = completedCount === totalCount;
  const pct            = totalCount > 0 ? completedCount / totalCount : 0;

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

        {/* Barra de progreso */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progreso</Text>
            <Animated.Text style={[styles.progressFraction, { transform: [{ scale: pulseAnim }] }]}>
              {completedCount}/{totalCount}
            </Animated.Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${pct * 100}%` }]} />
          </View>
          {allDone && <Text style={styles.doneBanner}>🎉 ¡Sesión completada!</Text>}
        </View>

        {/* Temporizador de descanso */}
        {timerRunning && restTimer !== null && restTimer > 0 && (
          <View style={styles.restTimer}>
            <Text style={styles.restEmoji}>⏳</Text>
            <View>
              <Text style={styles.restLabel}>Descanso</Text>
              <Text style={styles.restSeconds}>{restTimer}s</Text>
            </View>
            <Pressable onPress={() => { setTimerRunning(false); setRestTimer(null); }} style={styles.skipBtn}>
              <Text style={styles.skipText}>Saltar</Text>
            </Pressable>
          </View>
        )}

        {/* Lista de ejercicios agrupada por músculo */}
        {todayWorkout.muscleGroups.map((group) => {
          const exs = todayWorkout.exercises.filter((e) => e.muscleGroup === group);
          if (exs.length === 0) return null;
          return (
            <View key={group}>
              <Text style={styles.groupTitle}>{group}</Text>
              {exs.map((e) => (
                <ExerciseCard key={e.id} exercise={e} onToggle={handleToggle} />
              ))}
            </View>
          );
        })}

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

  // Progreso
  progressCard: {
    backgroundColor: colors.neutral.white, borderRadius: borderRadius.card,
    padding: spacing.md, ...shadows.card, marginBottom: spacing.lg,
  },
  progressHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  progressLabel:    { ...textStyles.bodyNormal, color: colors.neutral.midGray },
  progressFraction: { ...textStyles.titleSmall, color: colors.primary.green },
  progressTrack: {
    height: 8, backgroundColor: colors.neutral.lightGray,
    borderRadius: borderRadius.pill, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.primary.green, borderRadius: borderRadius.pill },
  doneBanner: { ...textStyles.bodyNormal, color: colors.primary.darkGreen, fontWeight: '600', textAlign: 'center', marginTop: spacing.md },

  // Timer descanso
  restTimer: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: '#FEF3C7', borderRadius: borderRadius.card,
    padding: spacing.md, marginBottom: spacing.lg, ...shadows.card,
    borderWidth: 1.5, borderColor: '#FCD34D',
  },
  restEmoji:   { fontSize: 28 },
  restLabel:   { ...textStyles.caption, color: '#92400E', fontWeight: '600' },
  restSeconds: { ...textStyles.titleSmall, color: '#D97706' },
  skipBtn: {
    marginLeft: 'auto', paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill, borderWidth: 1.5, borderColor: '#D97706',
  },
  skipText: { ...textStyles.caption, color: '#D97706', fontWeight: '700' },

  groupTitle: { ...textStyles.label, color: colors.neutral.midGray, marginTop: spacing.lg, marginBottom: spacing.sm },
  cta:        { marginTop: spacing.lg },
});

export default TrainingScreen;
