/**
 * Tokens de tipografía del sistema de diseño Healthy
 */

export const fontFamily = {
  ios:     'SF Pro Display',
  android: 'Roboto',
};

export const fontSize = {
  titleLarge:  32,
  titleMedium: 24,
  titleSmall:  18,
  bodyLarge:   16,
  bodyNormal:  14,
  caption:     12,
  label:       12,
} as const;

export const fontWeight = {
  regular:  '400' as const,
  medium:   '500' as const,
  semibold: '600' as const,
  bold:     '700' as const,
};

export const lineHeight = {
  titleLarge:  1.2,
  titleMedium: 1.2,
  titleSmall:  1.3,
  bodyLarge:   1.6,
  bodyNormal:  1.5,
  caption:     1.4,
  label:       1.4,
} as const;

export const letterSpacing = {
  titleLarge:  -0.5,
  titleMedium: -0.3,
  titleSmall:  -0.2,
  bodyLarge:    0,
  bodyNormal:   0,
  caption:      0,
  label:        0.5,
} as const;

// Estilos de texto predefinidos listos para usar en componentes
export const textStyles = {
  titleLarge: {
    fontSize:      fontSize.titleLarge,
    fontWeight:    fontWeight.bold,
    letterSpacing: letterSpacing.titleLarge,
    lineHeight:    fontSize.titleLarge * lineHeight.titleLarge,
  },
  titleMedium: {
    fontSize:      fontSize.titleMedium,
    fontWeight:    fontWeight.semibold,
    letterSpacing: letterSpacing.titleMedium,
    lineHeight:    fontSize.titleMedium * lineHeight.titleMedium,
  },
  titleSmall: {
    fontSize:      fontSize.titleSmall,
    fontWeight:    fontWeight.semibold,
    letterSpacing: letterSpacing.titleSmall,
    lineHeight:    fontSize.titleSmall * lineHeight.titleSmall,
  },
  bodyLarge: {
    fontSize:      fontSize.bodyLarge,
    fontWeight:    fontWeight.regular,
    letterSpacing: letterSpacing.bodyLarge,
    lineHeight:    fontSize.bodyLarge * lineHeight.bodyLarge,
  },
  bodyNormal: {
    fontSize:      fontSize.bodyNormal,
    fontWeight:    fontWeight.regular,
    letterSpacing: letterSpacing.bodyNormal,
    lineHeight:    fontSize.bodyNormal * lineHeight.bodyNormal,
  },
  caption: {
    fontSize:      fontSize.caption,
    fontWeight:    fontWeight.regular,
    letterSpacing: letterSpacing.caption,
    lineHeight:    fontSize.caption * lineHeight.caption,
  },
  label: {
    fontSize:      fontSize.label,
    fontWeight:    fontWeight.medium,
    letterSpacing: letterSpacing.label,
    lineHeight:    fontSize.label * lineHeight.label,
    textTransform: 'uppercase' as const,
  },
} as const;

export default { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, textStyles };
