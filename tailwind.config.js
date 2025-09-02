/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // <- belangrijk: via .dark class
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef6ff',
          100: '#d9eaff',
          200: '#bcd8ff',
          300: '#90beff',
          400: '#5ea0ff',
          500: '#2f80ff',
          600: '#1f66e6',
          700: '#1a54bf',
          800: '#194899',
          900: '#173d7d',
        },
      },
    },
  },
  plugins: [],
}
