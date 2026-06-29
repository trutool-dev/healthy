export const colors = {
  primary: {
    green:      '#22C55E',
    darkGreen:  '#16A34A',
    lightGreen: '#DCFCE7',
  },
  neutral: {
    white:     '#FFFFFF',
    offWhite:  '#F9FAFB',
    lightGray: '#F3F4F6',
    midGray:   '#9CA3AF',
    darkGray:  '#1F2937',
    black:     '#111827',
  },
  semantic: {
    success: '#22C55E',
    warning: '#F59E0B',
    error:   '#EF4444',
    info:    '#3B82F6',
  },
  dark: {
    background:      '#0A0A0A',
    surface:         '#1A1A1A',
    surfaceElevated: '#2A2A2A',
    border:          '#2D2D2D',
    textPrimary:     '#F9FAFB',
    textSecondary:   '#9CA3AF',
  },
  whoop: {
    bg:          '#0F0F0F',
    card:        '#1C1C1E',
    cardBorder:  'rgba(255,255,255,0.06)',
    recovery:    '#22C55E',
    recoveryMid: '#F59E0B',
    recoveryLow: '#EF4444',
    strain:      '#3B82F6',
    sleep:       '#8B5CF6',
    hrv:         '#EC4899',
    textVal:     '#FFFFFF',
    textLabel:   'rgba(255,255,255,0.50)',
    graphLine:   'rgba(255,255,255,0.15)',
  },
} as const;

export default colors;
