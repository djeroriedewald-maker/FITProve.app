/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        card: "var(--card)",
        border: "var(--border)",
        text: "var(--text)",
        subtle: "var(--subtle)",
        brand: { DEFAULT: "var(--brand)", fg: "var(--brand-fg)" }
      },
      boxShadow: { card: "0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)" }
    },
  },
  plugins: [],
}
