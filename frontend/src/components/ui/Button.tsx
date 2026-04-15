/**
 * Componente Button del sistema de diseño Healthy
 * Variantes: primary, secondary, ghost, destructive, disabled
 * Incluye animación de pressed state (escala 0.97, 100ms)
 */

import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors }                                                    from '@/theme/colors';
import { textStyles }                                                from '@/theme/typography';
import { borderRadius, shadows, componentHeight, duration, pressedScale } from '@/theme/spacing';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

interface ButtonProps {
  variant?:    ButtonVariant;
  label:       string;
  onPress?:    () => void;
  disabled?:   boolean;
  loading?:    boolean;
  style?:      ViewStyle;
  labelStyle?: TextStyle;
  leftIcon?:   React.ReactNode;
  rightIcon?:  React.ReactNode;
}

export function Button({
  variant     = 'primary',
  label,
  onPress,
  disabled    = false,
  loading     = false,
  style,
  labelStyle,
  leftIcon,
  rightIcon,
}: ButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue:         pressedScale,
      duration:        duration.fast,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue:         1,
      duration:        duration.fast,
      useNativeDriver: true,
    }).start();
  };

  const isDisabled      = disabled || loading;
  const resolvedVariant = isDisabled ? 'disabled' : variant;

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        onPress={!isDisabled ? onPress : undefined}
        onPressIn={!isDisabled ? handlePressIn : undefined}
        onPressOut={!isDisabled ? handlePressOut : undefined}
        style={[styles.base, styles[resolvedVariant]]}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        accessibilityLabel={label}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === 'primary' || variant === 'destructive'
              ? colors.neutral.white
              : colors.primary.green}
            size="small"
          />
        ) : (
          <View style={styles.content}>
            {leftIcon  && <View style={styles.iconLeft}>{leftIcon}</View>}
            <Text style={[styles.label, styles[`${resolvedVariant}Label` as keyof typeof styles], labelStyle]}>
              {label}
            </Text>
            {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    height:            componentHeight.button,
    borderRadius:      borderRadius.button,
    alignItems:        'center',
    justifyContent:    'center',
    width:             '100%',
    paddingHorizontal: 24,
  },
  content: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
  },
  iconLeft:  { marginRight: 8 },
  iconRight: { marginLeft:  8 },

  // Variantes de fondo / borde
  primary: {
    backgroundColor: colors.primary.green,
    ...shadows.button,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth:     1.5,
    borderColor:     colors.primary.green,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  destructive: {
    backgroundColor: colors.semantic.error,
  },
  disabled: {
    backgroundColor: colors.neutral.lightGray,
  },

  // Variantes de texto
  label: {
    ...textStyles.bodyLarge,
    fontWeight: '600',
  },
  primaryLabel: {
    color: colors.neutral.white,
  },
  secondaryLabel: {
    color: colors.primary.green,
  },
  ghostLabel: {
    color: colors.primary.green,
  },
  destructiveLabel: {
    color: colors.neutral.white,
  },
  disabledLabel: {
    color: colors.neutral.midGray,
  },
});

export default Button;
