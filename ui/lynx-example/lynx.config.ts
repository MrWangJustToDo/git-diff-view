import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

import { defineConfig } from "@lynx-js/rspeedy";
import { pluginReactLynx } from "@lynx-js/react-rsbuild-plugin";
import { pluginTailwindCSS } from "rsbuild-plugin-tailwindcss";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const lynxPkg = require("../../packages/lynx/package.json") as { version: string };

/** Stub out full lowlight/highlight.js — Lynx bytecode rejects `\p{...}` regexes. */
const lowlightStub = path.resolve(__dirname, "../../packages/lynx/src/stubs/lowlight.ts");
/** Stub `@lezer/markdown` — same `\p{...}` issue; use `@git-diff-view/lezer` without markdown. */
const lezerMarkdownStub = path.resolve(__dirname, "../../packages/lynx/src/stubs/lezer-markdown.ts");
const lynxSrc = path.resolve(__dirname, "../../packages/lynx/src/index.ts");
const lezerSrc = path.resolve(__dirname, "../../packages/lezer/src/index.ts");

export default defineConfig({
  source: {
    entry: "./src/index.tsx",
    define: {
      __DEV__: true,
      __VERSION__: JSON.stringify(lynxPkg.version),
    },
    alias: {
      "@git-diff-view/lynx": lynxSrc,
      "@git-diff-view/lezer": lezerSrc,
      "@git-diff-view/lowlight": lowlightStub,
      lowlight: lowlightStub,
      "highlight.js": lowlightStub,
      "@lezer/markdown": lezerMarkdownStub,
    },
  },
  environments: {
    web: {},
    lynx: {},
  },
  plugins: [
    pluginReactLynx({
      enableCSSInheritance: true,
      customCSSInheritanceList: ["font-size", "font-family", "color"],
    }),
    pluginTailwindCSS({
      config: "./tailwind.config.js",
    }),
  ],
});
