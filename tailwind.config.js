/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0A0908',
        panel: '#121110',
        gold: '#D9B24E',
        line: '#2A271F',
        muted: '#8A8578',
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        sans: ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
