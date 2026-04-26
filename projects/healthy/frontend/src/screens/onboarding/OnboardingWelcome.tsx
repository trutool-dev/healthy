import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList }     from '@/navigation/RootNavigator';
import { Button }  from '@/components/ui/Button';
import { colors }  from '@/theme/colors';
import { textStyles } from '@/theme/typography';
import { spacing, borderRadius, shadows } from '@/theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingWelcome'>;

export function OnboardingWelcome({ navigation }: Props) {
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <View style={s.hero}>
          <View style={s.badge}><Text style={s.badgeEmoji}>✨</Text><Text style={s.badgeText}>Solo 3 minutos</Text></View>
          <Text style={s.title}>Vamos a conocerte</Text>
          <Text style={s.sub}>Responde unas preguntas rápidas para que la IA cree tu plan 100% personalizado</Text>
        </View>
        <View style={s.steps}>
          {[['🎯','Tu objetivo','¿Qué quieres conseguir?'],['📏','Tu perfil físico','Peso, altura y complexión'],['🏋️','Entrenamiento','Disponibilidad y equipamiento'],['🥗','Nutrición','Dieta y restricciones'],['❤️','Tu salud','Condiciones y lesiones']].map(([icon,label,desc]) => (
            <View key={label as string} style={s.stepRow}>
              <View style={s.stepIcon}><Text style={{ fontSize: 22 }}>{icon}</Text></View>
              <View><Text style={s.stepLabel}>{label as string}</Text><Text style={s.stepDesc}>{desc as string}</Text></View>
            </View>
          ))}
        </View>
        <View style={s.cta}>
          <Button label="Empezar mi plan" variant="primary" onPress={() => navigation.navigate('OnboardingGoal')} />
          <Text style={s.privacy}>Tus datos de salud están protegidos y nunca se comparten con terceros</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.neutral.white },
  container: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.lg, justifyContent: 'space-between' },
  hero: { alignItems: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.primary.lightGreen, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 100, marginBottom: spacing.lg },
  badgeEmoji: { fontSize: 14 }, badgeText: { ...textStyles.label, color: colors.primary.darkGreen },
  title: { ...textStyles.titleLarge, color: colors.neutral.black, marginBottom: spacing.md, textAlign: 'center' },
  sub:   { ...textStyles.bodyNormal, color: colors.neutral.midGray, textAlign: 'center', lineHeight: 22 },
  steps: { gap: spacing.md },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, backgroundColor: colors.neutral.offWhite, borderRadius: borderRadius.input, ...shadows.card },
  stepIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.neutral.white, alignItems: 'center', justifyContent: 'center' },
  stepLabel:{ ...textStyles.bodyNormal, fontWeight: '600', color: colors.neutral.darkGray },
  stepDesc: { ...textStyles.caption, color: colors.neutral.midGray },
  cta: { gap: spacing.md },
  privacy: { ...textStyles.caption, color: colors.neutral.midGray, textAlign: 'center', lineHeight: 18 },
});
export default OnboardingWelcome;
