import { resolve } from "path";

export default {
  plugins: {
    tailwindcss: { config: "./tailwind.config.js" },
    "postcss-prefix-selector": {
      prefix: ".diff-tailwindcss-wrapper",
    },
    autoprefixer: {},
  },
};
