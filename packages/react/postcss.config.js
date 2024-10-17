const { resolve } = require("path");

module.exports = {
  plugins: {
    "postcss-import": {},
    tailwindcss: { config: resolve(__dirname) + "/tailwind.config.js" },
    "postcss-prefix-selector": {
      prefix: ".diff-tailwindcss-wrapper",
      transform: function (prefix, selector, prefixedSelector, _filePath, rule) {
        const filePath = rule.source?.input?.file;
        // ignore base css
        if (rule.source?.start?.line === 1 && rule.source?.start?.column === 1) {
          return selector;
        }
        if (selector.includes("diff-line-extend-wrapper") || selector.includes("diff-line-widget-wrapper")) {
          return selector;
        }
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
