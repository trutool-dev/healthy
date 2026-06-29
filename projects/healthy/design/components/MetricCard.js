/**
 * MetricCard — tarjeta de métrica estilo Whoop
 * Fondo oscuro, valor prominente, tendencia, mini-sparkline opcional
 * Diseñada para dashboards de salud y progreso
 */

import React, { useRef, useEffect } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import colors   from '../tokens/colors';
import { borderRadius, shadows, spacing, duration } from '../tokens/spacing';

// ── MetricCard principal ───────────────────────────────────────────────────────

/**
 * @param {string}  label       - Nombre de la métrica (HRV, Recovery, etc.)
 * @param {string}  value       - Valor principal a mostrar ("78", "83%")
 * @param {string}  unit        - Unidad pequeña a la derecha del valor ("ms", "bpm")
 * @param {number}  trend       - Cambio respecto al periodo anterior (+12, -3)
 * @param {string}  trendLabel  - Etiqueta del trend ("vs ayer")
 * @param {string}  accentColor - Color de acento (usa paleta whoop por defecto)
 * @param {string}  icon        - Símbolo unicode para el icono ("♥", "💤", etc.)
 * @param {Array}   sparkData   - Array de 0–1 para mini gráfica de barras
 * @param {string}  subtext     - Texto secundario bajo el valor
 * @param {function} onPress    - Callback si la card es interactiva
 * @param {object}  style       - Estilos adicionales
 */
export function MetricCard({
  label       = '',
  value       = '—',
  unit        = '',
  trend,
  trendLabel  = 'vs ayer',
  accentColor = colors.whoop.recovery,
  icon,
  sparkData,
  subtext,
  onPress,
  style,
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => Animated.timing(scaleAnim, {
    toValue: 0.97, duration: duration.fast, useNativeDriver: true,
  }).start();

  const handlePressOut = () => Animated.timing(scaleAnim, {
    toValue: 1, duration: duration.fast, useNativeDriver: true,
  }).start();

  const hasTrend    = trend !== undefined && trend !== null;
  const trendUp     = hasTrend && trend >= 0;
  const trendColor  = trendUp ? colors.whoop.recovery : colors.whoop.recoveryLow;
  const trendSymbol = trendUp ? '↑' : '↓';

  const content = (
    <View style={styles.inner}>
      {/* Header: label + icono */}
      <View style={styles.header}>
        <Text style={styles.label}>{label.toUpperCase()}</Text>
        {icon && (
          <View style={[styles.iconBadge, { backgroundColor: hexAlpha(accentColor, 0.15) }]}>
            <Text style={[styles.iconText, { color: accentColor }]}>{icon}</Text>
          </View>
        )}
      </View>

      {/* Valor principal */}
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {unit ? <Text style={[styles.unit, { color: accentColor }]}>{unit}</Text> : null}
      </View>

      {/* Subtext opcional */}
      {subtext ? <Text style={styles.subtext}>{subtext}</Text> : null}

      {/* Trend */}
      {hasTrend && (
        <View style={styles.trendRow}>
          <Text style={[styles.trendSymbol, { color: trendColor }]}>{trendSymbol}</Text>
          <Text style={[styles.trendValue, { color: trendColor }]}>
            {Math.abs(trend)}
          </Text>
          <Text style={styles.trendLabel}> {trendLabel}</Text>
        </View>
      )}

      {/* Sparkline */}
      {sparkData && sparkData.length > 0 && (
        <Sparkline data={sparkData} color={accentColor} />
      )}
    </View>
  );

  if (onPress) {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
        <Pressable
          style={styles.card}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          accessibilityRole="button"
          accessibilityLabel={`${label}: ${value}${unit}`}
        >
          {content}
        </Pressable>
      </Animated.View>
    );
  }

  return <View style={[styles.card, style]}>{content}</View>;
}

// ── RecoveryScore ──────────────────────────────────────────────────────────────

/**
 * RecoveryScore — card de recuperación Whoop estilo protagonista
 * Número grande con color semántico según el porcentaje
 *
 * @param {number}  score     - 0–100
 * @param {string}  message   - Mensaje de estado ("Listo para entrenar")
 * @param {number}  hrv       - Variabilidad de frecuencia cardíaca (ms)
 * @param {number}  restingHr - FC en reposo (bpm)
 */
export function RecoveryScore({ score = 0, message, hrv, restingHr }) {
  const scoreAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(scoreAnim, {
      toValue:  score,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [score]);

  const accentColor = score >= 67
    ? colors.whoop.recovery
    : score >= 34
      ? colors.whoop.recoveryMid
      : colors.whoop.recoveryLow;

  return (
    <View style={[styles.recoveryCard, { borderColor: hexAlpha(accentColor, 0.30) }]}>
      {/* Label */}
      <Text style={styles.recoveryLabel}>RECUPERACIÓN</Text>

      {/* Score */}
      <AnimatedNumber
        value={score}
        style={[styles.recoveryScore, { color: accentColor }]}
        suffix="%"
      />

      {/* Mensaje */}
      {message && <Text style={styles.recoveryMsg}>{message}</Text>}

      {/* Sub-métricas */}
      {(hrv || restingHr) && (
        <View style={styles.recoveryMeta}>
          {hrv ? (
            <View style={styles.recoveryMetaItem}>
              <Text style={styles.recoveryMetaVal}>{hrv} ms</Text>
              <Text style={styles.recoveryMetaLabel}>HRV</Text>
            </View>
          ) : null}
          {hrv && restingHr ? <View style={styles.recoveryDivider} /> : null}
          {restingHr ? (
            <View style={styles.recoveryMetaItem}>
              <Text style={styles.recoveryMetaVal}>{restingHr} bpm</Text>
              <Text style={styles.recoveryMetaLabel}>FC REPOSO</Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

// ── MetricGrid ─────────────────────────────────────────────────────────────────

/**
 * MetricGrid — cuadrícula 2×N de MetricCards
 * Uso: <MetricGrid metrics={[...]} />
 *
 * Cada métrica: { label, value, unit, trend, accentColor, icon, sparkData }
 */
export function MetricGrid({ metrics = [], style }) {
  return (
    <View style={[gridStyles.grid, style]}>
      {metrics.map((m, i) => (
        <View key={i} style={gridStyles.cell}>
          <MetricCard {...m} />
        </View>
      ))}
    </View>
  );
}

// ── Sparkline ──────────────────────────────────────────────────────────────────

function Sparkline({ data = [], color = colors.primary.green, height = 32 }) {
  const MAX_BARS = 14;
  const bars = data.slice(-MAX_BARS);

  return (
    <View style={[sparkStyles.container, { height }]}>
      {bars.map((val, i) => (
        <View
          key={i}
          style={[
            sparkStyles.bar,
            {
              height:          `${Math.max(4, Math.round(val * 100))}%`,
              backgroundColor: hexAlpha(color, 0.20 + val * 0.65),
              borderRadius:    2,
            },
          ]}
        />
      ))}
    </View>
  );
}

// ── AnimatedNumber ─────────────────────────────────────────────────────────────

function AnimatedNumber({ value, style, suffix = '' }) {
  const anim    = useRef(new Animated.Value(0)).current;
  const display = useRef(0);

  useEffect(() => {
    Animated.timing(anim, {
      toValue:  value,
      duration: 1000,
      useNativeDriver: false,
    }).start();
    anim.addListener(({ value: v }) => { display.current = Math.round(v); });
    return () => anim.removeAllListeners();
  }, [value]);

  // Mostramos el valor final directamente (sin re-render tick por tick)
  return <Text style={style}>{value}{suffix}</Text>;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function hexAlpha(hex, alpha) {
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  } catch { return hex; }
}

// ── Estilos ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.whoop.card,
    borderRadius:    borderRadius.card,
    borderWidth:     1,
    borderColor:     colors.whoop.cardBorder,
    marginBottom:    12,
    overflow:        'hidden',
  },

  inner: {
    padding: 18,
  },

  header: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    marginBottom:    10,
  },

  label: {
    fontSize:      10,
    fontWeight:    '600',
    color:         colors.whoop.textLabel,
    letterSpacing: 1.2,
  },

  iconBadge: {
    width:        28,
    height:       28,
    borderRadius: 8,
    alignItems:   'center',
    justifyContent: 'center',
  },

  iconText: {
    fontSize: 14,
  },

  valueRow: {
    flexDirection: 'row',
    alignItems:    'flex-end',
    marginBottom:  4,
  },

  value: {
    fontSize:      40,
    fontWeight:    '700',
    color:         colors.whoop.textVal,
    letterSpacing: -1.5,
    lineHeight:    44,
  },

  unit: {
    fontSize:     16,
    fontWeight:   '600',
    marginLeft:   4,
    marginBottom: 6,
  },

  subtext: {
    fontSize:  12,
    color:     colors.whoop.textLabel,
    marginBottom: 8,
  },

  trendRow: {
    flexDirection: 'row',
    alignItems:    'center',
    marginTop:     6,
  },

  trendSymbol: {
    fontSize:   13,
    fontWeight: '700',
    marginRight: 2,
  },

  trendValue: {
    fontSize:   13,
    fontWeight: '600',
  },

  trendLabel: {
    fontSize: 12,
    color:    colors.whoop.textLabel,
  },

  // Recovery card
  recoveryCard: {
    backgroundColor: colors.whoop.card,
    borderRadius:    borderRadius.card,
    borderWidth:     1.5,
    padding:         24,
    marginBottom:    12,
    alignItems:      'center',
  },

  recoveryLabel: {
    fontSize:      10,
    fontWeight:    '600',
    color:         colors.whoop.textLabel,
    letterSpacing: 1.4,
    marginBottom:  12,
  },

  recoveryScore: {
    fontSize:      72,
    fontWeight:    '800',
    letterSpacing: -3,
    lineHeight:    76,
  },

  recoveryMsg: {
    fontSize:      14,
    fontWeight:    '500',
    color:         colors.whoop.textVal,
    opacity:       0.75,
    marginTop:     8,
    textAlign:     'center',
  },

  recoveryMeta: {
    flexDirection:  'row',
    alignItems:     'center',
    marginTop:      20,
    width:          '100%',
    justifyContent: 'center',
  },

  recoveryMetaItem: {
    alignItems: 'center',
    flex:        1,
  },

  recoveryMetaVal: {
    fontSize:      18,
    fontWeight:    '700',
    color:         colors.whoop.textVal,
    letterSpacing: -0.5,
  },

  recoveryMetaLabel: {
    fontSize:      10,
    fontWeight:    '600',
    color:         colors.whoop.textLabel,
    letterSpacing: 1.2,
    marginTop:     3,
  },

  recoveryDivider: {
    width:  1,
    height: 32,
    backgroundColor: colors.whoop.graphLine,
    marginHorizontal: 12,
  },
});

const gridStyles = StyleSheet.create({
  grid: {
    flexDirection:  'row',
    flexWrap:       'wrap',
    marginHorizontal: -6,
  },

  cell: {
    width:          '50%',
    paddingHorizontal: 6,
  },
});

const sparkStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems:    'flex-end',
    marginTop:     12,
    gap:           3,
  },

  bar: {
    flex: 1,
    minHeight: 4,
  },
});

export default MetricCard;
