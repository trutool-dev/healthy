import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { colors }    from '@/theme/colors';
import { borderRadius, shadows, spacing, duration, pressedScale } from '@/theme/spacing';

export type CardVariant = 'default' | 'elevated' | 'pressable' | 'highlight';

interface CardProps {
  children: React.ReactNode; variant?: CardVariant; onPress?: () => void;
  style?: ViewStyle; contentStyle?: ViewStyle; noPadding?: boolean;
}

export function Card({ children, variant = 'default', onPress, style, contentStyle, noPadding = false }: CardProps) {
  const scaleAnim  = useRef(new Animated.Value(1)).current;
  const isPressable = !!(onPress || variant === 'pressable');
  const animate = (v: number) => Animated.timing(scaleAnim, { toValue: v, duration: duration.fast, useNativeDriver: true }).start();
  const cardStyle = [styles.base, styles[variant] ?? styles.default, style];
  const innerStyle = [!noPadding && styles.padding, contentStyle];

  if (isPressable) return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable onPress={onPress} onPressIn={() => animate(pressedScale)} onPressOut={() => animate(1)} style={cardStyle} accessibilityRole="button">
        <View style={innerStyle}>{children}</View>
      </Pressable>
    </Animated.View>
  );

  return <View style={cardStyle}><View style={innerStyle}>{children}</View></View>;
}

export function CardRow({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, style]}>{children}</View>;
}

export function CardDivider({ style }: { style?: ViewStyle }) {
  return <View style={[{ height: 1, backgroundColor: colors.neutral.lightGray, marginVertical: spacing.md, marginHorizontal: -20 }, style]} />;
}

const styles = StyleSheet.create({
  base:      { borderRadius: borderRadius.card, backgroundColor: colors.neutral.white, marginBottom: 12, overflow: 'hidden' },
  padding:   { padding: 20 },
  default:   { ...shadows.card },
  elevated:  { ...shadows.modal },
  pressable: { ...shadows.card },
  highlight: { ...shadows.card, borderWidth: 1.5, borderColor: colors.primary.green, backgroundColor: colors.primary.lightGreen },
});

export default Card;
