/**
 * ProfileScreen — datos del usuario, resumen del plan y configuración
 */

import React, { useState } from 'react';
import {
  Alert, SafeAreaView, ScrollView, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import { useAuthStore }   from '@/stores/authStore';
import { usePlanStore }   from '@/stores/planStore';
import { Button }         from '@/components/ui/Button';
import { colors }         from '@/theme/colors';
import { textStyles }     from '@/theme/typography';
import { spacing, borderRadius, shadows } from '@/theme/spacing';

export function ProfileScreen() {
  const { user, clearAuth }            = useAuthStore();
  const { todayWorkout, streak }       = usePlanStore();
  const [notifications, setNotif]      = useState(true);
  const [darkMode, setDarkMode]        = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Seguro que quieres salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salir',    style: 'destructive', onPress: () => clearAuth() },
      ],
    );
  };

  const initials = (user?.name ?? user?.email ?? 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

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
          <StatBox icon="🔥" value={`${streak}`}  label="Días racha" color="#F59E0B" />
          <StatBox icon="💪" value="12"            label="Entrenos"   color={colors.primary.green} />
          <StatBox icon="⚖️" value="−2.6 kg"      label="Perdidos"   color={colors.semantic.info} />
        </View>

        {/* Plan activo */}
        <SectionHeader title="Mi plan" />
        <View style={styles.planCard}>
          <PlanRow icon="🏋️" label="Hoy"           value={todayWorkout.name} />
          <Divider />
          <PlanRow icon="⏱"  label="Duración"      value={`${todayWorkout.durationMinutes} min`} />
          <Divider />
          <PlanRow icon="📅" label="Sesiones/semana" value="4 días" />
          <Divider />
          <PlanRow icon="🎯" label="Objetivo"        value="Ganar músculo" />
        </View>

        {/* Mis datos */}
        <SectionHeader title="Mis datos" />
        <View style={styles.planCard}>
          <PlanRow icon="📏" label="Altura"   value="178 cm" />
          <Divider />
          <PlanRow icon="⚖️" label="Peso"     value="79.9 kg" />
          <Divider />
          <PlanRow icon="🎂" label="Edad"     value="28 años" />
          <Divider />
          <PlanRow icon="🥗" label="Dieta"    value="Omnívoro" />
        </View>

        {/* Configuración */}
        <SectionHeader title="Configuración" />
        <View style={styles.planCard}>
          <ToggleRow icon="🔔" label="Notificaciones"   value={notifications} onToggle={() => setNotif((v) => !v)} />
          <Divider />
          <ToggleRow icon="🌙" label="Modo oscuro"       value={darkMode}      onToggle={() => setDarkMode((v) => !v)} />
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

function StatBox({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) {
  return (
    <View style={[sStyles.statBox, { borderTopColor: color }]}>
      <Text style={sStyles.statIcon}>{icon}</Text>
      <Text style={[sStyles.statValue, { color }]}>{value}</Text>
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

function ToggleRow({ icon, label, value, onToggle }: { icon: string; label: string; value: boolean; onToggle: () => void }) {
  return (
    <TouchableOpacity style={sStyles.row} onPress={onToggle} activeOpacity={0.7}>
      <Text style={sStyles.rowIcon}>{icon}</Text>
      <Text style={sStyles.rowLabel}>{label}</Text>
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
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },

  hero: { alignItems: 'center', marginBottom: spacing.xl },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primary.green,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.button,
  },
  avatarText: { ...textStyles.titleMedium, color: colors.neutral.white },
  name:       { ...textStyles.titleSmall, color: colors.neutral.black },
  email:      { ...textStyles.bodyNormal, color: colors.neutral.midGray, marginTop: 4 },
  planBadge: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary.lightGreen,
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
  },
  planBadgeText: { ...textStyles.caption, color: colors.primary.darkGreen, fontWeight: '700' },

  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  planCard: {
    backgroundColor: colors.neutral.white, borderRadius: borderRadius.card,
    padding: spacing.md, ...shadows.card, marginBottom: spacing.sm, gap: spacing.sm,
  },
  version: { ...textStyles.caption, color: colors.neutral.midGray, textAlign: 'center', marginVertical: spacing.lg },
  logoutBtn: { marginBottom: spacing.md },
});

const sStyles = StyleSheet.create({
  header: { ...textStyles.label, color: colors.neutral.midGray, marginTop: spacing.md, marginBottom: spacing.sm },

  statBox: {
    flex: 1, backgroundColor: colors.neutral.white, borderRadius: borderRadius.card,
    padding: spacing.md, alignItems: 'center', gap: 4,
    borderTopWidth: 3, ...shadows.card,
  },
  statIcon:  { fontSize: 22 },
  statValue: { ...textStyles.titleSmall, fontWeight: '700' },
  statLabel: { ...textStyles.caption, color: colors.neutral.midGray, textAlign: 'center' },

  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xs },
  rowIcon:  { fontSize: 18, width: 28, textAlign: 'center' },
  rowLabel: { ...textStyles.bodyNormal, color: colors.neutral.darkGray, flex: 1 },
  rowValue: { ...textStyles.bodyNormal, color: colors.neutral.midGray, fontWeight: '600' },
  chevron:  { fontSize: 22, color: colors.neutral.midGray },

  toggle: {
    width: 44, height: 26, borderRadius: 13,
    backgroundColor: colors.neutral.lightGray,
    justifyContent: 'center', padding: 2,
  },
  toggleOn: { backgroundColor: colors.primary.green },
  toggleThumb: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.neutral.white,
    ...shadows.card,
  },
  toggleThumbOn: { alignSelf: 'flex-end' },
});

export default ProfileScreen;
