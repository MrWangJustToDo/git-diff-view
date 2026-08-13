import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const packageRoot = resolve(import.meta.dirname, "..");
const temporaryRoot = mkdtempSync(join(tmpdir(), "git-diff-view-octane-pack-"));

try {
  const output = execFileSync("pnpm", ["pack", "--pack-destination", temporaryRoot], {
    cwd: packageRoot,
    encoding: "utf8",
  });
  const tarball = output.trim().split("\n").at(-1);
  if (!tarball) throw new Error("pnpm pack did not return a tarball path.");
  const listing = execFileSync("tar", ["-tf", tarball], { encoding: "utf8" });

  for (const expected of [
    "package/dist/client/index.js",
    "package/dist/server/index.js",
    "package/dist/index.d.ts",
    "package/dist/css/diff-view.css",
  ]) {
    if (!listing.includes(expected)) throw new Error(`Packed package omitted ${expected}.`);
  }

  // Reason: no overrides and no local reactivity-store tarball here — the store
  // adapter must resolve from the packed package's own dependency declaration,
  // exactly like a real consumer install (requires network access to GitHub).
  writeFileSync(
    join(temporaryRoot, "package.json"),
    JSON.stringify({
      name: "octane-pack-smoke",
      private: true,
      type: "module",
      dependencies: {
        "@git-diff-view/octane": `file:${tarball}`,
        octane: "^0.1.36",
      },
    })
  );
  // Reason: pnpm >= 11 blocks git-hosted transitive dependencies by default
  // (blockExoticSubdeps); real consumers must opt out the same way to install
  // the pinned reactivity-store fork, so the smoke consumer mirrors that step.
  execFileSync(
    "pnpm",
    [
      "install",
      "--ignore-scripts",
      "--config.auto-install-peers=false",
      "--config.block-exotic-subdeps=false",
    ],
    {
      cwd: temporaryRoot,
      stdio: "inherit",
    }
  );
  const productionPackages = readdirSync(join(temporaryRoot, "node_modules/.pnpm"));
  for (const forbiddenRuntime of ["react@", "react-dom@", "use-sync-external-store@"]) {
    if (productionPackages.some((entry) => entry.startsWith(forbiddenRuntime))) {
      throw new Error(`Packed dependency graph contains ${forbiddenRuntime.slice(0, -1)}.`);
    }
  }
  const packageJson = JSON.parse(
    readFileSync(join(temporaryRoot, "node_modules/@git-diff-view/octane/package.json"), "utf8")
  );
  if (!packageJson.exports?.["."]?.browser || !packageJson.exports?.["."]?.node) {
    throw new Error("Packed package lost browser/node conditional exports.");
  }
  const storeDependency = packageJson.dependencies?.["reactivity-store"];
  if (!storeDependency?.startsWith("github:zhsama/reactivity-store#")) {
    throw new Error(`Packed package does not pin the reactivity-store fork: ${storeDependency}`);
  }

  execFileSync(
    "node",
    [
      "--conditions=node",
      "--input-type=module",
      "--eval",
      [
        'import { DiffModeEnum, DiffView } from "@git-diff-view/octane";',
        'import { renderToString } from "octane/server";',
        "const props = {",
        '  data: { oldFile: { fileName: "a.ts", content: "a" }, newFile: { fileName: "a.ts", content: "b" }, hunks: ["@@ -1 +1 @@\\n-a\\n+b"] },',
        "  diffViewHighlight: false,",
        "  diffViewMode: DiffModeEnum.Unified,",
        "  diffViewWrap: true,",
        "};",
        "const result = renderToString(DiffView, props);",
        'if (!result.html.includes("unified-diff-view")) throw new Error("Packed SSR render failed.");',
      ].join("\n"),
    ],
    { cwd: temporaryRoot, stdio: "inherit" }
  );
  execFileSync(
    "node",
    [
      "--conditions=browser",
      "--input-type=module",
      "--eval",
      'import("@git-diff-view/octane").then((m) => { if (!m.DiffView) process.exit(1); })',
    ],
    { cwd: temporaryRoot, stdio: "inherit" }
  );
  console.log("Packed @git-diff-view/octane installs and renders through browser/SSR entries.");
} finally {
  rmSync(temporaryRoot, { force: true, recursive: true });
}
