/**
 * LoginScreen — login con email y contraseña
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
import { useAuthStore }           from '@/stores/authStore';
import api                        from '@/services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { setAuth } = useAuthStore();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState<{ email?: string; password?: string; general?: string }>({});

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!email.trim()) {
      next.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = 'Introduce un email válido';
    }
    if (!password) {
      next.password = 'La contraseña es obligatoria';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', {
        email:    email.trim(),
        password,
      });
      await setAuth(data.user, data.token);
    } catch (err: any) {
      const status  = err.response?.status;
      const message = status === 401
        ? 'Email o contraseña incorrectos'
        : err.response?.data?.message ?? 'Error al iniciar sesión. Inténtalo de nuevo.';
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

          <Text style={styles.title}>Bienvenido de nuevo</Text>
          <Text style={styles.subtitle}>Inicia sesión para continuar con tu plan</Text>

          {/* Formulario */}
          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={(t) => { setEmail(t); setErrors((e) => ({ ...e, email: undefined, general: undefined })); }}
              keyboardType="email-address"
              errorMessage={errors.email}
              inputProps={{ autoCapitalize: 'none', autoComplete: 'email' }}
            />

            <Input
              label="Contraseña"
              value={password}
              onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: undefined, general: undefined })); }}
              secureText={!showPwd}
              errorMessage={errors.password}
              style={styles.inputGap}
              rightElement={
                <TouchableOpacity
                  onPress={() => setShowPwd((v) => !v)}
                  accessibilityLabel={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <Text style={styles.eyeIcon}>{showPwd ? '🙈' : '👁'}</Text>
                </TouchableOpacity>
              }
            />

            {/* Error general */}
            {errors.general ? (
              <Text style={styles.errorGeneral}>{errors.general}</Text>
            ) : null}

            {/* Olvidé mi contraseña */}
            <TouchableOpacity
              style={styles.forgotRow}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          </View>

          <Button
            label="Iniciar sesión"
            variant="primary"
            loading={loading}
            onPress={handleLogin}
            style={styles.cta}
          />

          {/* Enlace a registro */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>Regístrate gratis</Text>
            </TouchableOpacity>
          </View>
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
  },
  form: {
    gap: spacing.md,
  },
  inputGap: {
    marginTop: spacing.md,
  },
  eyeIcon: {
    fontSize: 18,
  },
  errorGeneral: {
    ...textStyles.caption,
    color:     colors.semantic.error,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  forgotRow: {
    alignSelf:  'flex-end',
    marginTop:  spacing.sm,
  },
  forgotText: {
    ...textStyles.bodyNormal,
    color:      colors.primary.green,
    fontWeight: '600',
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
});

export default LoginScreen;
