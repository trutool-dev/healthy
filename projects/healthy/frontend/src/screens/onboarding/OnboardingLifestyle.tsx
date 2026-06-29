import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { NativeStackScreenProps }      from '@react-navigation/native-stack';
import { RootStackParamList }          from '@/navigation/RootNavigator';
import { useOnboardingStore, Schedule } from '@/stores/onboardingStore';
import { OnboardingLayout }            from './OnboardingLayout';
import { SelectCard }                  from './SelectCard';
import { Input }                       from '@/components/ui/Input';
import { colors }    from '@/theme/colors';
import { textStyles } from '@/theme/typography';
import { spacing, borderRadius, shadows } from '@/theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingLifestyle'>;
const STRESS_COLORS = [colors.semantic.success,'#84CC16',colors.semantic.warning,'#F97316',colors.semantic.error];

export function OnboardingLifestyle({ navigation }: Props) {
  const { data, setLifestyle } = useOnboardingStore();
  const prev = data.lifestyle;
  const [profession,  setProfession]  = useState(prev?.profession  ?? '');
  const [schedule,    setSchedule]    = useState<Schedule|undefined>(prev?.workSchedule);
  const [stress,      setStress]      = useState<1|2|3|4|5|undefined>(prev?.stressLevel);

  return (
    <OnboardingLayout step={3} title="Tu estilo de vida" subtitle="Adaptamos el plan a tu rutina diaria"
      onBack={() => navigation.goBack()} onContinue={() => { setLifestyle({ profession: profession.trim(), workSchedule: schedule!, stressLevel: stress! }); navigation.navigate('OnboardingTraining'); }}
      canContinue={!!profession.trim() && !!schedule && !!stress}>
      <Input label="¿A qué te dedicas?" value={profession} onChangeText={setProfession} hint="Ej: estudiante, oficina…" inputProps={{ autoCapitalize: 'sentences' }} />
      <Text style={s.sec}>Horario habitual de trabajo</Text>
      {([{value:'morning',icon:'🌅',label:'Mañanas',sublabel:'7:00 – 15:00'},{value:'afternoon',icon:'☀️',label:'Tardes',sublabel:'15:00 – 23:00'},{value:'night',icon:'🌙',label:'Noches',sublabel:'23:00 – 7:00'},{value:'flexible',icon:'🔄',label:'Flexible',sublabel:'Horario variable'}] as {value:Schedule;icon:string;label:string;sublabel:string}[]).map((sc) => (
        <SelectCard key={sc.value} icon={sc.icon} label={sc.label} sublabel={sc.sublabel} selected={schedule===sc.value} onPress={()=>setSchedule(sc.value)} />
      ))}
      <Text style={s.sec}>Nivel de estrés habitual</Text>
      <View style={s.stressRow}>
        {([1,2,3,4,5] as (1|2|3|4|5)[]).map((n) => (
          <Pressable key={n} onPress={()=>setStress(n)} style={[s.stressBtn, stress===n && {backgroundColor:STRESS_COLORS[n-1],borderColor:STRESS_COLORS[n-1]}]}>
            <Text style={[s.stressNum, stress===n && {color:colors.neutral.white}]}>{n}</Text>
          </Pressable>
        ))}
      </View>
      {stress && <Text style={[s.stressLabel,{color:STRESS_COLORS[stress-1]}]}>{['Muy bajo','Bajo','Moderado','Alto','Muy alto'][stress-1]}</Text>}
    </OnboardingLayout>
  );
}

const s = StyleSheet.create({
  sec:       { ...textStyles.label, color: colors.neutral.midGray, marginTop: spacing.lg, marginBottom: spacing.sm },
  stressRow: { flexDirection: 'row', gap: spacing.sm },
  stressBtn: { flex: 1, height: 52, borderRadius: borderRadius.input, borderWidth: 1.5, borderColor: colors.neutral.lightGray, backgroundColor: colors.neutral.offWhite, alignItems: 'center', justifyContent: 'center', ...shadows.card },
  stressNum: { ...textStyles.titleSmall, color: colors.neutral.midGray },
  stressLabel:{ ...textStyles.caption, fontWeight: '600', textAlign: 'center', marginTop: spacing.sm },
});
export default OnboardingLifestyle;
