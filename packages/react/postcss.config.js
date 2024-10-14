const { resolve } = require("path");

module.exports = {
  plugins: {
    "postcss-import": {},
    tailwindcss: { config: resolve(__dirname) + "/tailwind.config.js" },
    "postcss-prefix-selector": {
      prefix: ".diff-tailwindcss-wrapper",
      transform: function (prefix, selector, prefixedSelector, _filePath, rule) {
        const filePath = rule.source?.input?.file;
        if (selector.includes("[data-theme")) {
          return prefix + selector;
        }
        if (filePath.includes("node_modules")) {
          if (filePath.includes("dark.css")) {
            return `${prefix}[data-theme="dark"] .diff-line-syntax-raw ${selector}`;
          } else {
            return `${prefix}[data-theme="light"] .diff-line-syntax-raw ${selector}`;
          }
        } else {
          return prefixedSelector;
        }
      },
    },
    autoprefixer: {},
  },
};
