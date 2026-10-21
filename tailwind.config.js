/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spotify: {
          green: "#1DB954",
          black: "#121212",
          dark: "#181818",
          card: "#282828",
          light: "#B3B3B3",
        },
        bzrp: {
          neon: "#39ff14",
          blue: "#00d2ff",
          dark: "#0b0c10"
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-short': 'bounce 0.8s infinite 2',
      }
    },
  },
  plugins: [],
}
