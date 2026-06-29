/**
 * NutritionScreen — comidas del día con macros totales y registro por comida
 */

import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { usePlanStore, calcDayTotals } from '@/stores/planStore';
import { MealCard }    from '@/components/ui/MealCard';
import { MacroCard }   from '@/components/ui/MacroCard';
import { colors }      from '@/theme/colors';
import { textStyles }  from '@/theme/typography';
import { spacing, borderRadius, shadows } from '@/theme/spacing';

export function NutritionScreen() {
  const { todayMeals, targets, toggleMeal } = usePlanStore();
  const totals    = calcDayTotals(todayMeals);
  const calPct    = Math.min(totals.calories / targets.calories, 1);
  const calLeft   = Math.max(targets.calories - Math.round(totals.calories), 0);
  const completed = todayMeals.filter((m) => m.completed).length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Cabecera */}
        <Text style={styles.title}>Nutrición</Text>
        <Text style={styles.sub}>{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>

        {/* Resumen calórico */}
        <View style={styles.calSummary}>
          <View style={styles.calMain}>
            <Text style={styles.calNum}>{Math.round(totals.calories)}</Text>
            <Text style={styles.calUnit}>kcal consumidas</Text>
          </View>
          <View style={styles.calDivider} />
          <View style={styles.calSide}>
            <Text style={styles.calSideNum}>{targets.calories}</Text>
            <Text style={styles.calSideLabel}>objetivo</Text>
          </View>
          <View style={styles.calDivider} />
          <View style={styles.calSide}>
            <Text style={[styles.calSideNum, { color: calLeft > 0 ? colors.primary.green : colors.semantic.error }]}>{calLeft}</Text>
            <Text style={styles.calSideLabel}>restantes</Text>
          </View>
        </View>

        {/* Barra calórica */}
        <View style={styles.calBar}>
          <View style={[styles.calFill, { width: `${calPct * 100}%` }]} />
        </View>

        {/* Macros */}
        <View style={styles.macroRow}>
          <MacroCard label="Proteína" current={totals.protein} target={targets.protein} color={colors.semantic.info}    />
          <MacroCard label="Carbos"   current={totals.carbs}   target={targets.carbs}   color={colors.semantic.warning} />
          <MacroCard label="Grasa"    current={totals.fat}     target={targets.fat}     color={colors.semantic.error}   />
        </View>

        {/* Progreso comidas */}
        <View style={styles.mealProgress}>
          <Text style={styles.mealProgressText}>{completed}/{todayMeals.length} comidas completadas</Text>
          <View style={styles.mealDots}>
            {todayMeals.map((m) => (
              <View key={m.id} style={[styles.dot, m.completed && styles.dotDone]} />
            ))}
          </View>
        </View>

        {/* Tarjetas de comidas */}
        <Text style={styles.sectionTitle}>Plan de comidas</Text>
        {todayMeals.map((meal) => (
          <MealCard key={meal.id} meal={meal} onToggle={toggleMeal} />
        ))}

        {/* Consejo del día */}
        <View style={styles.tip}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipText}>
            Recuerda beber agua entre comidas. La hidratación mejora la absorción de nutrientes y reduce el hambre entre horas.
          </Text>
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.neutral.offWhite },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  title:  { ...textStyles.titleMedium, color: colors.neutral.black },
  sub:    { ...textStyles.bodyNormal, color: colors.neutral.midGray, marginBottom: spacing.lg },

  // Resumen calórico
  calSummary: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.neutral.white, borderRadius: borderRadius.card,
    padding: spacing.lg, ...shadows.card,
  },
  calMain:     { flex: 2, alignItems: 'center' },
  calNum:      { ...textStyles.titleLarge, color: colors.neutral.black },
  calUnit:     { ...textStyles.caption, color: colors.neutral.midGray },
  calDivider:  { width: 1, height: 40, backgroundColor: colors.neutral.lightGray, marginHorizontal: spacing.md },
  calSide:     { flex: 1, alignItems: 'center' },
  calSideNum:  { ...textStyles.titleSmall, color: colors.neutral.darkGray },
  calSideLabel:{ ...textStyles.caption, color: colors.neutral.midGray },

  calBar: {
    height: 6, backgroundColor: colors.neutral.lightGray,
    borderRadius: borderRadius.pill, overflow: 'hidden',
    marginTop: spacing.sm, marginBottom: spacing.md,
  },
  calFill: { height: '100%', backgroundColor: colors.primary.green, borderRadius: borderRadius.pill },

  macroRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },

  // Progreso comidas
  mealProgress: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  mealProgressText: { ...textStyles.bodyNormal, color: colors.neutral.midGray },
  mealDots: { flexDirection: 'row', gap: 6 },
  dot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: colors.neutral.lightGray,
  },
  dotDone: { backgroundColor: colors.primary.green },

  sectionTitle: { ...textStyles.titleSmall, color: colors.neutral.black, marginBottom: spacing.sm },

  // Consejo
  tip: {
    flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start',
    backgroundColor: colors.semantic.info + '12',
    borderRadius: borderRadius.card, padding: spacing.md,
    borderWidth: 1, borderColor: colors.semantic.info + '30',
    marginTop: spacing.sm,
  },
  tipIcon: { fontSize: 20 },
  tipText: { ...textStyles.bodyNormal, color: colors.semantic.info, flex: 1, lineHeight: 21 },
});

export default NutritionScreen;
