import { resolve } from "node:path";
import { octane } from "octane/compiler/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [octane()],
  resolve: {
    alias: [
      {
        find: /^@git-diff-view\/core$/,
        replacement: resolve(import.meta.dirname, "../core/src/index.ts"),
      },
      {
        find: /^@git-diff-view\/lowlight$/,
        replacement: resolve(import.meta.dirname, "../lowlight/src/index.ts"),
      },
      {
        find: /^@git-diff-view\/utils$/,
        replacement: resolve(import.meta.dirname, "../utils/src/index.ts"),
      },
    ],
    extensions: [".tsrx", ".ts", ".mjs", ".js", ".json"],
  },
  define: {
    __DEV__: "false",
    __VERSION__: JSON.stringify("test"),
    __LOWLIGHT_VERSION__: JSON.stringify("test"),
  },
  test: {
    environment: "jsdom",
    include: ["tests/client/**/*.test.ts"],
    setupFiles: ["./tests/setup.ts"],
    restoreMocks: true,
  },
});
