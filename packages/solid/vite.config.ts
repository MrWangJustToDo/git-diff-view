import * as path from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import solidPlugin from "vite-plugin-solid";

import pkg from "./package.json";

export default defineConfig({
  plugins: [solidPlugin(), dts({ outDir: "dist/types" })],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "GitDiffView",
      formats: ["es", "cjs"],
      fileName: (format) =>
        format === "cjs"
          ? `solid-git-diff-view.cjs`
          : format === "es"
            ? `solid-git-diff-view.mjs`
            : `solid-git-diff-view.js`,
    },
    sourcemap: true,
    minify: false,
    rollupOptions: {
      external: ["solid-js", "@git-diff-view/core"],
    },
  },
  define: {
    __VERSION__: JSON.stringify(pkg.version),
  },
});
