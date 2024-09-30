const { resolve } = require("path");

module.exports = {
  plugins: {
    tailwindcss: { config: resolve(__dirname) + "/tailwind.config.js" },
    "postcss-prefix-selector": {
      prefix: ".diff-tailwindcss-wrapper",
      transform: function (prefix, selector, prefixedSelector, filePath, rule) {
        if (selector.includes('[data-theme')) {
          return prefix + selector;
        }
        if (filePath.includes('node_modules')) {
          if (filePath.includes('github.css')) {
            return `${prefix}[data-theme="light"] ${selector}`;
          } else if (filePath.includes('github-dark.css')) {
            return `${prefix}[data-theme="dark"] ${selector}`;
          }
        } else {
          return prefixedSelector;
        }
      }
    },
    autoprefixer: {},
  },
};
