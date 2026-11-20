import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import ts from "typescript";

const packageRoot = resolve(import.meta.dirname, "..");
const sourceRoot = join(packageRoot, "src");
const outputFlag = process.argv.indexOf("--out-dir");
const outputRoot = outputFlag === -1 ? null : resolve(packageRoot, process.argv[outputFlag + 1] ?? "");

if (!outputRoot) {
  throw new Error("generate-tsrx-types requires --out-dir <directory>.");
}

function filesUnder(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(file) : [file];
  });
}

function rewriteRelativeSpecifiers(source, transform) {
  return source.replace(
    /(\b(?:from\s*|import\s*\(\s*|require\s*\(\s*)["'])(\.{1,2}\/[^"']+)(["'])/g,
    (_match, before, specifier, after) => `${before}${transform(specifier)}${after}`
  );
}

const sources = filesUnder(sourceRoot).filter(
  (file) => (file.endsWith(".ts") || file.endsWith(".tsrx")) && !file.endsWith(".d.ts")
);
const temporaryRoot = mkdtempSync(join(tmpdir(), "git-diff-view-octane-types-"));
const temporarySource = join(temporaryRoot, "src");
const temporaryOutput = join(temporaryRoot, "out");

try {
  symlinkSync(join(packageRoot, "node_modules"), join(temporaryRoot, "node_modules"), "dir");

  for (const file of sources) {
    const relativePath = relative(sourceRoot, file).replace(/\.tsrx$/, ".tsx");
    const target = join(temporarySource, relativePath);
    const source = rewriteRelativeSpecifiers(readFileSync(file, "utf8"), (specifier) =>
      specifier.endsWith(".tsrx") ? specifier.replace(/\.tsrx$/, ".tsx") : specifier
    );
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, source);
  }

  const roots = sources.map((file) => join(temporarySource, relative(sourceRoot, file).replace(/\.tsrx$/, ".tsx")));
  const program = ts.createProgram(roots, {
    declaration: true,
    emitDeclarationOnly: true,
    esModuleInterop: true,
    jsx: ts.JsxEmit.ReactJSX,
    jsxImportSource: "octane",
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    noCheck: true,
    outDir: temporaryOutput,
    preserveSymlinks: true,
    rootDir: temporarySource,
    skipLibCheck: true,
    strictNullChecks: true,
    target: ts.ScriptTarget.ESNext,
  });
  const result = program.emit();
  if (result.emitSkipped) {
    const diagnostics = [...ts.getPreEmitDiagnostics(program), ...result.diagnostics]
      .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"))
      .join("\n");
    throw new Error(`TypeScript skipped @git-diff-view/octane declaration generation.\n${diagnostics}`);
  }

  for (const source of sources) {
    const sourcePath = relative(sourceRoot, source).replace(/\.tsrx$/, ".tsx");
    const emitted = join(temporaryOutput, sourcePath.replace(/\.(?:ts|tsx)$/, ".d.ts"));
    const destination = join(outputRoot, sourcePath.replace(/\.(?:ts|tsx)$/, ".d.ts"));
    const declaration = rewriteRelativeSpecifiers(readFileSync(emitted, "utf8"), (specifier) =>
      specifier.replace(/\.(?:ts|tsx)$/, ".js")
    ).replace(/[ \t]+$/gm, "");
    mkdirSync(dirname(destination), { recursive: true });
    writeFileSync(destination, declaration);
  }

  console.log(`Generated declarations for ${sources.length} Octane modules.`);
} finally {
  rmSync(temporaryRoot, { force: true, recursive: true });
}
