/**
 * Toast — notificación de red y errores (FE-11).
 * Uso:
 *   <Toast message="Error de red" type="error" visible={show} onHide={() => setShow(false)} />
 *
 * Para uso global sin prop-drilling, usar el hook useToast().
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors }     from '@/theme/colors';
import { textStyles } from '@/theme/typography';
import { spacing, borderRadius } from '@/theme/spacing';

export type ToastType = 'error' | 'success' | 'info' | 'warning';

interface ToastProps {
  message:  string;
  type?:    ToastType;
  visible:  boolean;
  onHide?:  () => void;
  duration?: number; // ms, default 3000
}

const BG: Record<ToastType, string> = {
  error:   '#DC2626',
  success: '#16A34A',
  info:    '#3B82F6',
  warning: '#D97706',
};

const ICON: Record<ToastType, string> = {
  error:   '✕',
  success: '✓',
  info:    'ℹ',
  warning: '⚠',
};

export function Toast({ message, type = 'error', visible, onHide, duration = 3000 }: ToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide in
      Animated.parallel([
        Animated.timing(translateY, { toValue: 0,   duration: 300, useNativeDriver: true }),
        Animated.timing(opacity,    { toValue: 1,   duration: 300, useNativeDriver: true }),
      ]).start();

      // Auto-dismiss
      const timer = setTimeout(() => {
        hide();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hide = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -100, duration: 250, useNativeDriver: true }),
      Animated.timing(opacity,    { toValue: 0,    duration: 250, useNativeDriver: true }),
    ]).start(() => onHide?.());
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: BG[type], transform: [{ translateY }], opacity },
      ]}
      accessibilityLiveRegion="assertive"
      accessibilityRole="alert"
    >
      <Text style={styles.icon}>{ICON[type]}</Text>
      <Text style={styles.message} numberOfLines={3}>{message}</Text>
      <TouchableOpacity
        onPress={hide}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel="Cerrar notificación"
      >
        <Text style={styles.close}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position:          'absolute',
    top:               spacing.xl,
    left:              spacing.lg,
    right:             spacing.lg,
    zIndex:            9999,
    flexDirection:     'row',
    alignItems:        'center',
    gap:               spacing.sm,
    borderRadius:      borderRadius.card,
    paddingHorizontal: spacing.md,
    paddingVertical:   spacing.md,
    shadowColor:       '#000',
    shadowOffset:      { width: 0, height: 4 },
    shadowOpacity:     0.15,
    shadowRadius:      12,
    elevation:         8,
  },
  icon:    { fontSize: 16, color: colors.neutral.white, fontWeight: '700', width: 20, textAlign: 'center' },
  message: { ...textStyles.bodyNormal, color: colors.neutral.white, flex: 1, lineHeight: 20 },
  close:   { fontSize: 14, color: 'rgba(255,255,255,0.75)', fontWeight: '700' },
});

export default Toast;
