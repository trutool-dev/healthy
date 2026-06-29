import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0a',
        surface: '#111111',
        elevated: '#181818',
        border: 'rgba(255,255,255,0.07)',
        green: {
          DEFAULT: '#22C55E',
          dark: '#16A34A',
          glow: 'rgba(34,197,94,0.22)',
          muted: 'rgba(34,197,94,0.10)',
        },
      },
      fontFamily: {
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.3em',
      },
    },
  },
  plugins: [],
} satisfies Config
