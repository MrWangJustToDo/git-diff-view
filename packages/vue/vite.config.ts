import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import * as path from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

import pkg from "./package.json";

export default defineConfig({
  plugins: [vue(), vueJsx(), dts({ outDir: "dist/types" })],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "GitDiffView",
      formats: ["es", "cjs"],
      fileName: (format) =>
        format === "cjs" ? `vue-git-diff-view.cjs` : format === "es" ? `vue-git-diff-view.mjs` : `vue-git-diff-view.js`,
    },
    sourcemap: true,
    minify: false,
    rollupOptions: {
      external: ["vue", "@git-diff-view/core"],
      output: {
        globals: {
          vue: "Vue",
        },
      },
    },
  },
  define: {
    __VERSION__: JSON.stringify(pkg.version),
  },
});
