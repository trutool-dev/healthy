/**
 * ProfileScreen — datos del usuario, resumen del plan y configuración
 */

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import { useAuthStore }        from '@/stores/authStore';
import { usePlanStore }        from '@/stores/planStore';
import { useOnboardingStore }  from '@/stores/onboardingStore';
import { Button }              from '@/components/ui/Button';
import { colors }              from '@/theme/colors';
import { textStyles }          from '@/theme/typography';
import { spacing, borderRadius, shadows } from '@/theme/spacing';

// ── Mapas de etiquetas ───────────────────────────────────────────────────────

const GOAL_LABELS: Record<string, string> = {
  lose_weight:    'Perder peso',
  gain_muscle:    'Ganar músculo',
  stay_active:    'Mantenerse activo',
  improve_habits: 'Mejorar hábitos',
};

const DIET_LABELS: Record<string, string> = {
  omnivore:    'Omnívoro',
  vegetarian:  'Vegetariano',
  vegan:       'Vegano',
  gluten_free: 'Sin gluten',
  keto:        'Cetogénica',
  other:       'Otra',
};

// ── Pantalla ─────────────────────────────────────────────────────────────────

export function ProfileScreen() {
  const { user, logout }                              = useAuthStore();
  const { todayWorkout, streak, progressStats,
          isLoadingProgress, fetchProgress }          = usePlanStore();
  const { data: onboarding }                         = useOnboardingStore();
  const [notifications, setNotif]                    = useState(true);
  const [darkMode, setDarkMode]                      = useState(false);

  // Cargar estadísticas de progreso al montar la pantalla
  useEffect(() => {
    fetchProgress();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Seguro que quieres salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salir',    style: 'destructive', onPress: () => logout() },
      ],
    );
  };

  const initials = (user?.name ?? user?.email ?? 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Datos de perfil desde onboardingStore
  const profile  = onboarding.profile;
  const training = onboarding.training;
  const nutrition = onboarding.nutrition;
  const goal     = onboarding.goal;

  const heightLabel = profile?.height ? `${profile.height} cm`   : '—';
  const weightLabel = profile?.weight ? `${profile.weight} kg`   : '—';
  const ageLabel    = profile?.age    ? `${profile.age} años`    : '—';
  const dietLabel   = nutrition?.dietType ? (DIET_LABELS[nutrition.dietType] ?? nutrition.dietType) : '—';
  const goalLabel   = goal ? (GOAL_LABELS[goal] ?? goal) : '—';
  const sessionsLabel = training?.daysPerWeek ? `${training.daysPerWeek} días` : '—';

  // Estadísticas dinámicas desde /progress/stats
  const workoutsValue = isLoadingProgress
    ? '…'
    : `${progressStats?.workoutsCompleted ?? 0}`;

  const kgLostValue = isLoadingProgress
    ? '…'
    : progressStats
      ? `−${progressStats.kgLost.toFixed(1)} kg`
      : '—';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Avatar y nombre */}
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{user?.name ?? 'Mi perfil'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>✨ Plan activo</Text>
          </View>
        </View>

        {/* Estadísticas rápidas */}
        <View style={styles.statsRow}>
          <StatBox icon="🔥" value={`${streak}`}     label="Días racha" color="#F59E0B" />
          <StatBox icon="💪" value={workoutsValue}    label="Entrenos"   color={colors.primary.green} loading={isLoadingProgress} />
          <StatBox icon="⚖️" value={kgLostValue}     label="Perdidos"   color={colors.semantic.info} loading={isLoadingProgress} />
        </View>

        {/* Plan activo */}
        <SectionHeader title="Mi plan" />
        <View style={styles.planCard}>
          <PlanRow icon="🏋️" label="Hoy"              value={todayWorkout.name} />
          <Divider />
          <PlanRow icon="⏱"  label="Duración"          value={`${todayWorkout.durationMinutes} min`} />
          <Divider />
          <PlanRow icon="📅" label="Sesiones/semana"   value={sessionsLabel} />
          <Divider />
          <PlanRow icon="🎯" label="Objetivo"           value={goalLabel} />
        </View>

        {/* Mis datos */}
        <SectionHeader title="Mis datos" />
        <View style={styles.planCard}>
          <PlanRow icon="📏" label="Altura"   value={heightLabel} />
          <Divider />
          <PlanRow icon="⚖️" label="Peso"     value={weightLabel} />
          <Divider />
          <PlanRow icon="🎂" label="Edad"     value={ageLabel} />
          <Divider />
          <PlanRow icon="🥗" label="Dieta"    value={dietLabel} />
        </View>

        {/* Configuración */}
        <SectionHeader title="Configuración" />
        <View style={styles.planCard}>
          <ToggleRow icon="🔔" label="Notificaciones" value={notifications} onToggle={() => setNotif((v) => !v)} soon />
          <Divider />
          <ToggleRow icon="🌙" label="Modo oscuro"    value={darkMode}      onToggle={() => setDarkMode((v) => !v)} soon />
          <Divider />
          <SettingRow icon="🔒" label="Privacidad y datos" />
          <Divider />
          <SettingRow icon="❓" label="Ayuda y soporte" />
          <Divider />
          <SettingRow icon="📋" label="Términos y política" />
        </View>

        {/* Versión */}
        <Text style={styles.version}>Healthy v1.0.0</Text>

        {/* Cerrar sesión */}
        <Button
          label="Cerrar sesión"
          variant="destructive"
          onPress={handleLogout}
          style={styles.logoutBtn}
        />

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-componentes ──────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return <Text style={sStyles.header}>{title}</Text>;
}

function StatBox({
  icon, value, label, color, loading,
}: {
  icon: string; value: string; label: string; color: string; loading?: boolean;
}) {
  return (
    <View style={[sStyles.statBox, { borderTopColor: color }]}>
      <Text style={sStyles.statIcon}>{icon}</Text>
      {loading
        ? <ActivityIndicator size="small" color={color} style={{ marginVertical: 2 }} />
        : <Text style={[sStyles.statValue, { color }]}>{value}</Text>
      }
      <Text style={sStyles.statLabel}>{label}</Text>
    </View>
  );
}

function PlanRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={sStyles.row}>
      <Text style={sStyles.rowIcon}>{icon}</Text>
      <Text style={sStyles.rowLabel}>{label}</Text>
      <Text style={sStyles.rowValue}>{value}</Text>
    </View>
  );
}

function ToggleRow({
  icon, label, value, onToggle, soon,
}: {
  icon: string; label: string; value: boolean; onToggle: () => void; soon?: boolean;
}) {
  return (
    <TouchableOpacity style={sStyles.row} onPress={onToggle} activeOpacity={0.7}>
      <Text style={sStyles.rowIcon}>{icon}</Text>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
        <Text style={sStyles.rowLabel}>{label}</Text>
        {soon && <Text style={sStyles.soonBadge}>próximamente</Text>}
      </View>
      <View style={[sStyles.toggle, value && sStyles.toggleOn]}>
        <View style={[sStyles.toggleThumb, value && sStyles.toggleThumbOn]} />
      </View>
    </TouchableOpacity>
  );
}

function SettingRow({ icon, label }: { icon: string; label: string }) {
  return (
    <TouchableOpacity style={sStyles.row} activeOpacity={0.7}>
      <Text style={sStyles.rowIcon}>{icon}</Text>
      <Text style={sStyles.rowLabel}>{label}</Text>
      <Text style={sStyles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: colors.neutral.lightGray, marginHorizontal: -spacing.md }} />;
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.neutral.offWhite },
  scro