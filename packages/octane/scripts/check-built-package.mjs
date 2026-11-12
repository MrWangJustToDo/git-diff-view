import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const packageRoot = resolve(import.meta.dirname, "..");
const distRoot = join(packageRoot, "dist");
const expected = [
  "dist/client/index.js",
  "dist/server/index.js",
  "dist/index.d.ts",
  "dist/css/diff-view.css",
  "dist/css/diff-view-pure.css",
];

function filesUnder(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(file) : [file];
  });
}

const missing = expected.filter((file) => !existsSync(join(packageRoot, file)));
if (missing.length > 0) {
  throw new Error(`@git-diff-view/octane build omitted:\n${missing.map((file) => `  ${file}`).join("\n")}`);
}

for (const file of filesUnder(distRoot)) {
  const packagePath = relative(packageRoot, file);
  if (/\.(?:ts|tsx|tsrx)$/.test(file) && !file.endsWith(".d.ts")) {
    throw new Error(`Raw TypeScript leaked into the package: ${packagePath}`);
  }
  if (!file.endsWith(".js")) continue;

  const source = readFileSync(file, "utf8");
  if (/(?:from\s*|import\s*\()["'](?:react|react-dom|use-sync-external-store)(?:\/[^"']*)?["']/.test(source)) {
    throw new Error(`React runtime import leaked into ${packagePath}`);
  }
  if (!source.startsWith("// octane-no-slot:")) {
    throw new Error(`Precompiled marker is missing from ${packagePath}`);
  }
  if (packagePath.startsWith("dist/server/") && /from\s*["']octane["']/.test(source)) {
    throw new Error(`Server output retained a client Octane runtime import: ${packagePath}`);
  }
}

for (const environment of ["client", "server"]) {
  const entry = readFileSync(join(distRoot, environment, "index.js"), "utf8");
  if (!/\bDiffView\b/.test(entry) || !/\bexport\s*\{/.test(entry)) {
    throw new Error(`${environment} entry does not expose DiffView.`);
  }
}

const declarationEntry = readFileSync(join(distRoot, "index.d.ts"), "utf8");
if (/from\s+["']@git-diff-view\/utils(?:\/[^"']*)?["']/.test(declarationEntry)) {
  throw new Error("Published declarations retained the private @git-diff-view/utils workspace import.");
}

const clientEntry = readFileSync(join(distRoot, "client/index.js"), "utf8");
const compiledHookRegions = [
  "src/hooks/useCallbackRef.ts",
  "src/hooks/useDomWidth.ts",
  "src/hooks/useUnmount.ts",
  "src/hooks/useUpdateEffect.ts",
];

for (const sourcePath of compiledHookRegions) {
  const start = clientEntry.indexOf(`//#region ${sourcePath}`);
  const end = clientEntry.indexOf("//#endregion", start);
  const region = start >= 0 && end > start ? clientEntry.slice(start, end) : "";
  if (!region.includes("hookSlots(") || !region.includes("_h$")) {
    throw new Error(`${sourcePath} lost compiler-assigned internal hook slots.`);
  }
}

for (const hook of [
  "useCallbackRef",
  "useDiffViewContext",
  "useDiffWidgetContext",
  "useDomWidth",
  "useUnmount",
  "useUpdateEffect",
]) {
  if (!new RegExp(`withSlot\\([^\\n;]*\\b${hook}\\b`).test(clientEntry)) {
    throw new Error(`${hook} lost its compiler-assigned call-site scope.`);
  }
}

console.log(
  "@git-diff-view/octane dist contains scoped hooks, client/server entries, declarations, styles, and no React runtime."
);
