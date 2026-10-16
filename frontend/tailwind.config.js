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
          50: '#FDFCFB',
          100: '#FAF8F5',
          200: '#F5EFEB',
          300: '#EAE2D8',
          400: '#DCD2C5',
        },
        mauve: {
          50: '#FAF5F8',
          100: '#F3E8F0',
          200: '#E6D0E0',
          300: '#D4AFC9',
          400: '#BA87AD',
          500: '#9E678E',
          600: '#824F73',
          700: '#683B5B',
          800: '#4F2B45',
          900: '#361D30',
          950: '#241120',
        },
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
