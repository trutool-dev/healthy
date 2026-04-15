/**
 * Componente Card del sistema de diseño Healthy
 * Variantes: default, elevated, pressable, highlight
 * Fondo blanco, sombra suave estilo Apple, sin bordes visibles
 */

import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import colors from '../tokens/colors';
import { borderRadius, shadows, spacing, duration, pressedScale } from '../tokens/spacing';

/**
 * Card
 *
 * @param {node}     children   - Contenido interior de la card
 * @param {string}   variant    - 'default' | 'elevated' | 'pressable' | 'highlight'
 * @param {function} onPress    - Si se pasa, la card es pulsable (sobreescribe variant pressable)
 * @param {object}   style      - Estilos adicionales para el contenedor
 * @param {object}   contentStyle - Estilos adicionales para el padding interior
 * @param {boolean}  noPadding  - Elimina el padding interior (útil para imágenes a sangre)
 */
export function Card({
  children,
  variant      = 'default',
  onPress,
  style,
  contentStyle,
  noPadding    = false,
}) {
  const scaleAnim  = useRef(new Animated.Value(1)).current;
  const isPressable = onPress || variant === 'pressable';

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue:         pressedScale,
      duration:        duration.fast,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue:         1,
      duration:        duration.fast,
      useNativeDriver: true,
    }).start();
  };

  const cardStyles = [
    styles.base,
    styles[variant] || styles.default,
    style,
  ];

  const innerStyles = [
    !noPadding && styles.padding,
    contentStyle,
  ];

  if (isPressable) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={cardStyles}
          accessibilityRole="button"
        >
          <View style={innerStyles}>
            {children}
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <View style={cardStyles}>
      <View style={innerStyles}>
        {children}
      </View>
    </View>
  );
}

/**
 * CardRow — layout horizontal con alineación centrada
 * Útil para filas de métricas dentro de una Card
 */
export function CardRow({ children, style }) {
  return (
    <View style={[rowStyles.row, style]}>
      {children}
    </View>
  );
}

/**
 * CardDivider — separador horizontal entre secciones de una Card
 */
export function CardDivider({ style }) {
  return <View style={[dividerStyles.line, style]} />;
}

// ── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  base: {
    borderRadius:    borderRadius.card,
    backgroundColor: colors.neutral.white,
    marginBottom:    12, // separación estándar entre cards
    overflow:        'hidden',
  },

  padding: {
    padding: 20, // padding interno estándar
  },

  // Sin sombra extra, solo la del sistema base
  default: {
    ...shadows.card,
  },

  // Sombra más pronunciada, útil para modales o cards en primer plano
  elevated: {
    ...shadows.modal,
  },

  // Igual que default — la interactividad la añade la lógica isPressable
  pressable: {
    ...shadows.card,
  },

  // Card con borde verde sutil para destacar contenido activo o seleccionado
  highlight: {
    ...shadows.card,
    borderWidth:  1.5,
    borderColor:  colors.primary.green,
    backgroundColor: colors.primary.lightGreen,
  },
});

const rowStyles = StyleSheet.create({
  row: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
});

const dividerStyles = StyleSheet.create({
  line: {
    height:          1,
    backgroundColor: colors.neutral.lightGray,
    marginVertical:  spacing.md,
    marginHorizontal: -20, // sale del padding de la card para ir a sangre
  },
});

export default Card;
