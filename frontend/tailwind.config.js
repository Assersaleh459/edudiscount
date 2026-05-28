/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: 'var(--primary, #1A2A5E)',
          light: 'color-mix(in srgb, var(--primary, #1A2A5E) 80%, white)',
          dark: 'color-mix(in srgb, var(--primary, #1A2A5E) 80%, black)',
        },
        teal: {
          DEFAULT: 'var(--accent, #0D9488)',
          light: 'color-mix(in srgb, var(--accent, #0D9488) 80%, white)',
          dark: 'color-mix(in srgb, var(--accent, #0D9488) 80%, black)',
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
