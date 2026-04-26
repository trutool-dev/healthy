/**
 * MacroCard — tarjeta de macronutrientes con barra de progreso individual
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors }     from '@/theme/colors';
import { textStyles } from '@/theme/typography';
import { spacing, borderRadius, shadows } from '@/theme/spacing';

interface MacroCardProps {
  label:   string;
  current: number;
  target:  number;
  unit?:   string;
  color:   string;
}

export function MacroCard({ label, current, target, unit = 'g', color }: MacroCardProps) {
  const pct = Math.min(current / target, 1);

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>
        <Text style={[styles.current, { color }]}>{Math.round(current)}</Text>
        <Text style={styles.target}> / {target}{unit}</Text>
      </Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex:            1,
    backgroundColor: colors.neutral.white,
    borderRadius:    borderRadius.input,
    padding:         spacing.md,
    gap:             spacing.xs,
    ...shadows.card,
  },
  label: {
    ...textStyles.caption,
    color:      colors.neutral.midGray,
    fontWeight: '600',
  },
  value: {
    ...textStyles.bodyNormal,
  },
  current: {
    fontWeight: '700',
    fontSize:   16,
  },
  target: {
    color:    colors.neutral.midGray,
    fontSize: 12,
  },
  track: {
    height:          4,
    borderRadius:    borderRadius.pill,
    backgroundColor: colors.neutral.lightGray,
    overflow:        'hidden',
    marginTop:       spacing.xs,
  },
  fill: {
    height:       '100%',
    borderRadius: borderRadius.pill,
  },
});
