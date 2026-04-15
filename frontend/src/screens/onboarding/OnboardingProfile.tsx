/**
 * OnboardingProfile — paso 2/7: datos físicos (género, edad, peso, altura, complexión)
 */

import React, { useState }                from 'react';
import { View, Text, StyleSheet }         from 'react-native';
import { NativeStackScreenProps }         from '@react-navigation/native-stack';
import { RootStackParamList }             from '@/navigation/RootNavigator';
import { useOnboardingStore, BodyType, Gender } from '@/stores/onboardingStore';
import { OnboardingLayout }               from './OnboardingLayout';
import { SelectCard }                     from './SelectCard';
import { Input }                          from '@/components/ui/Input';
import { colors }                         from '@/theme/colors';
import { textStyles }                     from '@/theme/typography';
import { spacing }                        from '@/theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingProfile'>;

const GENDERS: { value: Gender; icon: string; label: string }[] = [
  { value: 'male',   icon: '♂️', label: 'Hombre' },
  { value: 'female', icon: '♀️', label: 'Mujer'  },
  { value: 'other',  icon: '⚧',  label: 'Otro'   },
];

const BODY_TYPES: { value: BodyType; icon: string; label: string; sublabel: string }[] = [
  { value: 'slim',      icon: '🪶', label: 'Delgado/a',   sublabel: 'Dificultad para ganar peso' },
  { value: 'athletic',  icon: '🏃', label: 'Atlético/a',  sublabel: 'Musculado/a, poca grasa'    },
  { value: 'average',   icon: '🙂', label: 'Promedio',    sublabel: 'Constitución media'          },
  { value: 'overweight',icon: '🍃', label: 'Con sobrepeso',sublabel: 'Quiero reducir grasa'       },
];

export function OnboardingProfile({ navigation }: Props) {
  const { data, setProfile } = useOnboardingStore();
  const prev = data.profile;

  const [gender,   setGender]   = useState<Gender | undefined>(prev?.gender);
  const [age,      setAge]      = useState(prev?.age?.toString()     ?? '');
  const [weight,   setWeight]   = useState(prev?.weight?.toString()  ?? '');
  const [height,   setHeight]   = useState(prev?.height?.toString()  ?? '');
  const [bodyType, setBodyType] = useState<BodyType | undefined>(prev?.bodyType);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!gender)                           e.gender   = 'Selecciona tu género';
    if (!age || isNaN(+age) || +age < 10 || +age > 100) e.age = 'Edad entre 10 y 100';
    if (!weight || isNaN(+weight) || +weight < 30 || +weight > 300) e.weight = 'Peso entre 30 y 300 kg';
    if (!height || isNaN(+height) || +height < 100 || +height > 250) e.height = 'Altura entre 100 y 250 cm';
    if (!bodyType)                         e.bodyType = 'Selecciona tu complexión';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;
    setProfile({ gender: gender!, age: +age, weight: +weight, height: +height, bodyType: bodyType! });
    navigation.navigate('OnboardingLifestyle');
  };

  const canContinue = !!(gender && age && weight && height && bodyType);

  return (
    <OnboardingLayout
      step={2}
      title="Tu perfil físico"
      subtitle="Lo usaremos para calcular tus necesidades calóricas y de entrenamiento"
      onBack={() => navigation.goBack()}
      onContinue={handleContinue}
      canContinue={canContinue}
    >
      {/* Género */}
      <Text style={styles.sectionTitle}>Género</Text>
      <View style={styles.genderRow}>
        {GENDERS.map((g) => (
          <SelectCard
            key={g.value}
            icon={g.icon}
            label={g.label}
            selected={gender === g.value}
            onPress={() => { setGender(g.value); setErrors((e) => ({ ...e, gender: '' })); }}
            style={styles.genderCard}
          />
        ))}
      </View>
      {errors.gender ? <Text style={styles.error}>{errors.gender}</Text> : null}

      {/* Métricas numéricas */}
      <View style={styles.metricsRow}>
        <Input
          label="Edad"
          value={age}
          onChangeText={(t) => { setAge(t); setErrors((e) => ({ ...e, age: '' })); }}
          keyboardType="number-pad"
          errorMessage={errors.age}
          hint="años"
          style={styles.metricInput}
        />
        <Input
          label="Peso"
          value={weight}
          onChangeText={(t) => { setWeight(t); setErrors((e) => ({ ...e, weight: '' })); }}
          keyboardType="decimal-pad"
          errorMessage={errors.weight}
          hint="kg"
          style={styles.metricInput}
        />
        <Input
          label="Altura"
          value={height}
          onChangeText={(t) => { setHeight(t); setErrors((e) => ({ ...e, height: '' })); }}
          keyboardType="number-pad"
          errorMessage={errors.height}
          hint="cm"
          style={styles.metricInput}
        />
      </View>

      {/* Complexión */}
      <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Complexión</Text>
      {BODY_TYPES.map((b) => (
        <SelectCard
          key={b.value}
          icon={b.icon}
          label={b.label}
          sublabel={b.sublabel}
          selected={bodyType === b.value}
          onPress={() => { setBodyType(b.value); setErrors((e) => ({ ...e, bodyType: '' })); }}
        />
      ))}
      {errors.bodyType ? <Text style={styles.error}>{errors.bodyType}</Text> : null}
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    ...textStyles.label,
    color:        colors.neutral.midGray,
    marginBottom: spacing.sm,
  },
  genderRow: {
    flexDirection: 'row',
    gap:           spacing.sm,
    marginBottom:  spacing.sm,
  },
  genderCard: {
    flex:          1,
    marginBottom:  0,
  },
  metricsRow: {
    flexDirection: 'row',
    gap:           spacing.sm,
    marginTop:     spacing.lg,
    marginBottom:  spacing.sm,
  },
  metricInput: {
    flex: 1,
  },
  error: {
    ...textStyles.caption,
    color:     colors.semantic.error,
    marginTop: spacing.xs,
  },
});

export default OnboardingProfile;
