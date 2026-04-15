/**
 * SetPasswordScreen — crea la contraseña tras la verificación de email
 * Muestra indicador de fortaleza en tiempo real
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
import { spacing, borderRadius }  from '@/theme/spacing';
import { useAuthStore }           from '@/stores/authStore';
import api                        from '@/services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'SetPassword'>;

// Calcula la fortaleza de la contraseña (0-4)
function getStrength(pwd: string): number {
  let score = 0;
  if (pwd.length >= 8)             score++;
  if (/[A-Z]/.test(pwd))           score++;
  if (/[0-9]/.test(pwd))           score++;
  if (/[^A-Za-z0-9]/.test(pwd))   score++;
  return score;
}

const STRENGTH_LABELS = ['Muy débil', 'Débil', 'Aceptable', 'Fuerte', 'Muy fuerte'];
const STRENGTH_COLORS = [
  colors.semantic.error,
  colors.semantic.warning,
  colors.semantic.warning,
  colors.semantic.success,
  colors.semantic.success,
];

export function SetPasswordScreen({ navigation, route }: Props) {
  const { email, code } = route.params;
  const { setAuth }     = useAuthStore();

  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [showPwd, setShowPwd]       = useState(false);
  const [showConf, setShowConf]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [errors, setErrors]         = useState<{ password?: string; confirm?: string; general?: string }>({});

  const strength = getStrength(password);

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!password) {
      next.password = 'La contraseña es obligatoria';
    } else if (password.length < 8) {
      next.password = 'Mínimo 8 caracteres';
    } else if (strength < 2) {
      next.password = 'La contraseña es demasiado débil';
    }
    if (!confirm) {
      next.confirm = 'Confirma tu contraseña';
    } else if (password !== confirm) {
      next.confirm = 'Las contraseñas no coinciden';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSetPassword = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/auth/set-password', { email, code, password });
      // Guarda sesión y navega a la app
      await setAuth(data.user, data.token);
    } catch (err: any) {
      const message = err.response?.data?.message ?? 'Error al crear la contraseña. Inténtalo de nuevo.';
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  // Toggle de visibilidad de contraseña
  const EyeToggle = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
    <TouchableOpacity onPress={onToggle} accessibilityLabel={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
      <Text style={eyeStyles.icon}>{show ? '🙈' : '👁'}</Text>
    </TouchableOpacity>
  );

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

          <Text style={styles.title}>Crea tu contraseña</Text>
          <Text style={styles.subtitle}>
            Elige una contraseña segura para proteger tu cuenta
          </Text>

          {/* Campos */}
          <View style={styles.form}>
            <Input
              label="Contraseña"
              value={password}
              onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: undefined })); }}
              secureText={!showPwd}
              errorMessage={errors.password}
              rightElement={<EyeToggle show={showPwd} onToggle={() => setShowPwd((v) => !v)} />}
            />

            {/* Indicador de fortaleza */}
            {password.length > 0 && (
              <View style={styles.strengthWrapper}>
                <View style={styles.strengthBars}>
                  {[0, 1, 2, 3].map((i) => (
                    <View
                      key={i}
                      style={[
                        styles.strengthBar,
                        { backgroundColor: i < strength ? STRENGTH_COLORS[strength] : colors.neutral.lightGray },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.strengthLabel, { color: STRENGTH_COLORS[strength] }]}>
                  {STRENGTH_LABELS[strength]}
                </Text>
              </View>
            )}

            <Input
              label="Confirmar contraseña"
              value={confirm}
              onChangeText={(t) => { setConfirm(t); setErrors((e) => ({ ...e, confirm: undefined })); }}
              secureText={!showConf}
              errorMessage={errors.confirm}
              rightElement={<EyeToggle show={showConf} onToggle={() => setShowConf((v) => !v)} />}
              style={styles.inputGap}
            />

            {errors.general ? (
              <Text style={styles.errorGeneral}>{errors.general}</Text>
            ) : null}
          </View>

          {/* Requisitos */}
          <View style={styles.requirements}>
            <Requirement met={password.length >= 8}      label="Mínimo 8 caracteres" />
            <Requirement met={/[A-Z]/.test(password)}    label="Una letra mayúscula" />
            <Requirement met={/[0-9]/.test(password)}    label="Un número" />
            <Requirement met={/[^A-Za-z0-9]/.test(password)} label="Un carácter especial" />
          </View>

          <Button
            label="Crear cuenta"
            variant="primary"
            loading={loading}
            onPress={handleSetPassword}
            style={styles.cta}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Fila de requisito con checkmark
function Requirement({ met, label }: { met: boolean; label: string }) {
  return (
    <View style={reqStyles.row}>
      <Text style={[reqStyles.icon, met && reqStyles.iconMet]}>{met ? '✓' : '○'}</Text>
      <Text style={[reqStyles.label, met && reqStyles.labelMet]}>{label}</Text>
    </View>
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
  strengthWrapper: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing.md,
    marginTop:     spacing.sm,
  },
  strengthBars: {
    flex:          1,
    flexDirection: 'row',
    gap:           4,
  },
  strengthBar: {
    flex:         1,
    height:       4,
    borderRadius: borderRadius.pill,
  },
  strengthLabel: {
    ...textStyles.caption,
    fontWeight: '600',
    minWidth:   70,
  },
  errorGeneral: {
    ...textStyles.caption,
    color:     colors.semantic.error,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  requirements: {
    marginTop: spacing.lg,
    gap:       spacing.xs,
  },
  cta: {
    marginTop: spacing.xl,
  },
});

const reqStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing.sm,
  },
  icon: {
    fontSize: 14,
    color:    colors.neutral.midGray,
    width:    16,
  },
  iconMet: {
    color: colors.semantic.success,
  },
  label: {
    ...textStyles.caption,
    color: colors.neutral.midGray,
  },
  labelMet: {
    color: colors.neutral.darkGray,
  },
});

const eyeStyles = StyleSheet.create({
  icon: { fontSize: 18 },
});

export default SetPasswordScreen;
