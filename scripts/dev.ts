import { rollupWatch } from "project-tool/rollup";
import postcss from "rollup-plugin-postcss";
import tailwindcss from "tailwindcss";

const external = (id: string) => id.includes("node_modules") && !id.includes("tslib") && !id.endsWith(".css");

const start = async () => {
  await rollupWatch({
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
};

start();
