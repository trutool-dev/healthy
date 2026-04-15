/**
 * OnboardingMotivation — paso 7/7: motivación, intentos previos y reto principal
 */

import React, { useState }                   from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { NativeStackScreenProps }            from '@react-navigation/native-stack';
import { RootStackParamList }                from '@/navigation/RootNavigator';
import { useOnboardingStore, PreviousAttempts } from '@/stores/onboardingStore';
import { OnboardingLayout }                  from './OnboardingLayout';
import { SelectCard }                        from './SelectCard';
import { Input }                             from '@/components/ui/Input';
import { colors }                            from '@/theme/colors';
import { textStyles }                        from '@/theme/typography';
import { spacing, borderRadius, shadows }    from '@/theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingMotivation'>;

const MOTIVATIONS = [
  { id: 'health',      label: 'Mejorar mi salud',         icon: '❤️' },
  { id: 'appearance',  label: 'Verme mejor',              icon: '🪞' },
  { id: 'energy',      label: 'Tener más energía',        icon: '⚡' },
  { id: 'confidence',  label: 'Ganar confianza',          icon: '💪' },
  { id: 'sleep',       label: 'Dormir mejor',             icon: '😴' },
  { id: 'stress',      label: 'Reducir el estrés',        icon: '🧘' },
  { id: 'performance', label: 'Mejorar mi rendimiento',   icon: '🏅' },
  { id: 'longevity',   label: 'Vivir más y mejor',        icon: '🌿' },
];

const ATTEMPTS: { value: PreviousAttempts; icon: string; label: string; sublabel: string }[] = [
  { value: 'none', icon: '🆕', label: 'Es mi primera vez',    sublabel: 'Nunca he seguido un plan'          },
  { value: 'few',  icon: '📋', label: 'Lo he intentado antes',sublabel: '1 o 2 intentos previos'            },
  { value: 'many', icon: '🔄', label: 'He probado muchas cosas',sublabel: 'Sin conseguir resultados duraderos' },
];

export function OnboardingMotivation({ navigation }: Props) {
  const { data, setMotivation } = useOnboardingStore();
  const prev = data.motivation;

  const [motivations,      setMotivations]      = useState<string[]>(prev?.motivations ?? []);
  const [previousAttempts, setPreviousAttempts] = useState<PreviousAttempts | undefined>(prev?.previousAttempts);
  const [mainChallenge,    setMainChallenge]    = useState(prev?.mainChallenge ?? '');

  const toggleMotivation = (id: string) => {
    setMotivations((m) =>
      m.includes(id) ? m.filter((x) => x !== id) : [...m, id]
    );
  };

  const canContinue = motivations.length > 0 && !!previousAttempts;

  const handleContinue = () => {
    if (!canContinue) return;
    setMotivation({ motivations, previousAttempts: previousAttempts!, mainChallenge });
    navigation.navigate('OnboardingComplete');
  };

  return (
    <OnboardingLayout
      step={7}
      title="Tu motivación"
      subtitle="Entender qué te mueve nos ayuda a diseñar un plan que no abandones"
      onBack={() => navigation.goBack()}
      onContinue={handleContinue}
      continueLabel="Generar mi plan"
      canContinue={canContinue}
    >
      {/* Motivaciones — multi-select */}
      <Text style={styles.sectionTitle}>¿Por qué quieres mejorar tu salud?</Text>
      <Text style={styles.hint}>Selecciona todas las que te representen</Text>
      <View style={styles.tagsGrid}>
        {MOTIVATIONS.map((m) => (
          <Pressable
            key={m.id}
            onPress={() => toggleMotivation(m.id)}
            style={[styles.tag, motivations.includes(m.id) && styles.tagSelected]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: motivations.includes(m.id) }}
          >
            <Text style={styles.tagIcon}>{m.icon}</Text>
            <Text style={[styles.tagLabel, motivations.includes(m.id) && styles.tagLabelSelected]}>
              {m.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Intentos previos */}
      <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>
        ¿Has seguido planes de salud antes?
      </Text>
      {ATTEMPTS.map((a) => (
        <SelectCard
          key={a.value}
          icon={a.icon}
          label={a.label}
          sublabel={a.sublabel}
          selected={previousAttempts === a.value}
          onPress={() => setPreviousAttempts(a.value)}
        />
      ))}

      {/* Reto principal — opcional */}
      <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>
        ¿Cuál es tu mayor reto?
      </Text>
      <Input
        label="Ej: la constancia, el tiempo, saber qué comer…"
        value={mainChallenge}
        onChangeText={setMainChallenge}
        hint="Opcional — la IA lo tendrá en cuenta"
        inputProps={{ autoCapitalize: 'sentences', multiline: false }}
      />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    ...textStyles.label,
    color:        colors.neutral.midGray,
    marginBottom: spacing.xs,
  },
  hint: {
    ...textStyles.caption,
    color:        colors.neutral.midGray,
    marginBottom: spacing.md,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           spacing.sm,
  },
  tag: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               spacing.xs,
    paddingVertical:   spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius:      borderRadius.pill,
    borderWidth:       1.5,
    borderColor:       colors.neutral.lightGray,
    backgroundColor:   colors.neutral.offWhite,
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

export default OnboardingMotivation;
