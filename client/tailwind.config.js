/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Roboto"],
        // 'roboto': ["Roboto", "sans-serif"],
      },
      colors: {
        "ocean-green": {
          50: "#effaf2",
          100: "#d8f3de",
          200: "#b4e6c2",
          300: "#82d39d",
          400: "#49b671",
          500: "#2c9d59",
          600: "#1d7e46",
          700: "#17653a",
          800: "#15502f",
          900: "#124228",
          950: "#092516",
        },
      },
      width: {
        "1/8": "12.5%",
      },
      transitionProperty: {
        height: "height",
      },
    },
  },
  plugins: [],
};
