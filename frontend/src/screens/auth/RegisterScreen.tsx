/**
 * RegisterScreen — formulario de registro con email y teléfono
 * Tras el envío navega a VerifyEmailScreen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList }     from '@/navigation/RootNavigator';
import { Button }                 from '@/components/ui/Button';
import { Input }                  from '@/components/ui/Input';
import { colors }                 from '@/theme/colors';
import { textStyles }             from '@/theme/typography';
import { spacing }                from '@/theme/spacing';
import api                        from '@/services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const [email, setEmail]       = useState('');
  const [phone, setPhone]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState<{ email?: string; phone?: string; general?: string }>({});

  // Validación de campos antes de enviar
  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!email.trim()) {
      next.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = 'Introduce un email válido';
    }
    if (!phone.trim()) {
      next.phone = 'El teléfono es obligatorio';
    } else if (!/^\+?[\d\s\-()]{9,}$/.test(phone)) {
      next.phone = 'Introduce un teléfono válido';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/auth/register', { email: email.trim(), phone: phone.trim() });
      navigation.navigate('VerifyEmail', { email: email.trim() });
    } catch (err: any) {
      const message = err.response?.data?.message ?? 'Error al registrar. Inténtalo de nuevo.';
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Cabecera */}
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Crea tu cuenta</Text>
          <Text style={styles.subtitle}>
            Te enviaremos un código de verificación a tu email
          </Text>

          {/* Formulario */}
          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: undefined })); }}
              keyboardType="email-address"
              errorMessage={errors.email}
              inputProps={{ autoCapitalize: 'none', autoComplete: 'email' }}
            />

            <Input
              label="Teléfono"
              value={phone}
              onChangeText={(t) => { setPhone(t); setErrors((e) => ({ ...e, phone: undefined })); }}
              keyboardType="phone-pad"
              errorMessage={errors.phone}
              hint="Ej: +34 612 345 678"
              style={styles.inputGap}
            />

            {/* Error general de API */}
            {errors.general ? (
              <Text style={styles.errorGeneral}>{errors.general}</Text>
            ) : null}
          </View>

          <Button
            label="Continuar"
            variant="primary"
            loading={loading}
            onPress={handleRegister}
            style={styles.cta}
          />

          {/* Enlace a login */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>

          {/* Aviso legal */}
          <Text style={styles.legal}>
            Al registrarte aceptas nuestros Términos de uso y Política de privacidad
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:  { flex: 1, backgroundColor: colors.neutral.white },
  flex:  { flex: 1 },
  scroll: {
    flexGrow:          1,
    paddingHorizontal: spacing.lg,
    paddingTop:        spacing.md,
    paddingBottom:     spacing.xxl,
  },
  back: {
    marginBottom: spacing.lg,
    alignSelf:    'flex-start',
  },
  backText: {
    ...textStyles.bodyNormal,
    color: colors.neutral.midGray,
  },
  title: {
    ...textStyles.titleMedium,
    color:        colors.neutral.black,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...textStyles.bodyNormal,
    color:        colors.neutral.midGray,
    marginBottom: spacing.xl,
    lineHeight:   20,
  },
  form: {
    gap: spacing.md,
  },
  inputGap: {
    marginTop: spacing.md,
  },
  errorGeneral: {
    ...textStyles.caption,
    color:     colors.semantic.error,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  cta: {
    marginTop: spacing.xl,
  },
  footer: {
    flexDirection:  'row',
    justifyContent: 'center',
    marginTop:      spacing.lg,
  },
  footerText: {
    ...textStyles.bodyNormal,
    color: colors.neutral.midGray,
  },
  footerLink: {
    ...textStyles.bodyNormal,
    color:      colors.primary.green,
    fontWeight: '600',
  },
  legal: {
    ...textStyles.caption,
    color:     colors.neutral.midGray,
    textAlign: 'center',
    marginTop: spacing.lg,
    lineHeight: 18,
  },
});

export default RegisterScreen;
