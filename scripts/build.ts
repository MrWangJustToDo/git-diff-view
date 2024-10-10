import { spawn } from "node:child_process";
import { readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { rollupBuild } from "project-tool/rollup";
import postcss from "rollup-plugin-postcss";
import tailwindcss from "tailwindcss";

const externalCorePackage = (id: string) =>
  (id.includes("node_modules") || id.includes("@git-diff-view/")) && !id.includes("tslib");

const external = (id: string) =>
  (id.includes("node_modules") || id.includes("@git-diff-view/")) && !id.includes("tslib") && !id.endsWith(".css");

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
    plugins: {
      multipleDevOther: ({ defaultPlugins, defaultPluginProps: { absolutePath } }) => [
        ...defaultPlugins,
        postcss({
          config: {
            path: absolutePath + "/postcss.config.js",
            ctx: {},
          },
          extract: "css/diff-view.css",
          extensions: [".css"],
          plugins: [
            tailwindcss({
              content: [`${absolutePath}/src/**/*.{js,ts,jsx,tsx}`],
            }),
          ],
          minimize: true,
        }),
      ],
      multipleProdOther: ({ defaultPlugins, defaultPluginProps: { absolutePath } }) => [
        ...defaultPlugins,
        postcss({
          config: {
            path: absolutePath + "/postcss.config.js",
            ctx: {},
          },
          extract: "css/diff-view.css",
          extensions: [".css"],
          plugins: [
            tailwindcss({
              content: [`${absolutePath}/src/**/*.{js,ts,jsx,tsx}`],
            }),
          ],
          minimize: true,
        }),
      ],
      singleOther: ({ defaultPlugins, defaultPluginProps: { absolutePath } }) => [
        ...defaultPlugins,
        postcss({
          config: {
            path: absolutePath + "/postcss.config.js",
            ctx: {},
          },
          extract: "css/diff-view.css",
          extensions: [".css"],
          plugins: [
            tailwindcss({
              content: [`${absolutePath}/src/**/*.{js,ts,jsx,tsx}`],
            }),
          ],
          minimize: true,
        }),
      ],
    },
  });
  await buildType("react");
  // 对于 "jsx": "preserve" 最新的rollup已经不支持解析，因此使用vite来进行打包
  // https://github.com/rollup/plugins/issues/72
  // https://rollupjs.org/migration/#configuration-changes
  await new Promise<void>((r, j) => {
    const ls = spawn(`cd packages/vue && pnpm run build`, { shell: true, stdio: "inherit" });
    ls.on("close", () => r());
    ls.on("error", (e) => j(e));
  });
  await buildType("vue");
  process.exit(0);
};

start();
