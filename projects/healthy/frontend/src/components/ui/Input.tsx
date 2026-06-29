import React, { useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle, KeyboardTypeOptions } from 'react-native';
import { colors }   from '@/theme/colors';
import { fontSize } from '@/theme/typography';
import { borderRadius, componentHeight, duration, spacing, iconSize } from '@/theme/spacing';

interface InputProps {
  label: string; value: string; onChangeText: (t: string) => void;
  errorMessage?: string; hint?: string; disabled?: boolean;
  secureText?: boolean; keyboardType?: KeyboardTypeOptions;
  leftIcon?: React.ReactNode; rightElement?: React.ReactNode;
  style?: ViewStyle; inputProps?: Omit<TextInputProps, 'value' | 'onChangeText' | 'secureTextEntry' | 'keyboardType' | 'editable'>;
}

export function Input({ label, value = '', onChangeText, errorMessage, hint, disabled = false, secureText = false, keyboardType = 'default', leftIcon, rightElement, style, inputProps = {} }: InputProps) {
  const [focused, setFocused] = useState(false);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const hasContent = value.length > 0;

  const animate = (v: number) => Animated.timing(labelAnim, { toValue: v, duration: duration.normal, useNativeDriver: false }).start();

  const borderColor = disabled ? colors.neutral.lightGray : errorMessage ? colors.semantic.error : focused ? colors.primary.green : colors.neutral.lightGray;
  const labelTop   = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [17, 6] });
  const labelSize  = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 11] });
  const labelColor = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [colors.neutral.midGray, errorMessage ? colors.semantic.error : colors.primary.green] });

  return (
    <View style={[styles.wrapper, style]}>
      <View style={[styles.container, { borderColor }, disabled && styles.disabled]}>
        {leftIcon && <View style={{ marginRight: spacing.sm }}>{leftIcon}</View>}
        <View style={styles.inputArea}>
          <Animated.Text style={[styles.label, { top: labelTop, fontSize: labelSize, color: labelColor }]} numberOfLines={1}>{label}</Animated.Text>
          <TextInput style={[styles.input, disabled && { color: colors.neutral.midGray }]} value={value} onChangeText={onChangeText}
            onFocus={() => { setFocused(true); animate(1); }} onBlur={() => { setFocused(false); if (!hasContent) animate(0); }}
            secureTextEntry={secureText} keyboardType={keyboardType} editable={!disabled}
            placeholderTextColor="transparent" selectionColor={colors.primary.green} {...inputProps} />
        </View>
        {(errorMessage || rightElement) && <View style={{ marginLeft: spacing.sm }}>{errorMessage ? <ErrorIcon /> : rightElement}</View>}
      </View>
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : hint ? <Text style={styles.hintText}>{hint}</Text> : null}
    </View>
  );
}

function ErrorIcon() {
  return (
    <View style={{ width: iconSize.inline, height: iconSize.inline, borderRadius: iconSize.inline / 2, backgroundColor: colors.semantic.error, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: colors.neutral.white, fontSize: 10, fontWeight: '700', lineHeight: 12 }}>✕</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper:   { width: '100%' },
  container: { height: componentHeight.input, backgroundColor: colors.neutral.offWhite, borderRadius: borderRadius.input, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md },
  disabled:  { backgroundColor: colors.neutral.lightGray },
  inputArea: { flex: 1, justifyContent: 'center', position: 'relative' },
  label:     { position: 'absolute', left: 0, color: colors.neutral.midGray, zIndex: 1 },
  input:     { paddingTop: 18, paddingBottom: 4, fontSize: fontSize.bodyLarge, color: colors.neutral.darkGray, height: '100%' },
  errorText: { marginTop: spacing.xs, fontSize: fontSize.caption, color: colors.semantic.error, marginLeft: spacing.xs },
  hintText:  { marginTop: spacing.xs, fontSize: fontSize.caption, color: colors.neutral.midGray, marginLeft: spacing.xs },
});

export default Input;
