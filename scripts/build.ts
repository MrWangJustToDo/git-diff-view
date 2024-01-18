import { rollupBuild } from "project-tool/rollup";
import postcss from "rollup-plugin-postcss";
import tailwindcss from "tailwindcss";

const external = (id: string) => id.includes("node_modules") && !id.includes("tslib");

const start = async () => {
  await rollupBuild({ packageName: "core", packageScope: "packages", external: external });
  await rollupBuild({
    packageName: "react",
    packageScope: "packages",
    external: external,
    plugins: {
      multipleDevOther: ({ defaultPlugins, defaultPluginProps: { absolutePath } }) => [
        ...defaultPlugins,
        postcss({
          config: {
            path: "./postcss.config.js",
            ctx: "packages/react",
          },
          extract: "css/tailwind.css", // 'dist/tailwind.css
          extensions: [".css"],
          plugins: [tailwindcss({ content: [`${absolutePath}/src/**/*.{js,ts,jsx,tsx}`] })],
          minimize: true,
        }),
      ],
      multipleProdOther: ({ defaultPlugins, defaultPluginProps: { absolutePath } }) => [
        ...defaultPlugins,
        postcss({
          config: {
            path: "./postcss.config.js",
            ctx: "packages/react",
          },
          extract: "css/tailwind.css", // 'dist/tailwind.css
          extensions: [".css"],
          plugins: [tailwindcss({ content: [`${absolutePath}/src/**/*.{js,ts,jsx,tsx}`] })],
          minimize: true,
        }),
      ],
      singleOther: ({ defaultPlugins, defaultPluginProps: { absolutePath } }) => [
        ...defaultPlugins,
        postcss({
          config: {
            path: "./postcss.config.js",
            ctx: "packages/react",
          },
          extract: "css/tailwind.css", // 'dist/tailwind.css
          extensions: [".css"],
          plugins: [tailwindcss({ content: [`${absolutePath}/src/**/*.{js,ts,jsx,tsx}`] })],
          minimize: true,
        }),
      ],
    },
  });
  process.exit(0);
};

start();
