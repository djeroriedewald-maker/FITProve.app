/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: { 'fit-orange': '#ff6a00' },
      boxShadow: { soft: '0 8px 24px rgba(0,0,0,0.08)' },
    },
  },
  plugins: [],
};
