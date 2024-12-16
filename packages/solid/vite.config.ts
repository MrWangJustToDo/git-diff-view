import typescript from "@rollup/plugin-typescript";
import * as path from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import solidPlugin from "vite-plugin-solid";

import pkg from "./package.json";

export default defineConfig({
  plugins: [
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    typescript({ tsconfig: "./tsconfig.json" }),
    solidPlugin(),
    dts(),
  ],
  server: {
    port: 3000,
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.withStyle.ts"),
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
    rollupOptions: {
      external: ["solid-js", "@git-diff-view/core"],
      output: {
        assetFileNames: "css/diff-view.css",
      },
    },
  },
  define: {
    __VERSION__: JSON.stringify(pkg.version),
  },
});
