/**
 * OnboardingNutrition — paso 5/7: tipo de dieta, restricciones y presupuesto
 */

import React, { useState }                   from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { NativeStackScreenProps }            from '@react-navigation/native-stack';
import { RootStackParamList }                from '@/navigation/RootNavigator';
import { useOnboardingStore, DietType, Budget } from '@/stores/onboardingStore';
import { OnboardingLayout }                  from './OnboardingLayout';
import { SelectCard }                        from './SelectCard';
import { colors }                            from '@/theme/colors';
import { textStyles }                        from '@/theme/typography';
import { spacing, borderRadius, shadows }    from '@/theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingNutrition'>;

const DIET_TYPES: { value: DietType; icon: string; label: string; sublabel: string }[] = [
  { value: 'omnivore',    icon: '🍗', label: 'Omnívoro',       sublabel: 'Como de todo'                   },
  { value: 'vegetarian',  icon: '🥦', label: 'Vegetariano',    sublabel: 'Sin carne ni pescado'           },
  { value: 'vegan',       icon: '🌱', label: 'Vegano',         sublabel: 'Solo productos vegetales'       },
  { value: 'gluten_free', icon: '🌾', label: 'Sin gluten',     sublabel: 'Celíaco o intolerante'          },
  { value: 'keto',        icon: '🥑', label: 'Keto / Low carb',sublabel: 'Alta en grasas, baja en hidratos'},
  { value: 'other',       icon: '🍽️', label: 'Otra',          sublabel: 'Especifica en salud si aplica'  },
];

const RESTRICTIONS = [
  { id: 'lactose',  label: 'Lactosa',      icon: '🥛' },
  { id: 'nuts',     label: 'Frutos secos', icon: '🥜' },
  { id: 'shellfish',label: 'Mariscos',     icon: '🦐' },
  { id: 'eggs',     label: 'Huevos',       icon: '🥚' },
  { id: 'soy',      label: 'Soja',         icon: '🫘' },
  { id: 'fish',     label: 'Pescado',      icon: '🐟' },
];

const BUDGETS: { value: Budget; icon: string; label: string; sublabel: string }[] = [
  { value: 'low',    icon: '💰',  label: 'Ajustado',  sublabel: 'Menos de 150€/mes en comida'  },
  { value: 'medium', icon: '💳',  label: 'Moderado',  sublabel: '150 – 300€/mes'               },
  { value: 'high',   icon: '💎',  label: 'Sin límite',sublabel: 'Priorizo calidad sobre precio' },
];

export function OnboardingNutrition({ navigation }: Props) {
  const { data, setNutrition } = useOnboardingStore();
  const prev = data.nutrition;

  const [dietType,     setDietType]     = useState<DietType | undefined>(prev?.dietType);
  const [restrictions, setRestrictions] = useState<string[]>(prev?.restrictions ?? []);
  const [budget,       setBudget]       = useState<Budget   | undefined>(prev?.budget);

  const toggleRestriction = (id: string) => {
    setRestrictions((r) =>
      r.includes(id) ? r.filter((x) => x !== id) : [...r, id]
    );
  };

  const canContinue = !!dietType && !!budget;

  const handleContinue = () => {
    if (!canContinue) return;
    setNutrition({ dietType: dietType!, restrictions, budget: budget! });
    navigation.navigate('OnboardingHealth');
  };

  return (
    <OnboardingLayout
      step={5}
      title="Tu alimentación"
      subtitle="Creamos menús que disfrutes y que se ajusten a tu forma de comer"
      onBack={() => navigation.goBack()}
      onContinue={handleContinue}
      canContinue={canContinue}
    >
      {/* Tipo de dieta */}
      <Text style={styles.sectionTitle}>¿Cómo te alimentas?</Text>
      {DIET_TYPES.map((d) => (
        <SelectCard
          key={d.value}
          icon={d.icon}
          label={d.label}
          sublabel={d.sublabel}
          selected={dietType === d.value}
          onPress={() => setDietType(d.value)}
        />
      ))}

      {/* Intolerancias / alergias */}
      <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>
        Intolerancias o alergias
      </Text>
      <Text style={styles.multiHint}>Opcional — selecciona las que apliquen</Text>
      <View style={styles.tagsGrid}>
        {RESTRICTIONS.map((r) => (
          <Pressable
            key={r.id}
            onPress={() => toggleRestriction(r.id)}
            style={[styles.tag, restrictions.includes(r.id) && styles.tagSelected]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: restrictions.includes(r.id) }}
          >
            <Text style={styles.tagIcon}>{r.icon}</Text>
            <Text style={[styles.tagLabel, restrictions.includes(r.id) && styles.tagLabelSelected]}>
              {r.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Presupuesto */}
      <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Presupuesto mensual en alimentación</Text>
      {BUDGETS.map((b) => (
        <SelectCard
          key={b.value}
          icon={b.icon}
          label={b.label}
          sublabel={b.sublabel}
          selected={budget === b.value}
          onPress={() => setBudget(b.value)}
        />
      ))}
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    ...textStyles.label,
    color:        colors.neutral.midGray,
    marginBottom: spacing.sm,
  },
  multiHint: {
    ...textStyles.caption,
    color:        colors.neutral.midGray,
    marginBottom: spacing.sm,
    marginTop:    -spacing.xs,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           spacing.sm,
    marginBottom:  spacing.sm,
  },
  tag: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius:    borderRadius.pill,
    borderWidth:     1.5,
    borderColor:     colors.neutral.lightGray,
    backgroundColor: colors.neutral.offWhite,
    ...shadows.card,
  },
  tagSelected: {
    borderColor:     colors.primary.green,
    backgroundColor: colors.primary.lightGreen,
  },
  tagIcon:  { fontSize: 16 },
  tagLabel: {
    ...textStyles.bodyNormal,
    color: colors.neutral.darkGray,
  },
  tagLabelSelected: {
    color:      colors.primary.darkGreen,
    fontWeight: '600',
  },
});

export default OnboardingNutrition;
