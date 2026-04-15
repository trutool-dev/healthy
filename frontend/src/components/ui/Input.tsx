/**
 * Componente Input del sistema de diseño Healthy
 * Label flotante animado, estados: default, focused, error, disabled
 */

import React, { useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
  KeyboardTypeOptions,
} from 'react-native';
import { colors }     from '@/theme/colors';
import { fontSize, fontWeight } from '@/theme/typography';
import { borderRadius, componentHeight, duration, spacing, iconSize } from '@/theme/spacing';

interface InputProps {
  label:          string;
  value:          string;
  onChangeText:   (text: string) => void;
  errorMessage?:  string;
  hint?:          string;
  disabled?:      boolean;
  secureText?:    boolean;
  keyboardType?:  KeyboardTypeOptions;
  leftIcon?:      React.ReactNode;
  rightElement?:  React.ReactNode;
  style?:         ViewStyle;
  inputProps?:    Omit<TextInputProps, 'value' | 'onChangeText' | 'secureTextEntry' | 'keyboardType' | 'editable'>;
}

export function Input({
  label,
  value          = '',
  onChangeText,
  errorMessage,
  hint,
  disabled       = false,
  secureText     = false,
  keyboardType   = 'default',
  leftIcon,
  rightElement,
  style,
  inputProps     = {},
}: InputProps) {
  const [focused, setFocused] = useState(false);

  // Animación del label: sube y se reduce al enfocar o tener valor
  const labelAnim  = useRef(new Animated.Value(value ? 1 : 0)).current;
  const hasContent = value && value.length > 0;

  const animateLabel = (toValue: number) => {
    Animated.timing(labelAnim, {
      toValue,
      duration:        duration.normal,
      useNativeDriver: false,
    }).start();
  };

  const handleFocus = () => {
    setFocused(true);
    animateLabel(1);
  };

  const handleBlur = () => {
    setFocused(false);
    if (!hasContent) animateLabel(0);
  };

  const labelTop   = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [17, 6] });
  const labelSize  = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 11] });
  const labelColor = labelAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [colors.neutral.midGray, errorMessage ? colors.semantic.error : colors.primary.green],
  });

  const getBorderColor = () => {
    if (disabled)     return colors.neutral.lightGray;
    if (errorMessage) return colors.semantic.error;
    if (focused)      return colors.primary.green;
    return colors.neutral.lightGray;
  };

  return (
    <View style={[styles.wrapper, style]}>
      <View style={[styles.container, { borderColor: getBorderColor() }, disabled && styles.containerDisabled]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <View style={styles.inputArea}>
          {/* Label animado flotante */}
          <Animated.Text
            style={[styles.label, { top: labelTop, fontSize: labelSize, color: labelColor }]}
            numberOfLines={1}
          >
            {label}
          </Animated.Text>

          <TextInput
            style={[styles.input, disabled && styles.inputDisabled]}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            secureTextEntry={secureText}
            keyboardType={keyboardType}
            editable={!disabled}
            placeholderTextColor="transparent"
            selectionColor={colors.primary.green}
            {...inputProps}
          />
        </View>

        {(errorMessage || rightElement) && (
          <View style={styles.rightElement}>
            {errorMessage ? <ErrorIcon /> : rightElement}
          </View>
        )}
      </View>

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
}

function ErrorIcon() {
  return (
    <View style={errorIconStyles.circle}>
      <Text style={errorIconStyles.x}>✕</Text>
    </View>
  );
}

const errorIconStyles = StyleSheet.create({
  circle: {
    width:           iconSize.inline,
    height:          iconSize.inline,
    borderRadius:    iconSize.inline / 2,
    backgroundColor: colors.semantic.error,
    alignItems:      'center',
    justifyContent:  'center',
  },
  x: {
    color:      colors.neutral.white,
    fontSize:   10,
    fontWeight: '700',
    lineHeight: 12,
  },
});

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  container: {
    height:            componentHeight.input,
    backgroundColor:   colors.neutral.offWhite,
    borderRadius:      borderRadius.input,
    borderWidth:       1,
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: spacing.md,
  },
  containerDisabled: {
    backgroundColor: colors.neutral.lightGray,
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  inputArea: {
    flex:           1,
    justifyContent: 'center',
    position:       'relative',
  },
  label: {
    position: 'absolute',
    left:     0,
    fontSize: fontSize.bodyLarge,
    color:    colors.neutral.midGray,
    zIndex:   1,
  },
  input: {
    paddingTop:    18,
    paddingBottom:  4,
    fontSize:      fontSize.bodyLarge,
    color:         colors.neutral.darkGray,
    height:        '100%',
  },
  inputDisabled: {
    color: colors.neutral.midGray,
  },
  rightElement: {
    marginLeft: spacing.sm,
  },
  errorText: {
    marginTop:  spacing.xs,
    fontSize:   fontSize.caption,
    color:      colors.semantic.error,
    marginLeft: spacing.xs,
  },
  hintText: {
    marginTop:  spacing.xs,
    fontSize:   fontSize.caption,
    color:      colors.neutral.midGray,
    marginLeft: spacing.xs,
  },
});

export default Input;
