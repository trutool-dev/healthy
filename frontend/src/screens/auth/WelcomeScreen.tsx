/**
 * WelcomeScreen — pantalla de bienvenida con opciones de registro y login
 * Primera pantalla que ve el usuario al abrir la app sin sesión activa
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList }     from '@/navigation/RootNavigator';
import { Button }                 from '@/components/ui/Button';
import { colors }                 from '@/theme/colors';
import { textStyles }             from '@/theme/typography';
import { spacing }                from '@/theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const { height } = Dimensions.get('window');

export function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      {/* Zona superior: ilustración / hero */}
      <View style={styles.hero}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🌿</Text>
        </View>
        <Text style={styles.appName}>Healthy</Text>
        <Text style={styles.tagline}>
          Tu plan de salud personalizado{'\n'}con inteligencia artificial
        </Text>
      </View>

      {/* Zona inferior: lista de beneficios + CTAs */}
      <View style={styles.bottom}>
        {/* Beneficios clave */}
        <View style={styles.benefits}>
          <BenefitRow icon="🎯" text="Plan 100% adaptado a tu cuerpo y objetivos" />
          <BenefitRow icon="🥗" text="Nutrición y entrenamiento en un único plan" />
          <BenefitRow icon="📈" text="Evoluciona automáticamente con tu progreso" />
        </View>

        {/* Botones de acción */}
        <View style={styles.actions}>
          <Button
            label="Empezar gratis"
            variant="primary"
            onPress={() => navigation.navigate('Register')}
          />
          <Button
            label="Ya tengo cuenta"
            variant="ghost"
            style={styles.loginBtn}
            onPress={() => navigation.navigate('Login')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

// Fila de beneficio con icono y texto
function BenefitRow({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={benefitStyles.row}>
      <Text style={benefitStyles.icon}>{icon}</Text>
      <Text style={benefitStyles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex:            1,
    backgroundColor: colors.neutral.white,
  },
  hero: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    paddingTop:     spacing.xl,
  },
  logoCircle: {
    width:           96,
    height:          96,
    borderRadius:    48,
    backgroundColor: colors.primary.lightGreen,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    spacing.lg,
  },
  logoEmoji: {
    fontSize: 44,
  },
  appName: {
    ...textStyles.titleLarge,
    color:        colors.neutral.black,
    marginBottom: spacing.sm,
  },
  tagline: {
    ...textStyles.bodyLarge,
    color:     colors.neutral.midGray,
    textAlign: 'center',
    lineHeight: 24,
  },
  bottom: {
    paddingHorizontal: spacing.lg,
    paddingBottom:     spacing.xl,
  },
  benefits: {
    marginBottom: spacing.xl,
    gap:          spacing.md,
  },
  actions: {
    gap: spacing.sm,
  },
  loginBtn: {
    marginTop: spacing.xs,
  },
});

const benefitStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing.md,
  },
  icon: {
    fontSize: 22,
    width:    32,
    textAlign: 'center',
  },
  text: {
    ...textStyles.bodyNormal,
    color: colors.neutral.darkGray,
    flex:  1,
  },
});

export default WelcomeScreen;
