/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1A2A5E',
          light: '#243578',
          dark: '#111d42',
        },
        teal: {
          DEFAULT: '#0D9488',
          light: '#14b8a6',
          dark: '#0f766e',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Tajawal', 'sans-serif'],
        arabic: ['Tajawal', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
