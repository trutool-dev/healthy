/**
 * SelectCard — tarjeta de selección única o múltiple reutilizable en el onboarding
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors }     from '@/theme/colors';
import { textStyles } from '@/theme/typography';
import { spacing, borderRadius, shadows } from '@/theme/spacing';

interface SelectCardProps {
  label:      string;
  sublabel?:  string;
  icon?:      string;
  selected:   boolean;
  onPress:    () => void;
  style?:     ViewStyle;
}

export function SelectCard({ label, sublabel, icon, selected, onPress, style }: SelectCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, selected && styles.cardSelected, style]}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
    >
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <View style={styles.text}>
        <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
        {sublabel ? (
          <Text style={[styles.sublabel, selected && styles.sublabelSelected]}>{sublabel}</Text>
        ) : null}
      </View>
      {/* Checkmark */}
      <View style={[styles.check, selected && styles.checkSelected]}>
        {selected && <Text style={styles.checkMark}>✓</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               spacing.md,
    padding:           spacing.md,
    borderRadius:      borderRadius.card,
    backgroundColor:   colors.neutral.white,
    borderWidth:       1.5,
    borderColor:       colors.neutral.lightGray,
    ...shadows.card,
    marginBottom:      spacing.sm,
  },
  cardSelected: {
    borderColor:      colors.primary.green,
    backgroundColor:  colors.primary.lightGreen,
  },
  icon: {
    fontSize: 26,
    width:    36,
    textAlign: 'center',
  },
  text: {
    flex: 1,
  },
  label: {
    ...textStyles.bodyLarge,
    fontWeight: '600',
    color:      colors.neutral.darkGray,
  },
  labelSelected: {
    color: colors.primary.darkGreen,
  },
  sublabel: {
    ...textStyles.caption,
    color:     colors.neutral.midGray,
    marginTop: 2,
  },
  sublabelSelected: {
    color: colors.primary.green,
  },
  check: {
    width:           24,
    height:          24,
    borderRadius:    12,
    borderWidth:     1.5,
    borderColor:     colors.neutral.lightGray,
    alignItems:      'center',
    justifyContent:  'center',
  },
  checkSelected: {
    borderColor:     colors.primary.green,
    backgroundColor: colors.primary.green,
  },
  checkMark: {
    color:      colors.neutral.white,
    fontSize:   13,
    fontWeight: '700',
    lineHeight: 16,
  },
});
