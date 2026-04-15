/**
 * Tokens de color del sistema de diseño Healthy
 * Paleta principal, colores semánticos y modo oscuro
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
    white:     '#FFFFFF', // fondos principales
    offWhite:  '#F9FAFB', // fondos secundarios, cards
    lightGray: '#F3F4F6', // separadores, fondos terciarios
    midGray:   '#9CA3AF', // textos secundarios, placeholders
    darkGray:  '#1F2937', // textos principales
    black:     '#111827', // títulos, énfasis
  },

  // Colores semánticos
  semantic: {
    success: '#22C55E', // objetivos cumplidos, racha activa
    warning: '#F59E0B', // alertas suaves, recordatorios
    error:   '#EF4444', // errores, límites superados
    info:    '#3B82F6', // información, consejos de la IA
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
};

export default colors;
