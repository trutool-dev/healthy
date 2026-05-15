/**
 * WorkoutCard — tarjeta de entrenamiento estilo Apple Fitness+
 * Imagen a sangre, overlay degradado, tipo + duración, estado de progreso
 * Variantes: featured (grande), compact (lista), inProgress (sesión activa)
 */

import React, { useRef } from 'react';
import {
  Animated,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import colors   from '../tokens/colors';
import { borderRadius, spacing, duration, pressedScale, shadows } from '../tokens/spacing';

// ── WorkoutCard ────────────────────────────────────────────────────────────────

/**
 * @param {string}  title         - Nombre del entrenamiento
 * @param {string}  type          - Tipo: "HIIT", "Fuerza", "Yoga"...
 * @param {number}  durationMin   - Duración en minutos
 * @param {string}  trainer       - Nombre del entrenador/plan
 * @param {string}  imageSource   - require() o { uri: '...' }
 * @param {string}  variant       - 'featured' | 'compact' | 'inProgress'
 * @param {number}  progress      - 0–1 si está en progreso
 * @param {boolean} completed     - Marcar como completado
 * @param {string}  calsBurned    - Calorías si completado
 * @param {function} onPress      - Callback al pulsar
 * @param {object}  style         - Estilos adicionales
 */
export function WorkoutCard({
  title       = 'Entrenamiento',
  type        = 'Fuerza',
  durationMin = 45,
  trainer,
  imageSource,
  variant     = 'featured',
  progress,
  completed   = false,
  calsBurned,
  onPress,
  style,
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => Animated.timing(scaleAnim, {
    toValue: pressedScale, duration: duration.fast, useNativeDriver: true,
  }).start();

  const handlePressOut = () => Animated.timing(scaleAnim, {
    toValue: 1, duration: duration.fast, useNativeDriver: true,
  }).start();

  const isCompact    = variant === 'compact';
  const isInProgress = variant === 'inProgress';
  const cardH        = isCompact ? 100 : isInProgress ? 160 : 220;

  const inner = (
    <View style={[styles.card, { height: cardH }, styles[variant], style]}>

      {/* Imagen de fondo */}
      {imageSource ? (
        <ImageBackground
          source={imageSource}
          style={StyleSheet.absoluteFill}
          imageStyle={{ borderRadius: borderRadius.card }}
        >
          <View style={styles.overlay} />
        </ImageBackground>
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.placeholderBg]} />
      )}

      {/* Badge de tipo */}
      <View style={styles.typeBadge}>
        <Text style={styles.typeText}>{type.toUpperCase()}</Text>
      </View>

      {/* Badge completado */}
      {completed && (
        <View style={styles.completedBadge}>
          <Text style={styles.completedText}>✓</Text>
        </View>
      )}

      {/* Contenido inferior */}
      <View style={[styles.bottom, isCompact && styles.bottomCompact]}>
        <Text style={[styles.title, isCompact && styles.titleCompact]} numberOfLines={2}>
          {title}
        </Text>

        <View style={styles.meta}>
          <Text style={styles.metaDuration}>
            {durationMin} min
          </Text>

          {trainer && !isCompact && (
            <>
              <Text style={styles.metaDot}> · </Text>
              <Text style={styles.metaTrainer}>{trainer}</Text>
            </>
          )}

          {calsBurned && (
            <>
              <Text style={styles.metaDot}> · </Text>
              <Text style={[styles.metaTrainer, { color: colors.semantic.warning }]}>
                {calsBurned} kcal
              </Text>
            </>
          )}
        </View>

        {/* Barra de progreso en sesión activa */}
        {isInProgress && progress !== undefined && (
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        )}
      </View>
    </View>
  );

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${type}, ${durationMin} minutos`}
      >
        {inner}
      </Pressable>
    </Animated.View>
  );
}

// ── ExerciseRow ────────────────────────────────────────────────────────────────

/**
 * ExerciseRow — fila de ejercicio dentro de una sesión activa
 * Check al completar con animación. Muestra sets × reps o tiempo.
 *
 * @param {string}  name       - Nombre del ejercicio
 * @param {string}  detail     - "4 × 12 reps" o "45 seg"
 * @param {boolean} completed  - Completado
 * @param {boolean} active     - En curso (resaltado)
 * @param {function} onToggle  - Toggle completado
 */
export function ExerciseRow({ name, detail, completed = false, active = false, onToggle }) {
  const checkAnim = useRef(new Animated.Value(completed ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    const next = !completed;

    Animated.parallel([
      Animated.timing(checkAnim, {
        toValue:  next ? 1 : 0,
        duration: 220,
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 0.92, duration: 80, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1,    duration: 150, useNativeDriver: true }),
      ]),
    ]).start();

    onToggle?.();
  };

  const checkBg = checkAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['rgba(34,197,94,0)', colors.primary.green],
  });

  const checkOpacity = checkAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View style={[exStyles.row, active && exStyles.rowActive, { transform: [{ scale: scaleAnim }] }]}>
      {/* Check circle */}
      <Pressable onPress={handlePress} style={exStyles.checkWrap} accessibilityRole="checkbox">
        <Animated.View style={[exStyles.check, { backgroundColor: checkBg, borderColor: completed ? colors.primary.green : colors.neutral.lightGray }]}>
          <Animated.Text style={[exStyles.checkMark, { opacity: checkOpacity }]}>✓</Animated.Text>
        </Animated.View>
      </Pressable>

      {/* Info */}
      <View style={exStyles.info}>
        <Text style={[exStyles.name, completed && exStyles.nameCompleted]} numberOfLines={1}>
          {name}
        </Text>
        <Text style={exStyles.detail}>{detail}</Text>
      </View>

      {/* Indicador activo */}
      {active && <View style={exStyles.activeDot} />}
    </Animated.View>
  );
}

// ── RestTimer ──────────────────────────────────────────────────────────────────

/**
 * RestTimer — temporizador de descanso entre series
 * Anillo de cuenta atrás con segundos visibles
 *
 * @param {number}  totalSeconds  - Duración del descanso
 * @param {number}  remaining     - Segundos restantes (controlado externamente)
 * @param {function} onComplete   - Callback al terminar
 */
export function RestTimer({ totalSeconds = 90, remaining = 90, onComplete }) {
  const progress = remaining / totalSeconds;
  const mins     = Math.floor(remaining / 60);
  const secs     = remaining % 60;

  return (
    <View style={timerStyles.container}>
      <View style={timerStyles.ring}>
        {/* Pista */}
        <View style={[timerStyles.ringTrack, { borderColor: colors.dark.border }]} />

        {/* Label */}
        <View style={timerStyles.ringInner}>
          <Text style={timerStyles.label}>DESCANSO</Text>
          <Text style={timerStyles.time}>
            {mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : `${secs}s`}
          </Text>
          <Pressable
            onPress={onComplete}
            style={timerStyles.skipBtn}
            accessibilityLabel="Saltar descanso"
          >
            <Text style={timerStyles.skipText}>Saltar</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ── WorkoutSummary ─────────────────────────────────────────────────────────────

/**
 * WorkoutSummary — card de resumen al finalizar una sesión
 *
 * @param {number}  duration     - Minutos totales
 * @param {number}  calories     - Calorías quemadas
 * @param {number}  exercises    - Ejercicios completados
 * @param {number}  sets         - Series completadas
 * @param {string}  workoutName  - Nombre del entrenamiento
 */
export function WorkoutSummary({ duration = 0, calories = 0, exercises = 0, sets = 0, workoutName }) {
  const stats = [
    { label: 'DURACIÓN',   value: `${duration}`, unit: 'min' },
    { label: 'CALORÍAS',   value: `${calories}`,  unit: 'kcal' },
    { label: 'EJERCICIOS', value: `${exercises}`, unit: '' },
    { label: 'SERIES',     value: `${sets}`,      unit: '' },
  ];

  return (
    <View style={summaryStyles.card}>
      <Text style={summaryStyles.congrats}>¡Sesión completada!</Text>
      {workoutName && (
        <Text style={summaryStyles.name}>{workoutName}</Text>
      )}

      <View style={summaryStyles.statsGrid}>
        {stats.map((s, i) => (
          <View key={i} style={summaryStyles.stat}>
            <Text style={summaryStyles.statVal}>{s.value}</Text>
            {s.unit ? <Text style={summaryStyles.statUnit}>{s.unit}</Text> : null}
            <Text style={summaryStyles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Estilos ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    borderRadius:  borderRadius.card,
    overflow:      'hidden',
    marginBottom:  12,
    justifyContent: 'flex-end',
    ...shadows.card,
  },

  featured:   {},
  compact:    {},
  inProgress: {},

  placeholderBg: {
    backgroundColor: '#1C2A1E',
    borderRadius:    borderRadius.card,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.85) 100%)',
    // Para React Native usamos LinearGradient de expo-linear-gradient:
    // <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={StyleSheet.absoluteFill} />
  },

  typeBadge: {
    position:        'absolute',
    top:             spacing.md,
    left:            spacing.md,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius:    borderRadius.pill,
    paddingHorizontal: 10,
    paddingVertical:   4,
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.20)',
  },

  typeText: {
    fontSize:      10,
    fontWeight:    '700',
    color:         '#FFFFFF',
    letterSpacing: 1.2,
  },

  completedBadge: {
    position:        'absolute',
    top:             spacing.md,
    right:           spacing.md,
    width:           28,
    height:          28,
    borderRadius:    14,
    backgroundColor: colors.primary.green,
    alignItems:      'center',
    justifyContent:  'center',
  },

  completedText: {
    fontSize:   13,
    fontWeight: '700',
    color:      '#FFFFFF',
  },

  bottom: {
    padding: spacing.md,
  },

  bottomCompact: {
    padding:     spacing.sm,
    paddingLeft: spacing.md,
  },

  title: {
    fontSize:      20,
    fontWeight:    '700',
    color:         '#FFFFFF',
    letterSpacing: -0.5,
    lineHeight:    24,
    marginBottom:   4,
  },

  titleCompact: {
    fontSize: 15,
    lineHeight: 18,
  },

  meta: {
    flexDirection: 'row',
    alignItems:    'center',
  },

  metaDuration: {
    fontSize:   13,
    fontWeight: '600',
    color:      'rgba(255,255,255,0.75)',
  },

  metaDot: {
    fontSize: 13,
    color:    'rgba(255,255,255,0.40)',
  },

  metaTrainer: {
    fontSize: 13,
    color:    'rgba(255,255,255,0.60)',
  },

  progressTrack: {
    height:          3,
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderRadius:    2,
    marginTop:       12,
    overflow:        'hidden',
  },

  progressFill: {
    height:          '100%',
    backgroundColor: colors.primary.green,
    borderRadius:    2,
  },
});

const exStyles = StyleSheet.create({
  row: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral.lightGray,
  },

  rowActive: {
    backgroundColor: colors.primary.lightGreen,
  },

  checkWrap: {
    marginRight: spacing.md,
  },

  check: {
    width:        28,
    height:       28,
    borderRadius: 14,
    borderWidth:  2,
    alignItems:   'center',
    justifyContent: 'center',
  },

  checkMark: {
    fontSize:   14,
    fontWeight: '700',
    color:      '#FFFFFF',
  },

  info: {
    flex: 1,
  },

  name: {
    fontSize:   15,
    fontWeight: '600',
    color:      colors.neutral.darkGray,
    marginBottom: 2,
  },

  nameCompleted: {
    opacity:           0.45,
    textDecorationLine: 'line-through',
  },

  detail: {
    fontSize: 13,
    color:    colors.neutral.midGray,
  },

  activeDot: {
    width:           8,
    height:          8,
    borderRadius:    4,
    backgroundColor: colors.primary.green,
    marginLeft:      spacing.sm,
  },
});

const timerStyles = StyleSheet.create({
  container: {
    alignItems:     'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },

  ring: {
    width:         160,
    height:        160,
    alignItems:    'center',
    justifyContent: 'center',
  },

  ringTrack: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 80,
    borderWidth:  8,
  },

  ringInner: {
    alignItems: 'center',
  },

  label: {
    fontSize:      10,
    fontWeight:    '600',
    color:         colors.neutral.midGray,
    letterSpacing: 1.4,
    marginBottom:  4,
  },

  time: {
    fontSize:      48,
    fontWeight:    '700',
    color:         colors.neutral.darkGray,
    letterSpacing: -2,
  },

  skipBtn: {
    marginTop:     12,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius:  borderRadius.pill,
    borderWidth:   1,
    borderColor:   colors.primary.green,
  },

  skipText: {
    fontSize:   13,
    fontWeight: '600',
    color:      colors.primary.green,
  },
});

const summaryStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral.white,
    borderRadius:    borderRadius.card,
    padding:         spacing.xl,
    alignItems:      'center',
    ...shadows.modal,
  },

  congrats: {
    fontSize:      24,
    fontWeight:    '700',
    color:         colors.primary.green,
    letterSpacing: -0.5,
    marginBottom:   4,
  },

  name: {
    fontSize:      16,
    color:         colors.neutral.midGray,
    marginBottom:  spacing.xl,
  },

  statsGrid: {
    flexDirection:  'row',
    width:          '100%',
    justifyContent: 'space-around',
  },

  stat: {
    alignItems: 'center',
  },

  statVal: {
    fontSize:      28,
    fontWeight:    '700',
    color:         colors.neutral.darkGray,
    letterSpacing: -1,
  },

  statUnit: {
    fontSize:   12,
    color:      colors.neutral.midGray,
    marginTop:  -2,
  },

  statLabel: {
    fontSize:      10,
    fontWeight:    '600',
    color:         colors.neutral.midGray,
    letterSpacing: 1.0,
    marginTop:     6,
  },
});

export default WorkoutCard;
