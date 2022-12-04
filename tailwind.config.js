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
          "0%": { opacity: "0%", bottom: "0px" },
          "25%": { bottom: "50px", opacity: "100%" },
          "50%": { opacity: "100%" },
          "100%": { bottom: "50px", opacity: "0%" },
        },
      },
      animation: {
        popup: "popup 2s ease-out",
      },
    },
  },
  plugins: [
    require("tw-elements/dist/plugin"),
    require("@tailwindcss/line-clamp"),
  ],
};
