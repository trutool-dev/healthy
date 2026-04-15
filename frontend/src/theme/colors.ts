/**
 * Tokens de color del sistema de diseño Healthy
 * Copiados desde /design/tokens/colors.js y convertidos a TypeScript
 */

export const colors = {
  // Paleta principal
  primary: {
    green:      '#22C55E', // acciones principales, progreso, éxito
    darkGreen:  '#16A34A', // hover, pressed states
    lightGreen: '#DCFCE7', // fondos suaves, badges de éxito
  },

  // Neutros
  neutral: {
    white:     '#FFFFFF',
    offWhite:  '#F9FAFB',
    lightGray: '#F3F4F6',
    midGray:   '#9CA3AF',
    darkGray:  '#1F2937',
    black:     '#111827',
  },

  // Colores semánticos
  semantic: {
    success: '#22C55E',
    warning: '#F59E0B',
    error:   '#EF4444',
    info:    '#3B82F6',
  },

  // Modo oscuro
  dark: {
    background:      '#0A0A0A',
    surface:         '#1A1A1A',
    surfaceElevated: '#2A2A2A',
    border:          '#2D2D2D',
    textPrimary:     '#F9FAFB',
    textSecondary:   '#9CA3AF',
  },
} as const;

export default colors;
