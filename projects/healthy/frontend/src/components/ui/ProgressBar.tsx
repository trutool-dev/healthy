import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors }    from '@/theme/colors';
import { textStyles } from '@/theme/typography';
import { spacing, borderRadius, duration } from '@/theme/spacing';

interface ProgressBarProps {
  current:    number;
  total:      number;
  hideLabel?: boolean;
  style?:     ViewStyle;
  accessibilityLabel?: string;
}

export function ProgressBar({ current, total, hideLabel = false, style, accessibilityLabel }: ProgressBarProps) {
  const progress  = Math.min(Math.max(current / total, 0), 1);
  const widthAnim = useRef(new Animated.Value(progress)).current;

  useEffect(() => {
    Animated.timing(widthAnim, { toValue: progress, duration: duration.medium, useNativeDriver: false }).start();
  }, [progress]);

  const animW = widthAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View
      style={[styles.wrapper, style]}
      accessibilityLabel={accessibilityLabel ?? `Progreso: ${current} de ${total}`}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: total, now: current }}
    >
      {!hideLabel && (
        <Text style={styles.label}>
          {current} <Text style={styles.total}>/ {total}</Text>
        </Text>
      )}
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: animW }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%', gap: spacing.xs },
  label:   { ...textStyles.label, color: colors.primary.darkGreen, alignSelf: 'flex-end' }, // FE-12: darkGreen
  total:   { color: colors.neutral.midGray },
  track:   { height: 6, borderRadius: borderRadius.pill, backgroundColor: colors.neutral.lightGray, overflow: 'hidden' },
  fill:    { height: '100%', borderRadius: borderRadius.pill, backgroundColor: colors.primary.darkGreen }, // FE-12
});

export default ProgressBar;
