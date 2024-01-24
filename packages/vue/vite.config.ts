import typescript from "@rollup/plugin-typescript";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import * as path from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [typescript({ tsconfig: "./tsconfig.json" }), vue(), vueJsx(), dts()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.withStyle.ts"),
      name: "GitDiffView",
      formats: ["es", "cjs"],
      fileName: (format) =>
        format === "cjs" ? `vue-git-diff-view.cjs` : format === "es" ? `vue-git-diff-view.mjs` : `vue-git-diff-view.js`,
    },
    sourcemap: true,
    rollupOptions: {
      external: ["vue", "lowlight"],
      output: {
        globals: {
          vue: "Vue",
        },
        assetFileNames: "css/diff-view.css",
      },
    },
  },
});
