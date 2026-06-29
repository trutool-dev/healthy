/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: { green: '#22C55E', dark: '#16A34A', light: '#DCFCE7' },
        neutral: {
          white: '#FFFFFF', offWhite: '#F9FAFB', lightGray: '#F3F4F6',
          midGray: '#9CA3AF', darkGray: '#1F2937', black: '#111827',
        },
      },
    },
  },
  plugins: [],
};
