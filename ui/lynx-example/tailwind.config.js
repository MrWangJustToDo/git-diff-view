const { createLynxPreset } = require("@lynx-js/tailwind-preset");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    // Source-alias @git-diff-view/lynx → packages/lynx/src
    "../../packages/lynx/src/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [createLynxPreset()],
  theme: {
    extend: {},
  },
  plugins: [],
};
