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
          "0%": { bottom: "0px", left: "0px", right: "0px", opacity: "0%" },
          "25%": { bottom: "50px", opacity: "100%" },
          "50%": { opacity: "100%" },
          "100%": { bottom: "50px", opacity: "0%" },
        },
        separate: {
          "0%": { margin: "0 0 0 0" },
          "25%": { margin: "0 0 10px 0" },
          "100%": { margin: "0 0 10px 0" },
        },
      },
      animation: {
        popup: "popup 3s ease-out",
        separate: "separate 3s ease-out",
      },
    },
  },
  plugins: [
    require("tw-elements/dist/plugin"),
    require("@tailwindcss/line-clamp"),
  ],
};
