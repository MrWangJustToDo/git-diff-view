import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(import.meta.dirname, "..");
const temporaryRoot = mkdtempSync(join(tmpdir(), "git-diff-view-octane-pack-"));
const reactivityStoreTarball = process.env.REACTIVITY_STORE_TARBALL;

if (reactivityStoreTarball && !existsSync(reactivityStoreTarball)) {
  throw new Error(`REACTIVITY_STORE_TARBALL does not exist: ${reactivityStoreTarball}`);
}

try {
  const output = execFileSync("pnpm", ["pack", "--pack-destination", temporaryRoot], {
    cwd: packageRoot,
    encoding: "utf8",
  });
  const tarball = output.trim().split("\n").at(-1);
  if (!tarball) throw new Error("pnpm pack did not return a tarball path.");
  const listing = execFileSync("tar", ["-tf", tarball], { encoding: "utf8" });

  // Reason: registry 0.4.0 predates the Octane export. Pack the dependency
  // selected by the development override so the smoke test still exercises
  // the publishable package without leaking that override into its manifest.
  const resolvedReactivityStoreTarball = reactivityStoreTarball
    ? resolve(reactivityStoreTarball)
    : execFileSync("pnpm", ["pack", "--pack-destination", temporaryRoot], {
        cwd: resolve(fileURLToPath(import.meta.resolve("reactivity-store/package.json")), ".."),
        encoding: "utf8",
      })
        .trim()
        .split("\n")
        .at(-1);
  if (!resolvedReactivityStoreTarball) throw new Error("Unable to pack reactivity-store.");
  const localReactivityStore = `file:${resolvedReactivityStoreTarball}`;

  for (const expected of [
    "package/dist/client/index.js",
    "package/dist/server/index.js",
    "package/dist/index.d.ts",
    "package/dist/css/diff-view.css",
  ]) {
    if (!listing.includes(expected)) throw new Error(`Packed package omitted ${expected}.`);
  }

  writeFileSync(
    join(temporaryRoot, "package.json"),
    JSON.stringify({
      name: "octane-pack-smoke",
      private: true,
      type: "module",
      dependencies: {
        "@git-diff-view/octane": `file:${tarball}`,
        octane: "^0.1.36",
        "reactivity-store": localReactivityStore,
      },
    })
  );
  writeFileSync(
    join(temporaryRoot, "pnpm-workspace.yaml"),
    `overrides:\n  reactivity-store: ${JSON.stringify(localReactivityStore)}\n`
  );
  execFileSync("pnpm", ["install", "--ignore-scripts", "--config.auto-install-peers=false"], {
    cwd: temporaryRoot,
    stdio: "inherit",
  });
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
  if (packageJson.dependencies?.["reactivity-store"] !== "^0.4.0") {
    throw new Error("Packed package leaked the development reactivity-store override.");
  }
  const declarationEntry = readFileSync(
    join(temporaryRoot, "node_modules/@git-diff-view/octane/dist/index.d.ts"),
    "utf8"
  );
  if (/from\s+["']@git-diff-view\/utils(?:\/[^"']*)?["']/.test(declarationEntry)) {
    throw new Error("Packed declarations retained the private @git-diff-view/utils workspace import.");
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
