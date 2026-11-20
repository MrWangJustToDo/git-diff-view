import { resolve } from "node:path";
import { octane } from "octane/compiler/vite";
import { defineConfig } from "vite";

import pkg from "./package.json" with { type: "json" };

const external = [
  "@git-diff-view/core",
  "@types/hast",
  "fast-diff",
  "highlight.js",
  "lowlight",
  "reactivity-store/octane",
];

export default defineConfig(({ mode }) => {
  const server = mode === "npm-server";

  return {
    plugins: [octane({ ssr: server })],
    resolve: {
      alias: [
        {
          find: /^@git-diff-view\/utils$/,
          replacement: resolve(import.meta.dirname, "../utils/src/index.ts"),
        },
        ...(server ? [{ find: /^octane$/, replacement: "octane/server" }] : []),
      ],
      extensions: [".tsrx", ".ts", ".mjs", ".js", ".json"],
    },
    build: {
      target: "esnext",
      emptyOutDir: true,
      outDir: server ? "dist/server" : "dist/client",
      copyPublicDir: false,
      sourcemap: true,
      minify: false,
      lib: {
        entry: resolve(import.meta.dirname, "src/index.ts"),
        name: "GitDiffViewOctane",
        fileName: () => "index.js",
        formats: ["es"],
      },
      rollupOptions: {
        external: [...external, server ? "octane/server" : "octane"],
        output: {
          banner: "// octane-no-slot: compiler-assigned hook slots are already present.",
        },
      },
    },
    define: {
      __DEV__: "false",
      __VERSION__: JSON.stringify(pkg.version),
    },
  };
});
