import { spawn } from "child_process";
import { mkdir, readdir, readFile, rm, writeFile } from "fs/promises";
import { resolve } from "path";

export const copyDir = async (srcDir: string, tarDir: string) => {
  const srcPath = resolve(process.cwd(), "packages", srcDir);
  const tarPath = resolve(process.cwd(), "packages", tarDir);
  await mkdir(tarPath, { recursive: true }).catch(() => void 0);
  const files = await readdir(srcPath);
  for (const file of files) {
    if (file.endsWith("index.ts")) continue;
    const srcFilePath = resolve(srcPath, file);
    const tarFilePath = resolve(tarPath, file);
    await writeFile(tarFilePath, await readFile(srcFilePath));
  }
};

export const externalCorePackage = (id: string) =>
  (id.includes("node_modules") || (id.includes("@git-diff-view/") && !id.endsWith("@git-diff-view/utils"))) &&
  !id.includes("tslib");

export const external = (id: string) =>
  (id.includes("node_modules") || (id.includes("@git-diff-view/") && !id.endsWith("@git-diff-view/utils"))) &&
  !id.includes("tslib") &&
  !id.endsWith(".css");

// fix css path not found in legacy module bundler
export const copyCss = async (packageName: string, file: string) => {
  const cssPath = resolve(process.cwd(), "packages", packageName, "dist", "css", file);
  const cssContent = await readFile(cssPath, "utf-8");
  const legacyCssDirPath = resolve(process.cwd(), "packages", packageName, "styles");
  await mkdir(legacyCssDirPath).catch(() => void 0);
  const cssDistPath = resolve(legacyCssDirPath, file);
  await writeFile(cssDistPath, cssContent);
};

export const clean = async (packageName: string) => {
  const typePath = resolve(process.cwd(), "packages", packageName, "index.d.ts");
  const content = await readFile(typePath, "utf-8");
  await writeFile(typePath, content.replace(/#private;/g, ""));
};

export const clear = async (packageName: string) => {
  const typeDirs = resolve(process.cwd(), "packages", packageName, "dist", "types");
  await rm(typeDirs, { recursive: true, force: true });
};

export const buildType = async (packageName: string) => {
  await new Promise<void>((r, j) => {
    const ls = spawn(`cd packages/${packageName} && pnpm run gen:type`, { shell: true, stdio: "inherit" });
    ls.on("close", () => r());
    ls.on("error", (e) => j(e));
  });
  await clean(packageName);
  await clear(packageName);
};

export const buildCss = async (packageName: string) => {
  await new Promise<void>((r, j) => {
    const ls = spawn(`cd packages/${packageName} && pnpm run gen:css`, { shell: true, stdio: "inherit" });
    ls.on("close", () => r());
    ls.on("error", (e) => j(e));
  });
};

export const preSvelte = async () => await copyDir("utils/src", "svelte/src/lib/utils");
