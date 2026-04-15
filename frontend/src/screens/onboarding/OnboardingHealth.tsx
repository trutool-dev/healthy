/**
 * OnboardingHealth — paso 6/7: condiciones médicas y lesiones
 * Datos sensibles — aviso de privacidad visible
 */

import React, { useState }                   from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { NativeStackScreenProps }            from '@react-navigation/native-stack';
import { RootStackParamList }                from '@/navigation/RootNavigator';
import { useOnboardingStore }                from '@/stores/onboardingStore';
import { OnboardingLayout }                  from './OnboardingLayout';
import { colors }                            from '@/theme/colors';
import { textStyles }                        from '@/theme/typography';
import { spacing, borderRadius, shadows }    from '@/theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingHealth'>;

const CONDITIONS = [
  { id: 'diabetes',      label: 'Diabetes',           icon: '💉' },
  { id: 'hypertension',  label: 'Hipertensión',        icon: '🩺' },
  { id: 'heart',         label: 'Problemas cardíacos', icon: '❤️' },
  { id: 'asthma',        label: 'Asma',                icon: '🫁' },
  { id: 'thyroid',       label: 'Tiroides',            icon: '🦋' },
  { id: 'cholesterol',   label: 'Colesterol alto',     icon: '🩸' },
  { id: 'none_cond',     label: 'Ninguna',             icon: '✅' },
];

const INJURIES = [
  { id: 'back',       label: 'Espalda / lumbar', icon: '🔙' },
  { id: 'knee',       label: 'Rodilla',          icon: '🦵' },
  { id: 'shoulder',   label: 'Hombro',           icon: '💪' },
  { id: 'ankle',      label: 'Tobillo',          icon: '🦶' },
  { id: 'neck',       label: 'Cuello / cervical',icon: '🧣' },
  { id: 'wrist',      label: 'Muñeca / codo',    icon: '🤛' },
  { id: 'none_inj',   label: 'Ninguna',          icon: '✅' },
];

// Chip de selección con exclusiva "Ninguna"
function ToggleChip({
  id, label, icon, selected, onPress,
}: { id: string; label: string; icon: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
    >
      <Text style={styles.chipIcon}>{icon}</Text>
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</Text>
    </Pressable>
  );
}

// Lógica de toggle con exclusiva "ninguna"
function toggleWithNone(current: string[], id: string, noneId: string): string[] {
  if (id === noneId) return [noneId];
  const filtered = current.filter((x) => x !== noneId);
  return filtered.includes(id)
    ? filtered.filter((x) => x !== id)
    : [...filtered, id];
}

export function OnboardingHealth({ navigation }: Props) {
  const { data, setHealth } = useOnboardingStore();
  const prev = data.health;

  const [conditions, setConditions] = useState<string[]>(prev?.conditions ?? []);
  const [injuries,   setInjuries]   = useState<string[]>(prev?.injuries   ?? []);

  // Al menos "Ninguna" marcada en cada sección para poder continuar
  const canContinue = conditions.length > 0 && injuries.length > 0;

  const handleContinue = () => {
    if (!canContinue) return;
    setHealth({ conditions, injuries });
    navigation.navigate('OnboardingMotivation');
  };

  return (
    <OnboardingLayout
      step={6}
      title="Tu salud"
      subtitle="Solo usamos esto para adaptar tu plan y evitar ejercicios o alimentos que puedan afectarte"
      onBack={() => navigation.goBack()}
      onContinue={handleContinue}
      canContinue={canContinue}
    >
      {/* Aviso de privacidad */}
      <View style={styles.privacyBadge}>
        <Text style={styles.privacyIcon}>🔒</Text>
        <Text style={styles.privacyText}>
          Esta información es privada, está cifrada y nunca se comparte con terceros
        </Text>
      </View>

      {/* Condiciones médicas */}
      <Text style={styles.sectionTitle}>Condiciones médicas</Text>
      <Text style={styles.hint}>Selecciona todas las que apliquen</Text>
      <View style={styles.chipsGrid}>
        {CONDITIONS.map((c) => (
          <ToggleChip
            key={c.id}
            id={c.id}
            label={c.label}
            icon={c.icon}
            selected={conditions.includes(c.id)}
            onPress={() => setConditions(toggleWithNone(conditions, c.id, 'none_cond'))}
          />
        ))}
      </View>

      {/* Lesiones */}
      <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Lesiones o limitaciones físicas</Text>
      <Text style={styles.hint}>Selecciona todas las que apliquen</Text>
      <View style={styles.chipsGrid}>
        {INJURIES.map((inj) => (
          <ToggleChip
            key={inj.id}
            id={inj.id}
            label={inj.label}
            icon={inj.icon}
            selected={injuries.includes(inj.id)}
            onPress={() => setInjuries(toggleWithNone(injuries, inj.id, 'none_inj'))}
          />
        ))}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  privacyBadge: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               spacing.sm,
    backgroundColor:   colors.semantic.info + '18',
    borderRadius:      borderRadius.input,
    padding:           spacing.md,
    marginBottom:      spacing.lg,
  },
  privacyIcon: { fontSize: 18 },
  privacyText: {
    ...textStyles.caption,
    color:   colors.semantic.info,
    flex:    1,
    lineHeight: 17,
  },
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
  chipsGrid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           spacing.sm,
  },
  chip: {
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
  chipSelected: {
    borderColor:     colors.primary.green,
    backgroundColor: colors.primary.lightGreen,
  },
  chipIcon:  { fontSize: 16 },
  chipLabel: {
    ...textStyles.bodyNormal,
    color: colors.neutral.darkGray,
  },
  chipLabelSelected: {
    color:      colors.primary.darkGreen,
    fontWeight: '600',
  },
});

export default OnboardingHealth;
