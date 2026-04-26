import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors }    from '@/theme/colors';
import { textStyles } from '@/theme/typography';
import { spacing, borderRadius, shadows } from '@/theme/spacing';

interface SelectCardProps {
  label: string; sublabel?: string; icon?: string;
  selected: boolean; onPress: () => void; style?: ViewStyle;
}

export function SelectCard({ label, sublabel, icon, selected, onPress, style }: SelectCardProps) {
  return (
    <Pressable onPress={onPress} style={[s.card, selected && s.selected, style]} accessibilityRole="radio" accessibilityState={{ selected }}>
      {icon ? <Text style={s.icon}>{icon}</Text> : null}
      <View style={s.text}>
        <Text style={[s.label, selected && s.labelSel]}>{label}</Text>
        {sublabel ? <Text style={[s.sub, selected && s.subSel]}>{sublabel}</Text> : null}
      </View>
      <View style={[s.check, selected && s.checkSel]}>
        {selected && <Text style={s.checkMark}>✓</Text>}
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card:      { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: borderRadius.card, backgroundColor: colors.neutral.white, borderWidth: 1.5, borderColor: colors.neutral.lightGray, ...shadows.card, marginBottom: spacing.sm },
  selected:  { borderColor: colors.primary.green, backgroundColor: colors.primary.lightGreen },
  icon:      { fontSize: 26, width: 36, textAlign: 'center' },
  text:      { flex: 1 },
  label:     { ...textStyles.bodyLarge, fontWeight: '600', color: colors.neutral.darkGray },
  labelSel:  { color: colors.primary.darkGreen },
  sub:       { ...textStyles.caption, color: colors.neutral.midGray, marginTop: 2 },
  subSel:    { color: colors.primary.green },
  check:     { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: colors.neutral.lightGray, alignItems: 'center', justifyContent: 'center' },
  checkSel:  { borderColor: colors.primary.green, backgroundColor: colors.primary.green },
  checkMark: { color: colors.neutral.white, fontSize: 13, fontWeight: '700', lineHeight: 16 },
});
