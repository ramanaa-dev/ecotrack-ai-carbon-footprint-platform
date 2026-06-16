/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0A',
        cardDark: 'rgba(20, 20, 20, 0.6)',
        borderDark: 'rgba(255, 255, 255, 0.05)',
        ecoGreen: {
          light: '#4ADE80',
          DEFAULT: '#22C55E',
          dark: '#16A34A',
        },
        ecoCyan: {
          light: '#22D3EE',
          DEFAULT: '#06B6D4',
          dark: '#0891B2',
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'neon-green': '0 0 15px rgba(34, 197, 94, 0.2)',
        'neon-cyan': '0 0 15px rgba(6, 182, 212, 0.2)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}
