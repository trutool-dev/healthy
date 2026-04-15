/**
 * OnboardingWelcome — introducción al proceso de onboarding
 * Explica qué va a pasar y cuánto tiempo lleva
 */

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { NativeStackScreenProps }               from '@react-navigation/native-stack';
import { RootStackParamList }                   from '@/navigation/RootNavigator';
import { Button }                               from '@/components/ui/Button';
import { colors }                               from '@/theme/colors';
import { textStyles }                           from '@/theme/typography';
import { spacing, borderRadius, shadows }       from '@/theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingWelcome'>;

const STEPS = [
  { icon: '🎯', label: 'Tu objetivo',        desc: '¿Qué quieres conseguir?' },
  { icon: '📏', label: 'Tu perfil físico',   desc: 'Peso, altura y complexión' },
  { icon: '🏋️', label: 'Tu entrenamiento',  desc: 'Disponibilidad y equipamiento' },
  { icon: '🥗', label: 'Tu nutrición',       desc: 'Dieta y restricciones' },
  { icon: '❤️', label: 'Tu salud',           desc: 'Condiciones y lesiones' },
];

export function OnboardingWelcome({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.badge}>
            <Text style={styles.badgeEmoji}>✨</Text>
            <Text style={styles.badgeText}>Solo 3 minutos</Text>
          </View>
          <Text style={styles.title}>Vamos a conocerte</Text>
          <Text style={styles.subtitle}>
            Responde unas preguntas rápidas para que la IA pueda crear tu plan
            100% personalizado desde el primer día
          </Text>
        </View>

        {/* Lista de pasos */}
        <View style={styles.stepList}>
          {STEPS.map((s, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepIcon}>
                <Text style={styles.stepEmoji}>{s.icon}</Text>
              </View>
              <View>
                <Text style={styles.stepLabel}>{s.label}</Text>
                <Text style={styles.stepDesc}>{s.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA */}
        <View style={styles.cta}>
          <Button
            label="Empezar mi plan"
            variant="primary"
            onPress={() => navigation.navigate('OnboardingGoal')}
          />
          <Text style={styles.privacy}>
            Tus datos de salud están protegidos y nunca se comparten con terceros
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex:            1,
    backgroundColor: colors.neutral.white,
  },
  container: {
    flex:              1,
    paddingHorizontal: spacing.lg,
    paddingTop:        spacing.lg,
    paddingBottom:     spacing.lg,
    justifyContent:    'space-between',
  },
  hero: {
    alignItems: 'center',
  },
  badge: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             spacing.xs,
    backgroundColor: colors.primary.lightGreen,
    paddingHorizontal: spacing.md,
    paddingVertical:   spacing.xs,
    borderRadius:    100,
    marginBottom:    spacing.lg,
  },
  badgeEmoji: { fontSize: 14 },
  badgeText: {
    ...textStyles.label,
    color: colors.primary.darkGreen,
  },
  title: {
    ...textStyles.titleLarge,
    color:        colors.neutral.black,
    marginBottom: spacing.md,
    textAlign:    'center',
  },
  subtitle: {
    ...textStyles.bodyNormal,
    color:     colors.neutral.midGray,
    textAlign: 'center',
    lineHeight: 22,
  },
  stepList: {
    gap: spacing.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing.md,
    padding:       spacing.md,
    backgroundColor: colors.neutral.offWhite,
    borderRadius:  borderRadius.input,
    ...shadows.card,
  },
  stepIcon: {
    width:           44,
    height:          44,
    borderRadius:    22,
    backgroundColor: colors.neutral.white,
    alignItems:      'center',
    justifyContent:  'center',
  },
  stepEmoji: { fontSize: 22 },
  stepLabel: {
    ...textStyles.bodyNormal,
    fontWeight: '600',
    color:      colors.neutral.darkGray,
  },
  stepDesc: {
    ...textStyles.caption,
    color: colors.neutral.midGray,
  },
  cta: {
    gap: spacing.md,
  },
  privacy: {
    ...textStyles.caption,
    color:     colors.neutral.midGray,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default OnboardingWelcome;
