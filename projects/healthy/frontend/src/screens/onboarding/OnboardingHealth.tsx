import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList }     from '@/navigation/RootNavigator';
import { useOnboardingStore }     from '@/stores/onboardingStore';
import { OnboardingLayout }       from './OnboardingLayout';
import { colors }    from '@/theme/colors';
import { textStyles } from '@/theme/typography';
import { spacing, borderRadius, shadows } from '@/theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingHealth'>;

const CONDITIONS = [{id:'diabetes',label:'Diabetes',icon:'💉'},{id:'hypertension',label:'Hipertensión',icon:'🩺'},{id:'heart',label:'Prob. cardíacos',icon:'❤️'},{id:'asthma',label:'Asma',icon:'🫁'},{id:'thyroid',label:'Tiroides',icon:'🦋'},{id:'cholesterol',label:'Colesterol alto',icon:'🩸'},{id:'none_cond',label:'Ninguna',icon:'✅'}];
const INJURIES   = [{id:'back',label:'Espalda',icon:'🔙'},{id:'knee',label:'Rodilla',icon:'🦵'},{id:'shoulder',label:'Hombro',icon:'💪'},{id:'ankle',label:'Tobillo',icon:'🦶'},{id:'neck',label:'Cuello',icon:'🧣'},{id:'wrist',label:'Muñeca/codo',icon:'🤛'},{id:'none_inj',label:'Ninguna',icon:'✅'}];

function toggle(list: string[], id: string, noneId: string) {
  if (id === noneId) return [noneId];
  const f = list.filter((x) => x !== noneId);
  return f.includes(id) ? f.filter((x) => x !== id) : [...f, id];
}

export function OnboardingHealth({ navigation }: Props) {
  const { data, setHealth } = useOnboardingStore();
  const [conditions, setConditions] = useState<string[]>(data.health?.conditions ?? []);
  const [injuries,   setInjuries]   = useState<string[]>(data.health?.injuries   ?? []);

  return (
    <OnboardingLayout step={6} title="Tu salud" subtitle="Solo usamos esto para adaptar tu plan y evitar ejercicios o alimentos que puedan afectarte"
      onBack={() => navigation.goBack()} onContinue={() => { setHealth({ conditions, injuries }); navigation.navigate('OnboardingMotivation'); }}
      canContinue={conditions.length > 0 && injuries.length > 0}>
      <View style={s.badge}><Text style={s.badgeIcon}>🔒</Text><Text style={s.badgeText}>Esta información es privada, cifrada y nunca se comparte con terceros</Text></View>
      <Text style={s.sec}>Condiciones médicas</Text>
      <View style={s.chips}>
        {CONDITIONS.map((c) => (
          <Pressable key={c.id} onPress={()=>setConditions(p=>toggle(p,c.id,'none_cond'))} style={[s.chip, conditions.includes(c.id) && s.chipSel]}>
            <Text style={{fontSize:16}}>{c.icon}</Text>
            <Text style={[s.chipLabel, conditions.includes(c.id) && s.chipLabelSel]}>{c.label}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={[s.sec,{marginTop:spacing.lg}]}>Lesiones o limitaciones</Text>
      <View style={s.chips}>
        {INJURIES.map((inj) => (
          <Pressable key={inj.id} onPress={()=>setInjuries(p=>toggle(p,inj.id,'none_inj'))} style={[s.chip, injuries.includes(inj.id) && s.chipSel]}>
            <Text style={{fontSize:16}}>{inj.icon}</Text>
            <Text style={[s.chipLabel, injuries.includes(inj.id) && s.chipLabelSel]}>{inj.label}</Text>
          </Pressable>
        ))}
      </View>
    </OnboardingLayout>
  );
}

const s = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.semantic.info+'18', borderRadius: borderRadius.input, padding: spacing.md, marginBottom: spacing.lg },
  badgeIcon: { fontSize: 18 },
  badgeText: { ...textStyles.caption, color: colors.semantic.info, flex: 1, lineHeight: 17 },
  sec:  { ...textStyles.label, color: colors.neutral.midGray, marginBottom: spacing.md },
  chips:{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.pill, borderWidth: 1.5, borderColor: colors.neutral.lightGray, backgroundColor: colors.neutral.offWhite, ...shadows.card },
  chipSel: { borderColor: colors.primary.green, backgroundColor: colors.primary.lightGreen },
  chipLabel: { ...textStyles.bodyNormal, color: colors.neutral.darkGray },
  chipLabelSel: { color: colors.primary.darkGreen, fontWeight: '600' },
});
export default OnboardingHealth;
