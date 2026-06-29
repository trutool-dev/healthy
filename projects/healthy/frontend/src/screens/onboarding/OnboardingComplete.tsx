import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList }     from '@/navigation/RootNavigator';
import { useOnboardingStore }     from '@/stores/onboardingStore';
import { useAuthStore }           from '@/stores/authStore';
import { Button }   from '@/components/ui/Button';
import { colors }   from '@/theme/colors';
import { textStyles } from '@/theme/typography';
import { spacing, duration } from '@/theme/spacing';
import api from '@/services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingComplete'>;
type Status = 'generating' | 'success' | 'error';

const MSGS = ['Analizando tu perfil…','Calculando tus necesidades calóricas…','Diseñando tu plan de entrenamiento…','Creando tus menús personalizados…','Ajustando a tu estilo de vida…','Últimos retoques…'];

export function OnboardingComplete({ navigation }: Props) {
  const { data, reset } = useOnboardingStore();
  const { setAuth }     = useAuthStore();
  const [status, setStatus] = useState<Status>('generating');
  const [msgIdx, setMsgIdx] = useState(0);
  const [errMsg, setErrMsg] = useState('');
  const spinAnim  = useRef(new Animated.Value(0)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.loop(Animated.timing(spinAnim, { toValue: 1, duration: 1200, easing: Easing.linear, useNativeDriver: true })).start();
  }, []);

  useEffect(() => {
    if (status !== 'generating') return;
    const t = setInterval(() => setMsgIdx((i) => (i + 1) % MSGS.length), 2000);
    return () => clearInterval(t);
  }, [status]);

  useEffect(() => { submit(); }, []);

  const submit = async () => {
    try {
      const { data: res } = await api.post('/onboarding/complete', data);
      if (res.token) await setAuth(res.user, res.token);
      setStatus('success');
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: duration.medium, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
      ]).start();
      reset();
    } catch (err: any) {
      setErrMsg(err.response?.data?.message ?? 'No se pudo generar el plan.');
      setStatus('error');
    }
  };

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  if (status === 'generating') return (
    <SafeAreaView style={s.safe}><View style={s.center}>
      <Animated.View style={[s.spinner, { transform: [{ rotate: spin }] }]} />
      <Text style={s.genTitle}>Generando tu plan</Text>
      <Text style={s.genMsg}>{MSGS[msgIdx]}</Text>
      <Text style={s.disclaimer}>La IA de Healthy está personalizando cada detalle para ti</Text>
    </View></SafeAreaView>
  );

  if (status === 'error') return (
    <SafeAreaView style={s.safe}><View style={s.center}>
      <Text style={{ fontSize: 48 }}>😓</Text>
      <Text style={s.genTitle}>Algo salió mal</Text>
      <Text style={s.genMsg}>{errMsg}</Text>
      <Button label="Reintentar" variant="primary" onPress={() => { setStatus('generating'); submit(); }} style={s.btn} />
    </View></SafeAreaView>
  );

  return (
    <SafeAreaView style={s.safe}>
      <Animated.View style={[s.center, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={s.successCircle}><Text style={{ fontSize: 44 }}>🎉</Text></View>
        <Text style={s.genTitle}>¡Tu plan está listo!</Text>
        <Text style={s.successSub}>Hemos creado un plan 100% personalizado para ti.{'\n'}Empieza hoy y ve los resultados desde la primera semana.</Text>
        <View style={s.highlights}>
          {[['📅','Plan semanal de entrenamiento'],['🍽️','Menús diarios con recetas'],['📊','Seguimiento de tu progreso']].map(([icon,label]) => (
            <View key={label as string} style={s.hlRow}>
              <View style={s.hlIcon}><Text style={{fontSize:20}}>{icon}</Text></View>
              <Text style={s.hlLabel}>{label as string}</Text>
            </View>
          ))}
        </View>
        <Button label="Ver mi plan" variant="primary" onPress={() => navigation.replace('MainTabs')} style={s.btn} />
      </Animated.View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: colors.neutral.white },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg, gap: spacing.lg },
  spinner:     { width: 72, height: 72, borderRadius: 36, borderWidth: 4, borderColor: colors.primary.lightGreen, borderTopColor: colors.primary.green },
  genTitle:    { ...textStyles.titleMedium, color: colors.neutral.black, textAlign: 'center' },
  genMsg:      { ...textStyles.bodyNormal, color: colors.neutral.midGray, textAlign: 'center', minHeight: 22 },
  disclaimer:  { ...textStyles.caption, color: colors.neutral.midGray, textAlign: 'center' },
  btn:         { width: '100%' },
  successCircle:{ width: 96, height: 96, borderRadius: 48, backgroundColor: colors.primary.lightGreen, alignItems: 'center', justifyContent: 'center' },
  successSub:  { ...textStyles.bodyNormal, color: colors.neutral.midGray, textAlign: 'center', lineHeight: 22 },
  highlights:  { width: '100%', backgroundColor: colors.neutral.offWhite, borderRadius: 20, padding: spacing.lg, gap: spacing.md },
  hlRow:       { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  hlIcon:      { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary.lightGreen, alignItems: 'center', justifyContent: 'center' },
  hlLabel:     { ...textStyles.bodyNormal, fontWeight: '600', color: colors.neutral.darkGray },
});
export default OnboardingComplete;
