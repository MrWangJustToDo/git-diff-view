import solidPlugin from "eslint-plugin-solid/configs/typescript";
import globals from "globals";
import baseLint from "project-tool/baseLint";
import reactLint from "project-tool/reactLint";

export default [
  ...baseLint,
  {
    ignores: [
      "dist/**",
      "dev/**",
      "scripts/**",
      "node_modules/**",
      "ui/next-app-example/**",
      "ui/next-page-example/**",
      "packages/svelte/**",
    ],
  },
  {
    files: ["**/*.mjs", "**/*.cjs", "**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ["packages/react/**/*.ts", "packages/react/**/*.tsx"],
    ...reactLint[0],
  },
  ...reactLint.slice(1).map((config) => ({
    ...config,
    files: ["packages/react/**/*.ts", "packages/react/**/*.tsx"],
  })),
  {
    files: ["packages/cli/**/*.ts", "packages/cli/**/*.tsx"],
    ...reactLint[0],
  },
  ...reactLint.slice(1).map((config) => ({
    ...config,
    files: ["packages/cli/**/*.ts", "packages/cli/**/*.tsx"],
  })),
  {
    files: ["packages/solid/**/*.ts", "packages/solid/**/*.tsx"],
    ...solidPlugin,
  },
];
