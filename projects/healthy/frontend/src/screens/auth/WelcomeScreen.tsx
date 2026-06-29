import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList }     from '@/navigation/RootNavigator';
import { Button }   from '@/components/ui/Button';
import { colors }   from '@/theme/colors';
import { textStyles } from '@/theme/typography';
import { spacing, borderRadius, shadows } from '@/theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.hero}>
        <View style={s.logo}><Text style={s.logoEmoji}>🌿</Text></View>
        <Text style={s.appName}>Healthy</Text>
        <Text style={s.tagline}>Tu plan de salud personalizado{'\n'}con inteligencia artificial</Text>
      </View>
      <View style={s.benefits}>
        {[['🎯','Plan 100% adaptado a tu cuerpo y objetivos'],['🥗','Nutrición y entrenamiento en un único plan'],['📈','Evoluciona automáticamente con tu progreso']].map(([icon, text]) => (
          <View key={text} style={s.benefitRow}>
            <Text style={s.benefitIcon}>{icon}</Text>
            <Text style={s.benefitText}>{text}</Text>
          </View>
        ))}
      </View>
      <View style={s.actions}>
        <Button label="Empezar gratis" variant="primary" onPress={() => navigation.navigate('Register')} />
        <Button label="Ya tengo cuenta" variant="ghost"  onPress={() => navigation.navigate('Login')}    style={{ marginTop: spacing.sm }} />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: colors.neutral.white },
  hero:        { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: spacing.xl },
  logo:        { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.primary.lightGreen, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  logoEmoji:   { fontSize: 44 },
  appName:     { ...textStyles.titleLarge, color: colors.neutral.black, marginBottom: spacing.sm },
  tagline:     { ...textStyles.bodyLarge, color: colors.neutral.midGray, textAlign: 'center', lineHeight: 24 },
  benefits:    { paddingHorizontal: spacing.lg, gap: spacing.md, marginBottom: spacing.xl },
  benefitRow:  { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, backgroundColor: colors.neutral.offWhite, borderRadius: borderRadius.input, ...shadows.card },
  benefitIcon: { fontSize: 22, width: 32, textAlign: 'center' },
  benefitText: { ...textStyles.bodyNormal, color: colors.neutral.darkGray, flex: 1 },
  actions:     { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.sm },
});
export default WelcomeScreen;
