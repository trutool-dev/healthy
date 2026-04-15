/**
 * OnboardingLayout — contenedor compartido por todos los pasos del onboarding
 * Incluye barra de progreso, botón de retroceso, título y CTA inferior
 */

import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button }      from '@/components/ui/Button';
import { colors }      from '@/theme/colors';
import { textStyles }  from '@/theme/typography';
import { spacing }     from '@/theme/spacing';

// Pasos con progreso visible (excluye Welcome y Complete)
export const TOTAL_STEPS = 7;

interface OnboardingLayoutProps {
  step:           number;           // 1-7
  title:          string;
  subtitle?:      string;
  onBack:         () => void;
  onContinue:     () => void;
  continueLabel?: string;
  canContinue?:   boolean;
  loading?:       boolean;
  children:       React.ReactNode;
  scrollable?:    boolean;
  contentStyle?:  ViewStyle;
}

export function OnboardingLayout({
  step,
  title,
  subtitle,
  onBack,
  onContinue,
  continueLabel = 'Continuar',
  canContinue   = true,
  loading       = false,
  children,
  scrollable    = true,
  contentStyle,
}: OnboardingLayoutProps) {
  const inner = (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} accessibilityLabel="Volver">
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <ProgressBar current={step} total={TOTAL_STEPS} style={styles.progress} />
      </View>

      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      <View style={[styles.content, contentStyle]}>{children}</View>
    </>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {scrollable ? (
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {inner}
          </ScrollView>
        ) : (
          <View style={[styles.scroll, styles.flex]}>{inner}</View>
        )}

        {/* CTA fijo en la parte inferior */}
        <View style={styles.footer}>
          <Button
            label={continueLabel}
            variant="primary"
            disabled={!canContinue}
            loading={loading}
            onPress={onContinue}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.neutral.white },
  flex:   { flex: 1 },
  scroll: {
    flexGrow:          1,
    paddingHorizontal: spacing.lg,
    paddingTop:        spacing.md,
    paddingBottom:     spacing.md,
  },
  header: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            spacing.md,
    marginBottom:   spacing.xl,
  },
  backBtn: {
    width:  36,
    height: 36,
    alignItems:     'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 22,
    color:    colors.neutral.darkGray,
  },
  progress: {
    flex: 1,
  },
  title: {
    ...textStyles.titleMedium,
    color:        colors.neutral.black,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...textStyles.bodyNormal,
    color:        colors.neutral.midGray,
    marginBottom: spacing.lg,
    lineHeight:   22,
  },
  content: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom:     spacing.lg,
    paddingTop:        spacing.sm,
    backgroundColor:   colors.neutral.white,
    borderTopWidth:    StyleSheet.hairlineWidth,
    borderTopColor:    colors.neutral.lightGray,
  },
});
