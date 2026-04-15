/** @type {import('tailwindcss').Config} */
module.exports = {
  // Archivos donde NativeWind buscará clases
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Paleta principal del sistema de diseño Healthy
        primary: {
          green:      '#22C55E',
          dark:       '#16A34A',
          light:      '#DCFCE7',
        },
        neutral: {
          white:      '#FFFFFF',
          offWhite:   '#F9FAFB',
          lightGray:  '#F3F4F6',
          midGray:    '#9CA3AF',
          darkGray:   '#1F2937',
          black:      '#111827',
        },
        semantic: {
          success:    '#22C55E',
          warning:    '#F59E0B',
          error:      '#EF4444',
          info:       '#3B82F6',
        },
        dark: {
          bg:         '#0A0A0A',
          surface:    '#1A1A1A',
          elevated:   '#2A2A2A',
          border:     '#2D2D2D',
        },
      },
      borderRadius: {
        input:  '12px',
        button: '14px',
        card:   '20px',
        modal:  '28px',
        pill:   '100px',
      },
    },
  },
  plugins: [],
};
