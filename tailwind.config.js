/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts}"],
  theme: {
    extend: {
      colors: {
        background: "#050507",
        surface: "#0c0d12",
        primary: "#fae133",
        secondary: "#10b981",
        danger: "#ff4a4a",
        accent: "#a020f0",
        gold: "#fbbf24",
        info: "#4a9eff",
        success: "#10b981",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        title: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
