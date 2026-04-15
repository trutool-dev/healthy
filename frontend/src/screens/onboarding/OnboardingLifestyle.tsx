/**
 * OnboardingLifestyle — paso 3/7: profesión, horario laboral y nivel de estrés
 */

import React, { useState }                    from 'react';
import { View, Text, StyleSheet, Pressable }  from 'react-native';
import { NativeStackScreenProps }             from '@react-navigation/native-stack';
import { RootStackParamList }                 from '@/navigation/RootNavigator';
import { useOnboardingStore, Schedule }       from '@/stores/onboardingStore';
import { OnboardingLayout }                   from './OnboardingLayout';
import { SelectCard }                         from './SelectCard';
import { Input }                              from '@/components/ui/Input';
import { colors }                             from '@/theme/colors';
import { textStyles }                         from '@/theme/typography';
import { spacing, borderRadius, shadows }     from '@/theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingLifestyle'>;

const SCHEDULES: { value: Schedule; icon: string; label: string; sublabel: string }[] = [
  { value: 'morning',   icon: '🌅', label: 'Mañanas',   sublabel: '7:00 – 15:00'  },
  { value: 'afternoon', icon: '☀️', label: 'Tardes',    sublabel: '15:00 – 23:00' },
  { value: 'night',     icon: '🌙', label: 'Noches',    sublabel: '23:00 – 7:00'  },
  { value: 'flexible',  icon: '🔄', label: 'Flexible',  sublabel: 'Horario variable'  },
];

const STRESS_LEVELS: { value: 1|2|3|4|5; label: string; color: string }[] = [
  { value: 1, label: 'Muy bajo', color: colors.semantic.success  },
  { value: 2, label: 'Bajo',     color: '#84CC16'                },
  { value: 3, label: 'Moderado', color: colors.semantic.warning  },
  { value: 4, label: 'Alto',     color: '#F97316'                },
  { value: 5, label: 'Muy alto', color: colors.semantic.error    },
];

export function OnboardingLifestyle({ navigation }: Props) {
  const { data, setLifestyle } = useOnboardingStore();
  const prev = data.lifestyle;

  const [profession,   setProfession]   = useState(prev?.profession   ?? '');
  const [schedule,     setSchedule]     = useState<Schedule | undefined>(prev?.workSchedule);
  const [stressLevel,  setStressLevel]  = useState<1|2|3|4|5|undefined>(prev?.stressLevel);

  const canContinue = !!profession.trim() && !!schedule && !!stressLevel;

  const handleContinue = () => {
    if (!canContinue) return;
    setLifestyle({ profession: profession.trim(), workSchedule: schedule!, stressLevel: stressLevel! });
    navigation.navigate('OnboardingTraining');
  };

  const selectedStress = STRESS_LEVELS.find((s) => s.value === stressLevel);

  return (
    <OnboardingLayout
      step={3}
      title="Tu estilo de vida"
      subtitle="Adaptamos el plan a tu rutina diaria para que sea fácil de seguir"
      onBack={() => navigation.goBack()}
      onContinue={handleContinue}
      canContinue={canContinue}
    >
      {/* Profesión */}
      <Input
        label="¿A qué te dedicas?"
        value={profession}
        onChangeText={setProfession}
        hint="Ej: estudiante, oficina, trabajo físico…"
        inputProps={{ autoCapitalize: 'sentences' }}
      />

      {/* Horario */}
      <Text style={styles.sectionTitle}>Horario habitual de trabajo</Text>
      {SCHEDULES.map((s) => (
        <SelectCard
          key={s.value}
          icon={s.icon}
          label={s.label}
          sublabel={s.sublabel}
          selected={schedule === s.value}
          onPress={() => setSchedule(s.value)}
        />
      ))}

      {/* Nivel de estrés */}
      <Text style={styles.sectionTitle}>Nivel de estrés habitual</Text>
      <View style={styles.stressRow}>
        {STRESS_LEVELS.map((s) => (
          <Pressable
            key={s.value}
            onPress={() => setStressLevel(s.value)}
            style={[
              styles.stressBtn,
              stressLevel === s.value && { backgroundColor: s.color, borderColor: s.color },
            ]}
            accessibilityLabel={`Nivel de estrés ${s.label}`}
          >
            <Text style={[styles.stressNum, stressLevel === s.value && styles.stressNumSelected]}>
              {s.value}
            </Text>
          </Pressable>
        ))}
      </View>
      {selectedStress && (
        <Text style={[styles.stressLabel, { color: selectedStress.color }]}>
          {selectedStress.label}
        </Text>
      )}
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    ...textStyles.label,
    color:        colors.neutral.midGray,
    marginTop:    spacing.lg,
    marginBottom: spacing.sm,
  },
  stressRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    gap:             spacing.sm,
    marginBottom:    spacing.xs,
  },
  stressBtn: {
    flex:            1,
    height:          52,
    borderRadius:    borderRadius.input,
    borderWidth:     1.5,
    borderColor:     colors.neutral.lightGray,
    backgroundColor: colors.neutral.offWhite,
    alignItems:      'center',
    justifyContent:  'center',
    ...shadows.card,
  },
  stressNum: {
    ...textStyles.titleSmall,
    color: colors.neutral.midGray,
  },
  stressNumSelected: {
    color: colors.neutral.white,
  },
  stressLabel: {
    ...textStyles.caption,
    fontWeight: '600',
    textAlign:  'center',
    marginTop:  spacing.xs,
  },
});

export default OnboardingLifestyle;
