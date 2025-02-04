import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { rollupBuild } from "project-tool/rollup";

const externalCorePackage = (id: string) =>
  (id.includes("node_modules") || id.includes("@git-diff-view/")) && !id.includes("tslib");

const external = (id: string) =>
  (id.includes("node_modules") || (id.includes("@git-diff-view/") && !id.endsWith("@git-diff-view/utils"))) &&
  !id.includes("tslib") &&
  !id.endsWith(".css");

// fix css path not found in legacy module bundler
const copyCss = async (packageName: string, file: string) => {
  const cssPath = resolve(process.cwd(), "packages", packageName, "dist", "css", file);
  const cssContent = await readFile(cssPath, "utf-8");
  const legacyCssDirPath = resolve(process.cwd(), "packages", packageName, "styles");
  await mkdir(legacyCssDirPath).catch(() => void 0);
  const cssDistPath = resolve(legacyCssDirPath, file);
  await writeFile(cssDistPath, cssContent);
};

const clean = async (packageName: string) => {
  const typePath = resolve(process.cwd(), "packages", packageName, "index.d.ts");
  const content = await readFile(typePath, "utf-8");
  await writeFile(typePath, content.replace(/#private;/g, ""));
};

const clear = async (packageName: string) => {
  const typeDirs = resolve(process.cwd(), "packages", packageName, "dist", "types");
  await rm(typeDirs, { recursive: true, force: true });
};

const buildType = async (packageName: string) => {
  await new Promise<void>((r, j) => {
    const ls = spawn(`cd packages/${packageName} && pnpm run gen:type`, { shell: true, stdio: "inherit" });
    ls.on("close", () => r());
    ls.on("error", (e) => j(e));
  });
  await clean(packageName);
  if (packageName === "vue") return;
  await clear(packageName);
};

const buildCss = async (packageName: string) => {
  await new Promise<void>((r, j) => {
    const ls = spawn(`cd packages/${packageName} && pnpm run gen:css`, { shell: true, stdio: "inherit" });
    ls.on("close", () => r());
    ls.on("error", (e) => j(e));
  });
};

const start = async () => {
  await rollupBuild({
    packageName: "lowlight",
    packageScope: "packages",
    external: {
      generateExternal: (type) => {
        if (type === "singleOther") {
          return (id: string) => id.includes("node_modules") && !id.includes("tslib");
        } else {
          return (id: string) =>
            id.includes("node_modules") && !id.includes("lowlight") && !id.includes("devlop") && !id.includes("tslib");
        }
      },
    },
  });
  await buildType("lowlight");
  await rollupBuild({ packageName: "shiki", packageScope: "packages", external: external });
  await buildType("shiki");
  await rollupBuild({ packageName: "utils", packageScope: "packages", external: externalCorePackage });
  await buildType("utils");
  await rollupBuild({
    packageName: "core",
    packageScope: "packages",
    external: externalCorePackage,
  });
  await buildType("core");
  await rollupBuild({
    packageName: "file",
    packageScope: "packages",
    external: externalCorePackage,
  });
  await buildType("file");
  await rollupBuild({
    packageName: "react",
    packageScope: "packages",
    external: external,
  });
  await buildCss("react");
  await buildType("react");
  await copyCss("react", "diff-view.css");
  await copyCss("react", "diff-view-pure.css");
  // 对于 "jsx": "preserve" 最新的rollup已经不支持解析，因此使用vite来进行打包
  // https://github.com/rollup/plugins/issues/72
  // https://rollupjs.org/migration/#configuration-changes
  await new Promise<void>((r, j) => {
    const ls = spawn(`cd packages/vue && pnpm run build`, { shell: true, stdio: "inherit" });
    ls.on("close", () => r());
    ls.on("error", (e) => j(e));
  });
  await buildCss("vue");
  await buildType("vue");
  await copyCss("vue", "diff-view.css");
  await copyCss("vue", "diff-view-pure.css");
  process.exit(0);
};

// start();

// (async () => {
//   await buildCss('react');
//   await buildCss('vue');
// })();

// (async () => {
//   await rollupBuild({ packageName: "utils", packageScope: "packages", external: externalCorePackage });
//   await buildType("utils");
// })();
