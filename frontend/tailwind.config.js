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
          DEFAULT: '#FDFBF7',
          card: '#F7F2EB',
          dark: '#EFE7DC',
          border: '#E5D9CC'
        },
        rose: {
          DEFAULT: '#C48B9F',
          hover: '#A66B80',
          light: '#F8EEF2',
          subtle: '#E6C9D4',
          dark: '#874D60'
        },
        deep: {
          DEFAULT: '#4A3E3D',
          muted: '#7C6E6D',
          light: '#9E8F8E'
        }
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 10px 30px -10px rgba(196, 139, 159, 0.12), 0 4px 12px rgba(74, 62, 61, 0.03)',
        'rose': '0 8px 24px -4px rgba(196, 139, 159, 0.35)',
      }
    },
  },
  plugins: [],
}
