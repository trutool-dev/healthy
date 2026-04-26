import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, ActivityIndicator, View, ViewStyle, TextStyle } from 'react-native';
import { colors }    from '@/theme/colors';
import { textStyles } from '@/theme/typography';
import { borderRadius, shadows, componentHeight, duration, pressedScale } from '@/theme/spacing';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

interface ButtonProps {
  variant?: ButtonVariant; label: string; onPress?: () => void;
  disabled?: boolean; loading?: boolean; style?: ViewStyle; labelStyle?: TextStyle;
  leftIcon?: React.ReactNode; rightIcon?: React.ReactNode;
}

export function Button({ variant = 'primary', label, onPress, disabled = false, loading = false, style, labelStyle, leftIcon, rightIcon }: ButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const animate = (v: number) => Animated.timing(scaleAnim, { toValue: v, duration: duration.fast, useNativeDriver: true }).start();
  const isDisabled = disabled || loading;
  const v = isDisabled ? 'disabled' : variant;

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        onPress={!isDisabled ? onPress : undefined}
        onPressIn={!isDisabled ? () => animate(pressedScale) : undefined}
        onPressOut={!isDisabled ? () => animate(1) : undefined}
        style={[styles.base, styles[v]]}
        accessibilityRole="button" accessibilityState={{ disabled: isDisabled, busy: loading }}
        accessibilityLabel={label}
      >
        {loading ? (
          <ActivityIndicator color={v === 'primary' || v === 'destructive' ? colors.neutral.white : colors.primary.green} size="small" />
        ) : (
          <View style={styles.content}>
            {leftIcon  && <View style={styles.iconLeft}>{leftIcon}</View>}
            <Text style={[styles.label, styles[`${v}Label` as keyof typeof styles] as TextStyle, labelStyle]}>{label}</Text>
            {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base:             { height: componentHeight.button, borderRadius: borderRadius.button, alignItems: 'center', justifyContent: 'center', width: '100%', paddingHorizontal: 24 },
  content:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  iconLeft:         { marginRight: 8 },
  iconRight:        { marginLeft: 8 },
  label:            { ...textStyles.bodyLarge, fontWeight: '600' },
  primary:          { backgroundColor: colors.primary.green, ...shadows.button },
  secondary:        { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary.green },
  ghost:            { backgroundColor: 'transparent' },
  destructive:      { backgroundColor: colors.semantic.error },
  disabled:         { backgroundColor: colors.neutral.lightGray },
  primaryLabel:     { color: colors.neutral.white },
  secondaryLabel:   { color: colors.primary.green },
  ghostLabel:       { color: colors.primary.green },
  destructiveLabel: { color: colors.neutral.white },
  disabledLabel:    { color: colors.neutral.midGray },
});

export default Button;
