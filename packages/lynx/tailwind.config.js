const { createLynxPreset } = require("@lynx-js/tailwind-preset");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  presets: [createLynxPreset()],
  theme: {
    extend: {},
  },
  plugins: [],
};
