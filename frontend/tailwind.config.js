/** @type {import('tailwindcss').Config} */
// Only two layouts exist: iPhone 15 (below `lg`) and a Full HD desktop with the left menu (`lg` and up).
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0d0c08",
        chrome: "#100f0b",
        surface: "#17150f",
        brand: "#fcbc05",
        "brand-soft": "#e7b11b",
        "on-brand": "#17130a",
        danger: "#ff7a68",
        gain: "#7cc9a0",
        // warm blacks instead of Tailwind's cool grays, so every existing neutral-* class fits the logo
        neutral: {
          50: "#f6f1e4",
          100: "#eae4d3",
          200: "#d3cdb9",
          300: "#b9b29b",
          400: "#a39b84",
          500: "#8c8571",
          600: "#5e5848",
          700: "#3a3628",
          800: "#25221a",
          900: "#1a1812",
          950: "#100f0b",
        },
      },
      fontFamily: {
        sans: ["Lato", "system-ui", "sans-serif"],
        display: ["Lato", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
