/**
 * MealCard — tarjeta de comida expandible con lista de alimentos y macros
 */

import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Meal, calcMealTotals }              from '@/stores/planStore';
import { colors }                            from '@/theme/colors';
import { textStyles }                        from '@/theme/typography';
import { spacing, borderRadius, shadows }    from '@/theme/spacing';

interface MealCardProps {
  meal:     Meal;
  onToggle?: (id: string) => void;
}

export function MealCard({ meal, onToggle }: MealCardProps) {
  const [expanded, setExpanded] = useState(false);
  const totals = calcMealTotals(meal);

  return (
    <View style={[styles.card, meal.completed && styles.cardDone]}>
      {/* Cabecera — siempre visible */}
      <Pressable style={styles.header} onPress={() => setExpanded((v) => !v)}>
        <Text style={styles.icon}>{meal.icon}</Text>

        <View style={styles.headerText}>
          <Text style={[styles.name, meal.completed && styles.nameDone]}>{meal.name}</Text>
          <Text style={styles.calories}>{totals.calories} kcal</Text>
        </View>

        {/* Macros resumen */}
        <View style={styles.macros}>
          <MacroPill label="P" value={totals.protein} color={colors.semantic.info}    />
          <MacroPill label="C" value={totals.carbs}   color={colors.semantic.warning} />
          <MacroPill label="G" value={totals.fat}     color={colors.semantic.error}   />
        </View>

        {/* Chevron expandir */}
        <Text style={[styles.chevron, expanded && styles.chevronUp]}>›</Text>
      </Pressable>

      {/* Detalle expandible */}
      {expanded && (
        <View style={styles.detail}>
          <View style={styles.divider} />
          {meal.foods.map((f) => (
            <View key={f.id} style={styles.foodRow}>
              <Text style={styles.foodName} numberOfLines={1}>{f.name}</Text>
              <Text style={styles.foodGrams}>{f.grams}g</Text>
              <Text style={styles.foodCal}>{f.calories} kcal</Text>
            </View>
          ))}
          <View style={styles.divider} />

          {/* Botón completar */}
          <Pressable
            style={[styles.doneBtn, meal.completed && styles.doneBtnDone]}
            onPress={() => onToggle?.(meal.id)}
          >
            <Text style={[styles.doneBtnText, meal.completed && styles.doneBtnTextDone]}>
              {meal.completed ? '✓ Completado' : 'Marcar como completado'}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function MacroPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[pillStyles.pill, { borderColor: color + '33', backgroundColor: color + '15' }]}>
      <Text style={[pillStyles.label, { color }]}>{label} {Math.round(value)}g</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral.white,
    borderRadius:    borderRadius.card,
    marginBottom:    spacing.sm,
    borderWidth:     1.5,
    borderColor:     colors.neutral.lightGray,
    overflow:        'hidden',
    ...shadows.card,
  },
  cardDone: {
    borderColor:     colors.primary.lightGreen,
    backgroundColor: '#F0FDF4',
  },
  header: {
    flexDirection:  'row',
    alignItems:     'center',
    padding:        spacing.md,
    gap:            spacing.sm,
  },
  icon: { fontSize: 26, width: 36, textAlign: 'center' },
  headerText: { flex: 1 },
  name: {
    ...textStyles.bodyLarge,
    fontWeight: '600',
    color:      colors.neutral.darkGray,
  },
  nameDone: { color: colors.primary.darkGreen },
  calories: {
    ...textStyles.caption,
    color: colors.neutral.midGray,
  },
  macros: { flexDirection: 'row', gap: 4 },
  chevron: {
    fontSize:         22,
    color:            colors.neutral.midGray,
    transform:        [{ rotate: '90deg' }],
  },
  chevronUp: { transform: [{ rotate: '-90deg' }] },
  detail: { paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  divider: { height: 1, backgroundColor: colors.neutral.lightGray, marginVertical: spacing.sm },
  foodRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  foodName: { ...textStyles.bodyNormal, color: colors.neutral.darkGray, flex: 1 },
  foodGrams: { ...textStyles.caption, color: colors.neutral.midGray, marginRight: spacing.md, minWidth: 36, textAlign: 'right' },
  foodCal:   { ...textStyles.caption, color: colors.neutral.midGray, fontWeight: '600', minWidth: 52, textAlign: 'right' },
  doneBtn: {
    marginTop:       spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius:    borderRadius.button,
    borderWidth:     1.5,
    borderColor:     colors.primary.green,
    alignItems:      'center',
  },
  doneBtnDone: {
    backgroundColor: colors.primary.lightGreen,
    borderColor:     colors.primary.green,
  },
  doneBtnText:     { ...textStyles.bodyNormal, color: colors.primary.green, fontWeight: '600' },
  doneBtnTextDone: { color: colors.primary.darkGreen },
});

const pillStyles = StyleSheet.create({
  pill: {
    paddingHorizontal: 6,
    paddingVertical:   2,
    borderRadius:      borderRadius.pill,
    borderWidth:       1,
  },
  label: { fontSize: 10, fontWeight: '700' },
});
