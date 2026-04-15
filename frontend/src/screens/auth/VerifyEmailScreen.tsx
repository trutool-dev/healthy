/**
 * VerifyEmailScreen — introduce el código de 6 dígitos enviado por email
 * Cada dígito tiene su propio input con foco automático al escribir
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList }     from '@/navigation/RootNavigator';
import { Button }                 from '@/components/ui/Button';
import { colors }                 from '@/theme/colors';
import { textStyles, fontSize }   from '@/theme/typography';
import { spacing, borderRadius }  from '@/theme/spacing';
import api                        from '@/services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'VerifyEmail'>;

const CODE_LENGTH = 6;

export function VerifyEmailScreen({ navigation, route }: Props) {
  const { email } = route.params;

  const [digits, setDigits]         = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [loading, setLoading]       = useState(false);
  const [resending, setResending]   = useState(false);
  const [error, setError]           = useState('');
  const [resendMsg, setResendMsg]   = useState('');

  // Referencias a cada input para mover el foco automáticamente
  const inputRefs = useRef<(TextInput | null)[]>(Array(CODE_LENGTH).fill(null));

  const handleDigit = (text: string, index: number) => {
    // Solo acepta un dígito numérico
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError('');

    // Avanza al siguiente input si se escribió un dígito
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    // Retrocede al input anterior al borrar
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = digits.join('');
    if (code.length < CODE_LENGTH) {
      setError('Introduce los 6 dígitos del código');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/verify-email', { email, code });
      navigation.navigate('SetPassword', { email, code });
    } catch (err: any) {
      const message = err.response?.data?.message ?? 'Código incorrecto. Inténtalo de nuevo.';
      setError(message);
      // Limpia los dígitos para que el usuario vuelva a introducirlos
      setDigits(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendMsg('');
    setError('');
    try {
      await api.post('/auth/resend-code', { email });
      setResendMsg('Código reenviado. Revisa tu bandeja de entrada.');
    } catch {
      setError('No se pudo reenviar el código. Inténtalo de nuevo.');
    } finally {
      setResending(false);
    }
  };

  const codeComplete = digits.every((d) => d !== '');

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          {/* Cabecera */}
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Revisa tu email</Text>
          <Text style={styles.subtitle}>
            Hemos enviado un código de 6 dígitos a{'\n'}
            <Text style={styles.email}>{email}</Text>
          </Text>

          {/* Grid de 6 inputs */}
          <View style={styles.codeRow}>
            {digits.map((digit, i) => (
              <TextInput
                key={i}
                ref={(ref) => { inputRefs.current[i] = ref; }}
                style={[
                  styles.digitBox,
                  digit     ? styles.digitBoxFilled : null,
                  error     ? styles.digitBoxError  : null,
                ]}
                value={digit}
                onChangeText={(t) => handleDigit(t, i)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                selectionColor={colors.primary.green}
                accessibilityLabel={`Dígito ${i + 1} de 6`}
              />
            ))}
          </View>

          {/* Mensajes de estado */}
          {error     ? <Text style={styles.errorText}>{error}</Text>      : null}
          {resendMsg ? <Text style={styles.resendMsg}>{resendMsg}</Text>  : null}

          {/* CTA principal */}
          <Button
            label="Verificar"
            variant="primary"
            loading={loading}
            disabled={!codeComplete}
            onPress={handleVerify}
            style={styles.cta}
          />

          {/* Reenviar código */}
          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>¿No recibiste el código? </Text>
            {resending ? (
              <ActivityIndicator size="small" color={colors.primary.green} />
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendLink}>Reenviar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const DIGIT_SIZE = 48;

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: colors.neutral.white },
  flex:      { flex: 1 },
  container: {
    flex:              1,
    paddingHorizontal: spacing.lg,
    paddingTop:        spacing.md,
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
  email: {
    color:      colors.neutral.darkGray,
    fontWeight: '600',
  },
  codeRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    gap:            spacing.sm,
    marginBottom:   spacing.lg,
  },
  digitBox: {
    flex:            1,
    height:          DIGIT_SIZE,
    borderRadius:    borderRadius.input,
    borderWidth:     1.5,
    borderColor:     colors.neutral.lightGray,
    backgroundColor: colors.neutral.offWhite,
    textAlign:       'center',
    fontSize:        fontSize.titleSmall,
    fontWeight:      '700',
    color:           colors.neutral.black,
  },
  digitBoxFilled: {
    borderColor:     colors.primary.green,
    backgroundColor: colors.primary.lightGreen,
  },
  digitBoxError: {
    borderColor: colors.semantic.error,
  },
  errorText: {
    ...textStyles.caption,
    color:     colors.semantic.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  resendMsg: {
    ...textStyles.caption,
    color:        colors.semantic.success,
    textAlign:    'center',
    marginBottom: spacing.md,
  },
  cta: {
    marginTop: spacing.md,
  },
  resendRow: {
    flexDirection:  'row',
    justifyContent: 'center',
    alignItems:     'center',
    marginTop:      spacing.lg,
  },
  resendLabel: {
    ...textStyles.bodyNormal,
    color: colors.neutral.midGray,
  },
  resendLink: {
    ...textStyles.bodyNormal,
    color:      colors.primary.green,
    fontWeight: '600',
  },
});

export default VerifyEmailScreen;
