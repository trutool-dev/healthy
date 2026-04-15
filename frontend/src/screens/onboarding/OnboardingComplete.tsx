/**
 * OnboardingComplete — pantalla de cierre del onboarding
 * Envía todos los datos al backend, muestra animación de generación del plan con IA
 * y navega a la app principal al terminar
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps }  from '@react-navigation/native-stack';
import { RootStackParamList }      from '@/navigation/RootNavigator';
import { useOnboardingStore }      from '@/stores/onboardingStore';
import { useAuthStore }            from '@/stores/authStore';
import { Button }                  from '@/components/ui/Button';
import { colors }                  from '@/theme/colors';
import { textStyles }              from '@/theme/typography';
import { spacing, duration }       from '@/theme/spacing';
import api                         from '@/services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingComplete'>;

// Mensajes mostrados mientras la IA procesa (simulación de progreso)
const LOADING_MESSAGES = [
  'Analizando tu perfil…',
  'Calculando tus necesidades calóricas…',
  'Diseñando tu plan de entrenamiento…',
  'Creando tus menús personalizados…',
  'Ajustando el plan a tu estilo de vida…',
  'Últimos retoques…',
];

type Status = 'generating' | 'success' | 'error';

export function OnboardingComplete({ navigation }: Props) {
  const { data, reset }   = useOnboardingStore();
  const { setAuth }       = useAuthStore();

  const [status,  setStatus]  = useState<Status>('generating');
  const [msgIdx,  setMsgIdx]  = useState(0);
  const [errMsg,  setErrMsg]  = useState('');

  // Animación de rotación para el spinner
  const spinAnim  = useRef(new Animated.Value(0)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Gira el spinner continuamente mientras genera
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue:         1,
        duration:        1200,
        easing:          Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Cicla por los mensajes de progreso cada 2 s
  useEffect(() => {
    if (status !== 'generating') return;
    const t = setInterval(() => {
      setMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2000);
    return () => clearInterval(t);
  }, [status]);

  // Llama a la API al montar
  useEffect(() => {
    submitOnboarding();
  }, []);

  const submitOnboarding = async () => {
    try {
      const { data: res } = await api.post('/onboarding/complete', data);
      // Si el backend devuelve un token actualizado (con onboarding completado)
      if (res.token) {
        await setAuth(res.user, res.token);
      }
      setStatus('success');
      // Anima la aparición del estado de éxito
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: duration.medium, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
      ]).start();
      reset();
    } catch (err: any) {
      const message = err.response?.data?.message ?? 'No se pudo generar el plan. Inténtalo de nuevo.';
      setErrMsg(message);
      setStatus('error');
    }
  };

  const spin = spinAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // ── Estado: generando ────────────────────────────────────────────────────────
  if (status === 'generating') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Animated.View style={[styles.spinnerOuter, { transform: [{ rotate: spin }] }]}>
            <View style={styles.spinnerInner} />
          </Animated.View>

          <Text style={styles.genTitle}>Generando tu plan</Text>
          <Text style={styles.genMsg}>{LOADING_MESSAGES[msgIdx]}</Text>

          <View style={styles.summaryBox}>
            <SummaryRow icon="🎯" label={goalLabel(data.goal)} />
            <SummaryRow icon="📏" label={profileLabel(data.profile)} />
            <SummaryRow icon="🏋️" label={trainingLabel(data.training)} />
            <SummaryRow icon="🥗" label={dietLabel(data.nutrition?.dietType)} />
          </View>

          <Text style={styles.disclaimer}>
            La IA de Healthy está personalizando cada detalle para ti
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Estado: error ────────────────────────────────────────────────────────────
  if (status === 'error') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorEmoji}>😓</Text>
          <Text style={styles.errorTitle}>Algo salió mal</Text>
          <Text style={styles.errorMsg}>{errMsg}</Text>
          <Button
            label="Reintentar"
            variant="primary"
            onPress={() => { setStatus('generating'); submitOnboarding(); }}
            style={styles.retryBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  // ── Estado: éxito ────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View style={[styles.center, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.successCircle}>
          <Text style={styles.successEmoji}>🎉</Text>
        </View>

        <Text style={styles.successTitle}>¡Tu plan está listo!</Text>
        <Text style={styles.successSubtitle}>
          Hemos creado un plan 100% personalizado para ti.{'\n'}
          Empieza hoy y ve los resultados desde la primera semana.
        </Text>

        <View style={styles.highlights}>
          <HighlightItem icon="📅" label="Plan semanal de entrenamiento" />
          <HighlightItem icon="🍽️" label="Menús diarios con recetas" />
          <HighlightItem icon="📊" label="Seguimiento de tu progreso" />
        </View>

        <Button
          label="Ver mi plan"
          variant="primary"
          onPress={() => navigation.replace('MainTabs')}
          style={styles.ctaBtn}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

// ── Helpers de etiquetas ────────────────────────────────────────────────────

function goalLabel(goal?: string) {
  const map: Record<string, string> = {
    lose_weight:    'Perder peso',
    gain_muscle:    'Ganar músculo',
    stay_active:    'Mantenerme activo',
    improve_habits: 'Mejorar hábitos',
  };
  return goal ? map[goal] ?? goal : '—';
}

function profileLabel(p?: { age: number; weight: number; height: number }) {
  if (!p) return '—';
  return `${p.age} años · ${p.weight} kg · ${p.height} cm`;
}

function trainingLabel(t?: { daysPerWeek: number; experience: string }) {
  if (!t) return '—';
  const expMap: Record<string, string> = {
    beginner:     'principiante',
    intermediate: 'intermedio',
    advanced:     'avanzado',
  };
  return `${t.daysPerWeek} días/semana · ${expMap[t.experience] ?? t.experience}`;
}

function dietLabel(diet?: string) {
  const map: Record<string, string> = {
    omnivore:   'Omnívoro', vegetarian: 'Vegetariano',
    vegan:      'Vegano',   gluten_free:'Sin gluten',
    keto:       'Keto',     other:      'Otra',
  };
  return diet ? map[diet] ?? diet : '—';
}

// ── Sub-componentes ─────────────────────────────────────────────────────────

function SummaryRow({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={summaryStyles.row}>
      <Text style={summaryStyles.icon}>{icon}</Text>
      <Text style={summaryStyles.label}>{label}</Text>
    </View>
  );
}

function HighlightItem({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={highlightStyles.row}>
      <View style={highlightStyles.iconWrap}>
        <Text style={highlightStyles.icon}>{icon}</Text>
      </View>
      <Text style={highlightStyles.label}>{label}</Text>
    </View>
  );
}

// ── Estilos ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:  { flex: 1, backgroundColor: colors.neutral.white },
  center: {
    flex:              1,
    alignItems:        'center',
    justifyContent:    'center',
    paddingHorizontal: spacing.lg,
    gap:               spacing.lg,
  },

  // Spinner
  spinnerOuter: {
    width:        72,
    height:       72,
    borderRadius: 36,
    borderWidth:  4,
    borderColor:  colors.primary.lightGreen,
    borderTopColor: colors.primary.green,
  },
  spinnerInner: {
    position:     'absolute',
    inset:        8,
    borderRadius: 24,
    backgroundColor: colors.primary.lightGreen + '40',
  },
  genTitle: {
    ...textStyles.titleMedium,
    color: colors.neutral.black,
  },
  genMsg: {
    ...textStyles.bodyNormal,
    color:     colors.neutral.midGray,
    textAlign: 'center',
    minHeight: 22,
  },
  summaryBox: {
    width:           '100%',
    backgroundColor: colors.neutral.offWhite,
    borderRadius:    20,
    padding:         spacing.lg,
    gap:             spacing.md,
  },
  disclaimer: {
    ...textStyles.caption,
    color:     colors.neutral.midGray,
    textAlign: 'center',
  },

  // Error
  errorEmoji: { fontSize: 48 },
  errorTitle: {
    ...textStyles.titleSmall,
    color: colors.neutral.black,
  },
  errorMsg: {
    ...textStyles.bodyNormal,
    color:     colors.neutral.midGray,
    textAlign: 'center',
  },
  retryBtn: { width: '100%' },

  // Éxito
  successCircle: {
    width:           96,
    height:          96,
    borderRadius:    48,
    backgroundColor: colors.primary.lightGreen,
    alignItems:      'center',
    justifyContent:  'center',
  },
  successEmoji: { fontSize: 44 },
  successTitle: {
    ...textStyles.titleMedium,
    color:     colors.neutral.black,
    textAlign: 'center',
  },
  successSubtitle: {
    ...textStyles.bodyNormal,
    color:     colors.neutral.midGray,
    textAlign: 'center',
    lineHeight: 22,
  },
  highlights: {
    width:           '100%',
    backgroundColor: colors.neutral.offWhite,
    borderRadius:    20,
    padding:         spacing.lg,
    gap:             spacing.md,
  },
  ctaBtn: { width: '100%' },
});

const summaryStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing.md,
  },
  icon:  { fontSize: 18, width: 28, textAlign: 'center' },
  label: { ...textStyles.bodyNormal, color: colors.neutral.darkGray, flex: 1 },
});

const highlightStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing.md,
  },
  iconWrap: {
    width:           40,
    height:          40,
    borderRadius:    20,
    backgroundColor: colors.primary.lightGreen,
    alignItems:      'center',
    justifyContent:  'center',
  },
  icon:  { fontSize: 20 },
  label: { ...textStyles.bodyNormal, fontWeight: '600', color: colors.neutral.darkGray },
});

export default OnboardingComplete;
