import { spawn } from "node:child_process";
import { rollupBuild } from "project-tool/rollup";
import { buildCss, buildType, copyCss, externalCorePackage, preSvelte, external } from "./utils";

const buildLowlight = async () => {
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
};

const buildShiki = async () => {
  await rollupBuild({ packageName: "shiki", packageScope: "packages", external: external });
  await buildType("shiki");
};

const buildUtils = async () => {
  await rollupBuild({ packageName: "utils", packageScope: "packages", external: externalCorePackage });
  await buildType("utils");
};

const buildCore = async () => {
  await rollupBuild({
    packageName: "core",
    packageScope: "packages",
    external: externalCorePackage,
  });
  await buildType("core");
};

const buildFile = async () => {
  await rollupBuild({
    packageName: "file",
    packageScope: "packages",
    external: externalCorePackage,
  });
  await buildType("file");
};

const buildReact = async () => {
  await rollupBuild({
    packageName: "react",
    packageScope: "packages",
    external: external,
  });
  await buildCss("react");
  await buildType("react");
  await copyCss("react", "diff-view.css");
  await copyCss("react", "diff-view-pure.css");
};

const buildCli = async () => {
  await rollupBuild({
    packageName: "cli",
    packageScope: "packages",
    external: external,
  });
};

const buildSolid = async () => {
  await new Promise<void>((r, j) => {
    const ls = spawn(`cd packages/solid && pnpm run build`, { shell: true, stdio: "inherit" });
    ls.on("close", () => r());
    ls.on("error", (e) => j(e));
  });
  await buildCss("solid");
  await buildType("solid");
  await copyCss("solid", "diff-view.css");
  await copyCss("solid", "diff-view-pure.css");
};

const buildSvelte = async () => {
  await preSvelte();
  await new Promise<void>((r, j) => {
    const ls = spawn(`cd packages/svelte && pnpm run build`, { shell: true, stdio: "inherit" });
    ls.on("close", () => r());
    ls.on("error", (e) => j(e));
  });
  await buildCss("svelte");
  await copyCss("svelte", "diff-view.css");
  await copyCss("svelte", "diff-view-pure.css");
};

const buildVue = async () => {
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
};

const start = async () => {
  await buildLowlight();
  await buildShiki();
  await buildUtils();
  await buildCore();
  await buildFile();
  await buildCli();
  await buildReact();
  await buildSolid();
  await buildSvelte();
  await buildVue();
  process.exit(0);
};

start();

// buildShiki();

// buildCli();

// buildSvelte();
