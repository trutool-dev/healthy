/**
 * ProgressBar — barra de progreso del onboarding
 * Muestra el paso actual sobre el total con animación de llenado
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors }                   from '@/theme/colors';
import { textStyles }               from '@/theme/typography';
import { spacing, borderRadius, duration } from '@/theme/spacing';

interface ProgressBarProps {
  /** Paso actual (1-based) */
  current: number;
  /** Total de pasos */
  total:   number;
  /** Oculta el contador numérico */
  hideLabel?: boolean;
  style?:    ViewStyle;
}

export function ProgressBar({ current, total, hideLabel = false, style }: ProgressBarProps) {
  const progress = Math.min(Math.max(current / total, 0), 1);
  const widthAnim = useRef(new Animated.Value(progress)).current;

  // Anima el progreso cuando cambia el paso
  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue:         progress,
      duration:        duration.medium,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const animatedWidth = widthAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.wrapper, style]}>
      {!hideLabel && (
        <Text style={styles.label}>
          {current} <Text style={styles.labelTotal}>/ {total}</Text>
        </Text>
      )}
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: animatedWidth }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    gap:   spacing.xs,
  },
  label: {
    ...textStyles.label,
    color:     colors.primary.green,
    alignSelf: 'flex-end',
  },
  labelTotal: {
    color: colors.neutral.midGray,
  },
  track: {
    height:          6,
    borderRadius:    borderRadius.pill,
    backgroundColor: colors.neutral.lightGray,
    overflow:        'hidden',
  },
  fill: {
    height:          '100%',
    borderRadius:    borderRadius.pill,
    backgroundColor: colors.primary.green,
  },
});

export default ProgressBar;
