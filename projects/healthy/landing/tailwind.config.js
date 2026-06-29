/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        green: {
          DEFAULT: '#22C55E',
          dark: '#16A34A',
          glow: 'rgba(34,197,94,0.22)',
          muted: 'rgba(34,197,94,0.10)',
        },
        bg: {
          DEFAULT: '#080808',
          surface: '#111111',
          elevated: '#161616',
        },
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['Barlow', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
        pill: '100px',
        xl2: '28px',
      },
      backdropBlur: {
        glass: '20px',
      },
    },
  },
  plugins: [],
}
