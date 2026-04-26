import React, { useState } from 'react';
import { NativeStackScreenProps }   from '@react-navigation/native-stack';
import { RootStackParamList }       from '@/navigation/RootNavigator';
import { useOnboardingStore, Goal } from '@/stores/onboardingStore';
import { OnboardingLayout }         from './OnboardingLayout';
import { SelectCard }               from './SelectCard';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingGoal'>;

const GOALS: { value: Goal; icon: string; label: string; sublabel: string }[] = [
  { value: 'lose_weight',    icon: '🔥', label: 'Perder peso',        sublabel: 'Quema grasa de forma sostenible'              },
  { value: 'gain_muscle',    icon: '💪', label: 'Ganar músculo',       sublabel: 'Mejora tu fuerza y composición corporal'      },
  { value: 'stay_active',    icon: '🧘', label: 'Mantenerme activo',   sublabel: 'Hábitos saludables para el día a día'         },
  { value: 'improve_habits', icon: '🌱', label: 'Mejorar mis hábitos', sublabel: 'Alimentación y bienestar general'             },
];

export function OnboardingGoal({ navigation }: Props) {
  const { data, setGoal } = useOnboardingStore();
  const [selected, setSelected] = useState<Goal | undefined>(data.goal);

  return (
    <OnboardingLayout step={1} title="¿Cuál es tu objetivo principal?" subtitle="Elige uno — tu plan se construirá en torno a él"
      onBack={() => navigation.goBack()} onContinue={() => { setGoal(selected!); navigation.navigate('OnboardingProfile'); }} canContinue={!!selected}>
      {GOALS.map((g) => <SelectCard key={g.value} icon={g.icon} label={g.label} sublabel={g.sublabel} selected={selected === g.value} onPress={() => setSelected(g.value)} />)}
    </OnboardingLayout>
  );
}
export default OnboardingGoal;
