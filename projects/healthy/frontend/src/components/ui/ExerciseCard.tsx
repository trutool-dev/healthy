/**
 * ExerciseCard — tarjeta de ejercicio con series, repeticiones y peso
 * Pulsable para marcar como completado
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Exercise }   from '@/stores/planStore';
import { colors }     from '@/theme/colors';
import { textStyles } from '@/theme/typography';
import { spacing, borderRadius, shadows } from '@/theme/spacing';

interface ExerciseCardProps {
  exercise:  Exercise;
  onToggle?: (id: string) => void;
}

export function ExerciseCard({ exercise, onToggle }: ExerciseCardProps) {
  const { id, name, muscleGroup, sets, reps, weight, restSeconds, completed } = exercise;

  return (
    <Pressable
      onPress={() => onToggle?.(id)}
      style={[styles.card, completed && styles.cardDone]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: completed }}
    >
      {/* Check circle */}
      <View style={[styles.check, completed && styles.checkDone]}>
        {completed && <Text style={styles.checkMark}>✓</Text>}
      </View>

      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={[styles.name, completed && styles.nameDone]} numberOfLines={1}>{name}</Text>
          <View style={[styles.muscle, completed && styles.muscleDone]}>
            <Text style={[styles.muscleText, completed && styles.muscleTextDone]}>{muscleGroup}</Text>
          </View>
        </View>

        {/* Series · Reps · Peso */}
        <View style={styles.stats}>
          <Stat label="Series" value={`${sets}`} />
          <StatDivider />
          <Stat label="Reps"   value={`${reps}`} />
          {weight !== undefined && <>
            <StatDivider />
            <Stat label="Peso" value={`${weight} kg`} />
          </>}
          <StatDivider />
          <Stat label="Descanso" value={`${restSeconds}s`} />
        </View>
      </View>
    </Pressable>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={statStyles.item}>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

function StatDivider() {
  return <View style={statStyles.divider} />;
}

const styles = StyleSheet.create({
  card: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             spacing.md,
    backgroundColor: colors.neutral.white,
    borderRadius:    borderRadius.card,
    padding:         spacing.md,
    marginBottom:    spacing.sm,
    borderWidth:     1.5,
    borderColor:     colors.neutral.lightGray,
    ...shadows.card,
  },
  cardDone: {
    backgroundColor: colors.neutral.offWhite,
    borderColor:     colors.primary.lightGreen,
  },
  check: {
    width:           28,
    height:          28,
    borderRadius:    14,
    borderWidth:     2,
    borderColor:     colors.neutral.lightGray,
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
  },
  checkDone: {
    borderColor:     colors.primary.green,
    backgroundColor: colors.primary.green,
  },
  checkMark: {
    color:      colors.neutral.white,
    fontSize:   14,
    fontWeight: '700',
    lineHeight: 16,
  },
  body: { flex: 1 },
  row:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  name: {
    ...textStyles.bodyLarge,
    fontWeight: '600',
    color:      colors.neutral.darkGray,
    flex:       1,
  },
  nameDone: { color: colors.neutral.midGray, textDecorationLine: 'line-through' },
  muscle: {
    backgroundColor: colors.neutral.lightGray,
    borderRadius:    borderRadius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical:   2,
    marginLeft:        spacing.sm,
  },
  muscleDone: { backgroundColor: colors.primary.lightGreen },
  muscleText: { ...textStyles.caption, color: colors.neutral.midGray, fontWeight: '600' },
  muscleTextDone: { color: colors.primary.darkGreen },
  stats: { flexDirection: 'row', alignItems: 'center' },
});

const statStyles = StyleSheet.create({
  item:    { alignItems: 'center', flex: 1 },
  value:   { ...textStyles.bodyNormal, fontWeight: '700', color: colors.neutral.darkGray },
  label:   { ...textStyles.caption,   color: colors.neutral.midGray },
  divider: { width: 1, height: 24, backgroundColor: colors.neutral.lightGray },
});
