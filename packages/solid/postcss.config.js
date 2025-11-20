export default {
  plugins: {
    "postcss-import": {},
    "@tailwindcss/postcss": {},
    "postcss-prefix-selector": {
      prefix: ".diff-tailwindcss-wrapper",
      transform: function (prefix, selector, prefixedSelector, _filePath, rule) {
        const filePath = rule.source?.input?.file;
        if (filePath.includes("_base.css")) {
          if (rule.source?.start?.line === 1) {
            return selector;
          } else {
            return prefixedSelector;
          }
        }
        if (filePath.includes("_base_pure.css")) {
          return prefixedSelector;
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
  },
};
