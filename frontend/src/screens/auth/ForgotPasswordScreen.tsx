/**
 * ForgotPasswordScreen — solicita el email para recuperar la contraseña
 * Tras el envío muestra una confirmación sin navegar (evita exponer si el email existe)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
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

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  const validate = (): boolean => {
    if (!email.trim()) {
      setError('El email es obligatorio');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Introduce un email válido');
      return false;
    }
    return true;
  };

  const handleSend = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      // Siempre muestra confirmación — no revela si el email está registrado
      setSent(true);
    } catch {
      // Por seguridad también muestra confirmación ante errores de servidor
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  // Vista de confirmación tras el envío
  if (sent) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.back} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.backText}>← Volver al login</Text>
          </TouchableOpacity>

          <View style={styles.successIcon}>
            <Text style={styles.successEmoji}>📬</Text>
          </View>

          <Text style={styles.title}>Revisa tu email</Text>
          <Text style={styles.subtitle}>
            Si existe una cuenta con{' '}
            <Text style={styles.emailHighlight}>{email}</Text>
            , recibirás un enlace para restablecer tu contraseña en los próximos minutos.
          </Text>

          <Text style={styles.spamNote}>
            No lo ves? Revisa la carpeta de spam o correo no deseado.
          </Text>

          <Button
            label="Volver al inicio de sesión"
            variant="secondary"
            onPress={() => navigation.navigate('Login')}
            style={styles.cta}
          />

          <TouchableOpacity
            style={styles.resendRow}
            onPress={() => setSent(false)}
          >
            <Text style={styles.resendText}>Reenviar enlace</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Vista del formulario
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Recuperar contraseña</Text>
          <Text style={styles.subtitle}>
            Introduce tu email y te enviaremos un enlace para crear una nueva contraseña
          </Text>

          <Input
            label="Email"
            value={email}
            onChangeText={(t) => { setEmail(t); setError(''); }}
            keyboardType="email-address"
            errorMessage={error}
            inputProps={{ autoCapitalize: 'none', autoComplete: 'email' }}
          />

          <Button
            label="Enviar enlace"
            variant="primary"
            loading={loading}
            onPress={handleSend}
            style={styles.cta}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Recuerdas tu contraseña? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:  { flex: 1, backgroundColor: colors.neutral.white },
  flex:  { flex: 1 },
  container: {
    flex:              1,
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
    lineHeight:   22,
  },
  emailHighlight: {
    color:      colors.neutral.darkGray,
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
  // Estado de confirmación
  successIcon: {
    alignSelf:        'center',
    marginBottom:     spacing.xl,
    width:            80,
    height:           80,
    borderRadius:     40,
    backgroundColor:  colors.primary.lightGreen,
    alignItems:       'center',
    justifyContent:   'center',
  },
  successEmoji: {
    fontSize: 38,
  },
  spamNote: {
    ...textStyles.caption,
    color:     colors.neutral.midGray,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  resendRow: {
    alignSelf:  'center',
    marginTop:  spacing.lg,
  },
  resendText: {
    ...textStyles.bodyNormal,
    color:      colors.primary.green,
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;
