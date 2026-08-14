/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#F8FAFC', // clean background
          card: '#FFFFFF', // white card
          dark: '#F1F5F9', // light gray
          border: '#E2E8F0' // clean border
        },
        rose: {
          DEFAULT: '#00A1FC', // blue
          hover: '#008BE0', // darker blue
          light: '#ECFEFF', // light cyan
          subtle: '#CFFAFE', // cyan
          dark: '#0369A1' // sky-700
        },
        deep: {
          DEFAULT: '#0F172A', // slate-900
          muted: '#475569', // slate-600
          light: '#64748B' // slate-500
        },
        gradient: {
          start: '#00A1FC',
          end: '#00DECC'
        }
      },
      fontFamily: {
        serif: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 10px 30px -10px rgba(0, 161, 252, 0.1), 0 4px 12px rgba(15, 23, 42, 0.03)',
        'rose': '0 8px 24px -4px rgba(0, 161, 252, 0.25)',
      }
    },
  },
  plugins: [],
}
