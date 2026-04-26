export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, xxxl: 64 } as const;

export const borderRadius = { input: 12, button: 14, card: 20, modal: 28, pill: 100 } as const;

export const shadows = {
  card:   { shadowColor: '#000', shadowOffset: { width: 0, height: 2 },  shadowOpacity: 0.06, shadowRadius: 20, elevation: 3 },
  modal:  { shadowColor: '#000', shadowOffset: { width: 0, height: 8 },  shadowOpacity: 0.12, shadowRadius: 40, elevation: 8 },
  button: { shadowColor: '#22C55E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 4 },
} as const;

export const componentHeight = { button: 56, input: 56 } as const;
export const iconSize = { inline: 20, standard: 24, featured: 32 } as const;
export const duration = { fast: 100, normal: 250, medium: 300 } as const;
export const pressedScale = 0.97;

export default { spacing, borderRadius, shadows, componentHeight, iconSize, duration, pressedScale };
