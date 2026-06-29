/**
 * ProgressScreen — métricas de evolución: peso, racha, estadísticas y logros
 */

import React, { useState } from 'react';
import {
  SafeAreaView, ScrollView, StyleSheet,
  Text, View, Pressable,
} from 'react-native';
import { usePlanStore }                        from '@/stores/planStore';
import { ActivityRings, DailyProgressRing }   from '@/components/ui/ProgressRing';
import { MetricCard, RecoveryScore, MetricGrid } from '@/components/ui/MetricCard';
import { colors }                              from '@/theme/colors';
import { textStyles }                          from '@/theme/typography';
import { spacing, borderRadius, shadows }      from '@/theme/spacing';

// ── Gráfico de barras simple (sin librería externa) ──────────────────────────

function WeightChart({ entries }: { entries: { date: string; value: number }[] }) {
  if (entries.length === 0) return null;
  const values = entries.map((e) => e.value);
  const min    = Math.min(...values) - 1;
  const max    = Math.max(...values) + 1;
  const range  = max - min;

  return (
    <View style={chartStyles.wrapper}>
      {/* Líneas de referencia */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <View key={t} style={[chartStyles.gridLine, { bottom: `${t * 100}%` as any }]} />
      ))}

      {/* Barras */}
      <View style={chartStyles.bars}>
        {entries.map((e, i) => {
          const h      = range > 0 ? ((e.value - min) / range) * 100 : 50;
          const isLast = i === entries.length - 1;
          return (
            <View key={i} style={chartStyles.barCol}>
              <View
                style={[
                  chartStyles.bar,
                  {
                    height:          `${h}%` as any,
                    backgroundColor: isLast ? colors.primary.green : colors.primary.lightGreen,
                  },
                ]}
              >
                {isLast && <Text style={chartStyles.barLabel}>{e.value}</Text>}
              </View>
              <Text style={chartStyles.barDate}>{e.date}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ── Calendario de racha (últimas 4 semanas) ──────────────────────────────────

function StreakCalendar({ streak }: { streak: number }) {
  const days  = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const weeks = 4;
  const cells = Array.from({ length: weeks * 7 }, (_, i) => {
    const daysAgo = weeks * 7 - 1 - i;
    return daysAgo < streak;
  });

  return (
    <View style={calStyles.grid}>
      {days.map((d) => <Text key={d} style={calStyles.dayLabel}>{d}</Text>)}
      {cells.map((done, i) => (
        <View key={i} style={[calStyles.cell, done && calStyles.cellDone]} />
      ))}
    </View>
  );
}

// ── Pantalla ─────────────────────────────────────────────────────────────────

const PERIODS = ['Semana', 'Mes', '3 meses'];

export function ProgressScreen() {
  const { weightHistory, streak, todayWorkout, todayMeals } = usePlanStore();
  const [period, setPeriod] = useState(0);

  const lastWeight  = weightHistory.at(-1)?.value ?? 0;
  const firstWeight = weightHistory[0]?.value      ?? 0;
  const weightDiff  = +(firstWeight - lastWeight).toFixed(1);

  const mealsCompleted = todayMeals.filter((m) => m.completed).length;
  const exCompleted    = todayWorkout.exercises.filter((e) => e.completed).length;
  const totalCount     = todayWorkout.exercises.length;
  const pct            = totalCount > 0 ? exCompleted / totalCount : 0;
  const allDone        = exCompleted === totalCount && totalCount > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Text style={styles.title}>Mi progreso</Text>

        {/* Score de recuperación protagonista */}
        <RecoveryScore
          score={Math.round((exCompleted / Math.max(totalCount, 1)) * 100)}
          message={allDone ? 'Objetivos del día completados' : 'Sigue con tu plan'}
          hrv={undefined}
          restingHr={undefined}
        />

        {/* Cuadrícula de métricas */}
        <MetricGrid
          metrics={[
            {
              label:       'Peso actual',
              value:       `${lastWeight}`,
              unit:        'kg',
              trend:       weightDiff > 0 ? -weightDiff : weightDiff,
              trendLabel:  'total',
              accentColor: colors.primary.green,
              icon:        '⚖️',
            },
            {
              label:       'Racha',
              value:       `${streak}`,
              unit:        'días',
              accentColor: '#F59E0B',
              icon:        '🔥',
            },
            {
              label:       'Entrenos',
              value:       '12',
              unit:        'este mes',
              accentColor: colors.semantic.info,
              icon:        '💪',
            },
            {
              label:       'Comidas',
              value:       `${mealsCompleted}`,
              unit:        `/ ${todayMeals.length}`,
              accentColor: colors.semantic.success,
              icon:        '🥗',
            },
          ]}
        />

        {/* Selector de período */}
        <View style={styles.periodRow}>
          {PERIODS.map((p, i) => (
            <Pressable
              key={p}
              onPress={() => setPeriod(i)}
              style={[styles.periodBtn, period === i && styles.periodBtnActive]}
            >
              <Text style={[styles.periodText, period === i && styles.periodTextActive]}>{p}</Text>
            </Pressable>
          ))}
        </View>

        {/* Anillos de actividad centrados */}
        <View style={styles.ringsWrapper}>
          <ActivityRings
            move={pct}
            exercise={exCompleted / Math.max(totalCount, 1)}
            stand={mealsCompleted / Math.max(todayMeals.length, 1)}
            size={140}
          />
        </View>

        {/* Gráfico de peso */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Evolución del peso</Text>
            <Text style={styles.chartDiff}>
              {weightDiff > 0
                ? <Text style={{ color: colors.primary.green }}>↓ -{weightDiff} kg</Text>
                : <Text style={{ color: colors.semantic.error }}>↑ +{Math.abs(weightDiff)} kg</Text>
              }
            </Text>
          </View>
          <WeightChart entries={weightHistory} />
        </View>

        {/* Racha */}
        <View style={styles.sectionCard}>
          <View style={styles.streakHeader}>
            <Text style={styles.sectionTitle}>Racha de entrenamiento 🔥</Text>
            <View style={styles.streakBadge}>
              <Text style={styles.streakNum}>{streak}</Text>
              <Text style={styles.streakLabel}>días</Text>
            </View>
          </View>
          <StreakCalendar streak={streak} />
          <Text style={styles.streakHint}>¡Sigue así! Cada día cuenta para tu racha.</Text>
        </View>

        {/* Hoy en resumen */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Resumen de hoy</Text>
          <View style={styles.todaySummary}>
            <TodayRow icon="🥗" label="Comidas"    value={`${mealsCompleted}/${todayMeals.length}`} done={mealsCompleted === todayMeals.length} />
            <TodayRow icon="🏋️" label="Ejercicios" value={`${exCompleted}/${todayWorkout.exercises.length}`} done={exCompleted === todayWorkout.exercises.length} />
          </View>
        </View>

        {/* Logros */}
        <Text style={styles.achievementsTitle}>Logros</Text>
        <View style={styles.achievementsRow}>
          {ACHIEVEMENTS.map((a) => (
            <View key={a.id} style={[styles.achievement, !a.unlocked && styles.achievementLocked]}>
              <Text style={[styles.achievementIcon, !a.unlocked && styles.achievementIconLocked]}>{a.icon}</Text>
              <Text style={[styles.achievementLabel, !a.unlocked && styles.achievementLabelLocked]}>{a.label}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function TodayRow({ icon, label, value, done }: { icon: string; label: string; value: string; done: boolean }) {
  return (
    <View style={todayStyles.row}>
      <Text style={todayStyles.icon}>{icon}</Text>
      <Text style={todayStyles.label}>{label}</Text>
      <Text style={[todayStyles.value, done && todayStyles.valueDone]}>{value}</Text>
      {done && <Text style={todayStyles.check}>✓</Text>}
    </View>
  );
}

const ACHIEVEMENTS = [
  { id: 'a1', icon: '🌱', label: 'Primera semana',  unlocked: true  },
  { id: 'a2', icon: '🔥', label: '7 días de racha', unlocked: true  },
  { id: 'a3', icon: '💪', label: '10 entrenos',     unlocked: true  },
  { id: 'a4', icon: '⚖️', label: '-5 kg',           unlocked: false },
  { id: 'a5', icon: '🏆', label: '30 días racha',   unlocked: false },
  { id: 'a6', icon: '🥗', label: 'Mes perfecto',    unlocked: false },
];

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.neutral.offWhite },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  title:  { ...textStyles.titleMedium, color: colors.neutral.black, marginBottom: spacing.lg },

  periodRow: {
    flexDirection: 'row', backgroundColor: colors.neutral.lightGray,
    borderRadius: borderRadius.pill, padding: 3, marginBottom: spacing.lg,
  },
  periodBtn:        { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: borderRadius.pill },
  periodBtnActive:  { backgroundColor: colors.neutral.white, ...shadows.card },
  periodText:       { ...textStyles.bodyNormal, color: colors.neutral.midGray },
  periodTextActive: { color: colors.neutral.darkGray, fontWeight: '600' },

  ringsWrapper: { alignItems: 'center', marginBottom: spacing.lg },

  chartCard: {
    backgroundColor: colors.neutral.white, borderRadius: borderRadius.card,
    padding: spacing.lg, ...shadows.card, marginBottom: spacing.lg,
  },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  chartTitle:  { ...textStyles.bodyLarge, fontWeight: '600', color: colors.neutral.black },
  chartDiff:   { ...textStyles.bodyNormal, fontWeight: '700' },

  sectionCard: {
    backgroundColor: colors.neutral.white, borderRadius: borderRadius.card,
    padding: spacing.lg, ...shadows.card, marginBottom: spacing.lg,
  },
  sectionTitle: { ...textStyles.bodyLarge, fontWeight: '600', color: colors.neutral.black, marginBottom: spacing.md },

  streakHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  streakBadge:  { flexDirection: 'row', alignItems: 'baseline', gap: 4, backgroundColor: '#FEF3C7', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.pill },
  streakNum:    { ...textStyles.titleSmall, color: '#D97706' },
  streakLabel:  { ...textStyles.caption, color: '#92400E' },
  streakHint:   { ...textStyles.caption, color: colors.neutral.midGray, textAlign: 'center', marginTop: spacing.md },

  todaySummary: { gap: spacing.sm },

  achievementsTitle: { ...textStyles.titleSmall, color: colors.neutral.black, marginBottom: spacing.md },
  achievementsRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  achievement: {
    alignItems: 'center', gap: spacing.xs, flex: 1, minWidth: 80,
    backgroundColor: colors.neutral.white, borderRadius: borderRadius.card,
    padding: spacing.md, ...shadows.card,
    borderWidth: 1.5, borderColor: colors.primary.lightGreen,
  },
  achievementLocked:      { borderColor: colors.neutral.lightGray, backgroundColor: colors.neutral.offWhite },
  achievementIcon:        { fontSize: 28 },
  achievementIconLocked:  { opacity: 0.3 },
  achievementLabel:       { ...textStyles.caption, color: colors.neutral.darkGray, fontWeight: '600', textAlign: 'center' },
  achievementLabelLocked: { color: colors.neutral.midGray },
});

const chartStyles = StyleSheet.create({
  wrapper:  { height: 140, position: 'relative' },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: colors.neutral.lightGray },
  bars:     { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  barCol:   { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  bar:      { width: '80%', borderRadius: 4, minHeight: 8, justifyContent: 'flex-start', alignItems: 'center' },
  barLabel: { ...textStyles.caption, color: colors.primary.darkGreen, fontWeight: '700', marginTop: -18 },
  barDate:  { ...textStyles.caption, color: colors.neutral.midGray, marginTop: 4, fontSize: 9 },
});

const calStyles = StyleSheet.create({
  grid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  dayLabel: { width: 28, textAlign: 'center', ...textStyles.caption, color: colors.neutral.midGray, fontWeight: '600' },
  cell:     { width: 28, height: 28, borderRadius: 6, backgroundColor: colors.neutral.lightGray },
  cellDone: { backgroundColor: colors.primary.green },
});

const todayStyles = StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xs },
  icon:      { fontSize: 20, width: 28, textAlign: 'center' },
  label:     { ...textStyles.bodyNormal, color: colors.neutral.darkGray, flex: 1 },
  value:     { ...textStyles.bodyNormal, color: colors.neutral.midGray, fontWeight: '700' },
  valueDone: { color: colors.primary.green },
  check:     { color: colors.primary.green, fontWeight: '700', fontSize: 16 },
});

export default ProgressScreen;
