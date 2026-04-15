/**
 * OnboardingTraining — paso 4/7: disponibilidad, equipamiento y experiencia
 */

import React, { useState }                   from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { NativeStackScreenProps }            from '@react-navigation/native-stack';
import { RootStackParamList }                from '@/navigation/RootNavigator';
import { useOnboardingStore, Equipment, Experience } from '@/stores/onboardingStore';
import { OnboardingLayout }                  from './OnboardingLayout';
import { SelectCard }                        from './SelectCard';
import { colors }                            from '@/theme/colors';
import { textStyles }                        from '@/theme/typography';
import { spacing, borderRadius, shadows }    from '@/theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingTraining'>;

const EQUIPMENT_OPTIONS: { value: Equipment; icon: string; label: string }[] = [
  { value: 'gym',      icon: '🏋️', label: 'Gimnasio'   },
  { value: 'home',     icon: '🏠', label: 'En casa'    },
  { value: 'outdoors', icon: '🌳', label: 'Al aire libre' },
  { value: 'none',     icon: '🤲', label: 'Sin material' },
];

const EXPERIENCE_OPTIONS: { value: Experience; icon: string; label: string; sublabel: string }[] = [
  { value: 'beginner',     icon: '🌱', label: 'Principiante', sublabel: 'Menos de 6 meses entrenando'   },
  { value: 'intermediate', icon: '🏃', label: 'Intermedio',   sublabel: 'Entre 6 meses y 2 años'        },
  { value: 'advanced',     icon: '🏆', label: 'Avanzado',     sublabel: 'Más de 2 años de entrenamiento' },
];

const DAYS = [1, 2, 3, 4, 5, 6, 7];

export function OnboardingTraining({ navigation }: Props) {
  const { data, setTraining } = useOnboardingStore();
  const prev = data.training;

  const [days,       setDays]       = useState<number   | undefined>(prev?.daysPerWeek);
  const [equipment,  setEquipment]  = useState<Equipment[]>(prev?.equipment ?? []);
  const [experience, setExperience] = useState<Experience | undefined>(prev?.experience);

  // Toggle de selección múltiple para equipamiento
  const toggleEquipment = (item: Equipment) => {
    // Si selecciona "Sin material", deselecciona el resto y viceversa
    if (item === 'none') {
      setEquipment(['none']);
      return;
    }
    setEquipment((prev) => {
      const filtered = prev.filter((e) => e !== 'none');
      return filtered.includes(item)
        ? filtered.filter((e) => e !== item)
        : [...filtered, item];
    });
  };

  const canContinue = !!days && equipment.length > 0 && !!experience;

  const handleContinue = () => {
    if (!canContinue) return;
    setTraining({ daysPerWeek: days!, equipment, experience: experience! });
    navigation.navigate('OnboardingNutrition');
  };

  return (
    <OnboardingLayout
      step={4}
      title="Tu entrenamiento"
      subtitle="Diseñamos sesiones que encajen con tu tiempo y recursos disponibles"
      onBack={() => navigation.goBack()}
      onContinue={handleContinue}
      canContinue={canContinue}
    >
      {/* Días por semana */}
      <Text style={styles.sectionTitle}>Días disponibles por semana</Text>
      <View style={styles.daysRow}>
        {DAYS.map((d) => (
          <Pressable
            key={d}
            onPress={() => setDays(d)}
            style={[styles.dayBtn, days === d && styles.dayBtnSelected]}
            accessibilityLabel={`${d} día${d > 1 ? 's' : ''}`}
          >
            <Text style={[styles.dayNum, days === d && styles.dayNumSelected]}>{d}</Text>
          </Pressable>
        ))}
      </View>
      {days && (
        <Text style={styles.daysHint}>
          {days === 1 ? '1 sesión a la semana' : `${days} sesiones a la semana`}
        </Text>
      )}

      {/* Equipamiento — selección múltiple */}
      <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>
        ¿Con qué equipamiento cuentas?
      </Text>
      <Text style={styles.multiHint}>Puedes elegir más de uno</Text>
      <View style={styles.equipGrid}>
        {EQUIPMENT_OPTIONS.map((e) => (
          <Pressable
            key={e.value}
            onPress={() => toggleEquipment(e.value)}
            style={[styles.equipCard, equipment.includes(e.value) && styles.equipCardSelected]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: equipment.includes(e.value) }}
          >
            <Text style={styles.equipIcon}>{e.icon}</Text>
            <Text style={[styles.equipLabel, equipment.includes(e.value) && styles.equipLabelSelected]}>
              {e.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Experiencia */}
      <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Nivel de experiencia</Text>
      {EXPERIENCE_OPTIONS.map((e) => (
        <SelectCard
          key={e.value}
          icon={e.icon}
          label={e.label}
          sublabel={e.sublabel}
          selected={experience === e.value}
          onPress={() => setExperience(e.value)}
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
  daysRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    gap:            spacing.xs,
  },
  dayBtn: {
    flex:            1,
    height:          44,
    borderRadius:    borderRadius.input,
    borderWidth:     1.5,
    borderColor:     colors.neutral.lightGray,
    backgroundColor: colors.neutral.offWhite,
    alignItems:      'center',
    justifyContent:  'center',
    ...shadows.card,
  },
  dayBtnSelected: {
    borderColor:     colors.primary.green,
    backgroundColor: colors.primary.green,
  },
  dayNum: {
    ...textStyles.bodyNormal,
    fontWeight: '700',
    color:      colors.neutral.midGray,
  },
  dayNumSelected: {
    color: colors.neutral.white,
  },
  daysHint: {
    ...textStyles.caption,
    color:     colors.primary.green,
    fontWeight:'600',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  equipGrid: {
    flexDirection:  'row',
    flexWrap:       'wrap',
    gap:            spacing.sm,
  },
  equipCard: {
    width:           '47%',
    padding:         spacing.md,
    borderRadius:    borderRadius.card,
    borderWidth:     1.5,
    borderColor:     colors.neutral.lightGray,
    backgroundColor: colors.neutral.offWhite,
    alignItems:      'center',
    gap:             spacing.sm,
    ...shadows.card,
  },
  equipCardSelected: {
    borderColor:     colors.primary.green,
    backgroundColor: colors.primary.lightGreen,
  },
  equipIcon: {
    fontSize: 28,
  },
  equipLabel: {
    ...textStyles.bodyNormal,
    fontWeight: '600',
    color:      colors.neutral.darkGray,
    textAlign:  'center',
  },
  equipLabelSelected: {
    color: colors.primary.darkGreen,
  },
});

export default OnboardingTraining;
