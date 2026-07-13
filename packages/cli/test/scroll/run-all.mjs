/**
 * Automated scroll API regression tests (Node built-in test runner).
 *
 * Prerequisites: build CLI first
 *   pnpm run build:packages
 *
 * Run:
 *   pnpm --filter @git-diff-view/cli test:scroll
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const testFiles = ["scroll-unit.test.mjs", "codeview-layout.test.mjs", "diffview-layout.test.mjs"].map((file) =>
  path.join(__dirname, file)
);

const child = spawn(process.execPath, ["--test", ...testFiles], {
  stdio: "inherit",
  cwd: path.resolve(__dirname, "../.."),
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
