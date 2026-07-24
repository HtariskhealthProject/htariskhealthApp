/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },

      colors: {
        clinical: {
          50: "#F4F8FC",
          100: "#EAF3FF",
          200: "#D5E8FF",
          300: "#A9D0FF",
          400: "#5FA9FF",
          500: "#2563EB",
          600: "#1D4ED8",
          700: "#1E40AF",
          800: "#1E3A8A",
          900: "#172554",
        },

        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#DC2626",
        info: "#0EA5E9",

        background: "#F4F8FC",
        surface: "#FFFFFF",

        border: "#E2E8F0",

        text: {
          primary: "#1E293B",
          secondary: "#64748B",
          light: "#94A3B8",
        },
      },

      boxShadow: {
        card: "0 4px 14px rgba(15,23,42,.08)",
        hover: "0 8px 25px rgba(37,99,235,.12)",
      },

      borderRadius: {
        xl2: "18px",
      },
    },
  },
  plugins: [],
};