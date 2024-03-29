import { spawn } from "node:child_process";
import { rollupBuild } from "project-tool/rollup";
import postcss from "rollup-plugin-postcss";
import tailwindcss from "tailwindcss";

const externalLowlight = (id: string) =>
  id.includes("node_modules") &&
  // !id.includes("lowlight") &&
  // !id.includes("highlight.js") &&
  // !id.includes("devlop") &&
  !id.includes("tslib");

const externalCorePackage = (id: string) => id.includes("node_modules") && !id.includes("tslib");

const external = (id: string) => id.includes("node_modules") && !id.includes("tslib") && !id.endsWith(".css");

const start = async () => {
  await rollupBuild({ packageName: "lowlight", packageScope: "packages", external: externalLowlight });
  await rollupBuild({ packageName: "shiki", packageScope: "packages", external: external });
  await rollupBuild({ packageName: "core", packageScope: "packages", external: externalCorePackage });
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
              plugins: [require("tailwind-scrollbar-hide")],
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
              plugins: [require("tailwind-scrollbar-hide")],
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
              plugins: [require("tailwind-scrollbar-hide")],
            }),
          ],
          minimize: true,
        }),
      ],
    },
  });
  // 对于 "jsx": "preserve" 最新的rollup已经不支持解析，因此使用vite来进行打包
  // https://github.com/rollup/plugins/issues/72
  // https://rollupjs.org/migration/#configuration-changes
  await new Promise<void>((r, j) => {
    const ls = spawn(`cd packages/vue && pnpm run build`, { shell: true, stdio: "inherit" });
    ls.on("close", () => r());
    ls.on("error", (e) => j(e));
  });
  process.exit(0);
};

start();
