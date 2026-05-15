/**
 * ProgressRing — anillo de progreso estilo Apple Watch / Fitness+
 *
 * Requiere: react-native-svg
 * Múltiples anillos concéntricos (actividad, ejercicio, estar de pie)
 * Animación de fill suave al montar o al cambiar progress
 */

import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import colors from '../tokens/colors';

// Carga dinámica de react-native-svg con fallback
let Svg, Circle, Defs, LinearGradient, Stop, AnimatedCircle;

try {
  const rnsvg  = require('react-native-svg');
  Svg          = rnsvg.Svg;
  Circle       = rnsvg.Circle;
  Defs         = rnsvg.Defs;
  LinearGradient = rnsvg.LinearGradient;
  Stop         = rnsvg.Stop;
  AnimatedCircle = Animated.createAnimatedComponent(Circle);
} catch (_) {
  // fallback: solo se muestra el contenido interior
}

const SVG_OK = !!Svg;

// ── ProgressRing ───────────────────────────────────────────────────────────────

/**
 * @param {number}  progress    - 0–1 fracción completada
 * @param {number}  size        - diámetro total en px (default 120)
 * @param {number}  stroke      - grosor del trazo (default 12)
 * @param {string}  color       - color del arco de progreso
 * @param {string}  trackColor  - color de la pista de fondo
 * @param {node}    children    - contenido centrado dentro del anillo
 * @param {boolean} animate     - animar fill al montar
 * @param {string}  gradientEnd - color final del gradiente en el arco
 */
export function ProgressRing({
  progress    = 0,
  size        = 120,
  stroke      = 12,
  color       = colors.primary.green,
  trackColor,
  children,
  animate     = true,
  gradientEnd,
}) {
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const animVal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animate) {
      Animated.timing(animVal, {
        toValue:         clampedProgress,
        duration:        900,
        useNativeDriver: false,
      }).start();
    } else {
      animVal.setValue(clampedProgress);
    }
  }, [clampedProgress]);

  const r         = (size - stroke) / 2;
  const cx        = size / 2;
  const cy        = size / 2;
  const circumf   = 2 * Math.PI * r;
  const track     = trackColor ?? hexWithAlpha(color, 0.12);
  const gradEnd   = gradientEnd ?? lighten(color);

  if (!SVG_OK) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <View style={[styles.fallbackRing, {
          width: size, height: size, borderRadius: size / 2,
          borderWidth: stroke, borderColor: track,
        }]} />
        <View style={styles.inner}>{children}</View>
      </View>
    );
  }

  const dashOffset = animVal.interpolate({
    inputRange:  [0, 1],
    outputRange: [circumf, 0],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={`grad-${color}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%"   stopColor={color}   stopOpacity="1" />
            <Stop offset="100%" stopColor={gradEnd}  stopOpacity="0.85" />
          </LinearGradient>
        </Defs>

        {/* Pista */}
        <Circle
          cx={cx} cy={cy} r={r}
          stroke={track}
          strokeWidth={stroke}
          fill="none"
        />

        {/* Arco de progreso */}
        <AnimatedCircle
          cx={cx} cy={cy} r={r}
          stroke={`url(#grad-${color})`}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumf}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${cx},${cy}`}
        />
      </Svg>

      <View style={styles.inner}>{children}</View>
    </View>
  );
}

// ── ActivityRings ──────────────────────────────────────────────────────────────

/**
 * ActivityRings — tres anillos concéntricos estilo Apple Watch
 * Mueve y anima los tres aros de actividad, ejercicio y estar de pie
 *
 * @param {number} move      - 0–1 calorías quemadas
 * @param {number} exercise  - 0–1 minutos de ejercicio
 * @param {number} stand     - 0–1 horas de pie
 * @param {number} size      - diámetro exterior en px (default 140)
 */
export function ActivityRings({
  move     = 0,
  exercise = 0,
  stand    = 0,
  size     = 140,
}) {
  const GAP    = 10; // separación entre anillos
  const STROKE = 10;

  return (
    <View style={{ width: size, height: size }}>
      <ProgressRing
        size={size}
        stroke={STROKE}
        progress={move}
        color="#EF4444"
        gradientEnd="#F97316"
      />
      <View style={[StyleSheet.absoluteFill, { padding: STROKE + GAP }]}>
        <ProgressRing
          size={size - (STROKE + GAP) * 2}
          stroke={STROKE}
          progress={exercise}
          color="#22C55E"
          gradientEnd="#84CC16"
        />
        <View style={[StyleSheet.absoluteFill, { padding: STROKE + GAP }]}>
          <ProgressRing
            size={size - (STROKE + GAP) * 4}
            stroke={STROKE}
            progress={stand}
            color="#3B82F6"
            gradientEnd="#06B6D4"
          />
        </View>
      </View>
    </View>
  );
}

// ── DailyProgressRing ──────────────────────────────────────────────────────────

/**
 * DailyProgressRing — anillo grande único con label de porcentaje
 * Para el Home: progreso diario de objetivo principal
 */
export function DailyProgressRing({
  progress = 0,
  size     = 180,
  label    = 'Objetivo diario',
  darkMode = false,
}) {
  const pct = Math.round(progress * 100);

  return (
    <ProgressRing
      progress={progress}
      size={size}
      stroke={14}
      color={colors.primary.green}
    >
      <View style={styles.dailyInner}>
        <Text style={[styles.dailyPct, darkMode && styles.dailyPctDark]}>
          {pct}%
        </Text>
        <Text style={styles.dailyLabel}>{label}</Text>
      </View>
    </ProgressRing>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function hexWithAlpha(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function lighten(hex) {
  // Versión más clara del color para el gradiente
  try {
    const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + 40);
    const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + 40);
    const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + 40);
    return `rgb(${r},${g},${b})`;
  } catch { return hex; }
}

// ── Estilos ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    alignItems:     'center',
    justifyContent: 'center',
  },

  inner: {
    ...StyleSheet.absoluteFillObject,
    alignItems:     'center',
    justifyContent: 'center',
  },

  fallbackRing: {
    position: 'absolute',
  },

  dailyInner: {
    alignItems: 'center',
  },

  dailyPct: {
    fontSize:      36,
    fontWeight:    '700',
    color:         colors.neutral.darkGray,
    letterSpacing: -1,
  },

  dailyPctDark: {
    color: colors.dark.textPrimary,
  },

  dailyLabel: {
    fontSize:  12,
    fontWeight: '500',
    color:     colors.neutral.midGray,
    marginTop:  2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default ProgressRing;
