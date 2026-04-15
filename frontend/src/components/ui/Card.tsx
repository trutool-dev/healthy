/**
 * Componente Card del sistema de diseño Healthy
 * Variantes: default, elevated, pressable, highlight
 */

import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { colors }      from '@/theme/colors';
import { borderRadius, shadows, spacing, duration, pressedScale } from '@/theme/spacing';

export type CardVariant = 'default' | 'elevated' | 'pressable' | 'highlight';

interface CardProps {
  children:      React.ReactNode;
  variant?:      CardVariant;
  onPress?:      () => void;
  style?:        ViewStyle;
  contentStyle?: ViewStyle;
  noPadding?:    boolean;
}

export function Card({
  children,
  variant      = 'default',
  onPress,
  style,
  contentStyle,
  noPadding    = false,
}: CardProps) {
  const scaleAnim   = useRef(new Animated.Value(1)).current;
  const isPressable = !!(onPress || variant === 'pressable');

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

  const cardStyles  = [styles.base, styles[variant] ?? styles.default, style];
  const innerStyles = [!noPadding && styles.padding, contentStyle];

  if (isPressable) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={cardStyles}
          accessibilityRole="button"
        >
          <View style={innerStyles}>{children}</View>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <View style={cardStyles}>
      <View style={innerStyles}>{children}</View>
    </View>
  );
}

// Layout horizontal para filas de métricas dentro de una Card
export function CardRow({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[rowStyles.row, style]}>{children}</View>;
}

// Separador horizontal entre secciones de una Card
export function CardDivider({ style }: { style?: ViewStyle }) {
  return <View style={[dividerStyles.line, style]} />;
}

const styles = StyleSheet.create({
  base: {
    borderRadius:    borderRadius.card,
    backgroundColor: colors.neutral.white,
    marginBottom:    12,
    overflow:        'hidden',
  },
  padding: {
    padding: 20,
  },
  default: {
    ...shadows.card,
  },
  elevated: {
    ...shadows.modal,
  },
  pressable: {
    ...shadows.card,
  },
  highlight: {
    ...shadows.card,
    borderWidth:     1.5,
    borderColor:     colors.primary.green,
    backgroundColor: colors.primary.lightGreen,
  },
});

const rowStyles = StyleSheet.create({
  row: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
});

const dividerStyles = StyleSheet.create({
  line: {
    height:           1,
    backgroundColor:  colors.neutral.lightGray,
    marginVertical:   spacing.md,
    marginHorizontal: -20,
  },
});

export default Card;
