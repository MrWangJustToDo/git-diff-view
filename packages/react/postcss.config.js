const { resolve } = require("path");

module.exports = {
  plugins: {
    tailwindcss: { config: resolve(__dirname) + "/tailwind.config.js" },
    "postcss-prefix-selector": {
      prefix: ".diff-tailwindcss-wrapper",
    },
    autoprefixer: {},
  },
};
