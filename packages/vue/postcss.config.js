export default {
  plugins: {
    tailwindcss: { config: "./tailwind.config.js" },
    "postcss-prefix-selector": {
      prefix: ".diff-tailwindcss-wrapper",
      transform: function (prefix, selector, prefixedSelector, filePath, rule) {
        if (selector.includes("[data-theme")) {
          return prefix + selector;
        }
        if (filePath.includes("node_modules")) {
          if (filePath.includes("github.css")) {
            return `${prefix}[data-theme="light"] .diff-line-syntax-raw ${selector}`;
          } else if (filePath.includes("github-dark.css")) {
            return `${prefix}[data-theme="dark"] .diff-line-syntax-raw ${selector}`;
          }
        } else {
          return prefixedSelector;
        }
      },
    },
    autoprefixer: {},
  },
};
