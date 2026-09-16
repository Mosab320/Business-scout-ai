/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#05070d",
          900: "#0a0e1a",
          800: "#0f1424",
          700: "#161d33",
          600: "#212a47",
        },
        signal: {
          400: "#5eead4",
          500: "#2dd4bf",
          600: "#14b8a6",
        },
        violet: {
          400: "#a78bfa",
          500: "#8b5cf6",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(94,234,212,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(94,234,212,0.06) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
