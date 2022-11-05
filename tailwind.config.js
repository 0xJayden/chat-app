/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/tw-elements/dist/js/**/*.js",
  ],
  theme: {
    extend: {
      keyframes: {
        popup: {
          "0%": { bottom: "0px", left: "0px", right: "0px" },
          "25%": { bottom: "150px" },
          "50%": { opacity: "100%" },
          "100%": { bottom: "150px", opacity: "0%" },
        },
      },
      animation: {
        popup: "popup 3s ease-out",
      },
    },
  },
  plugins: [
    require("tw-elements/dist/plugin"),
    require("@tailwindcss/line-clamp"),
  ],
};
