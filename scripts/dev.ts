import { rollupWatch } from "project-tool/rollup";
import alias from "@rollup/plugin-alias";

const external = (id: string) => id.includes("node_modules") && !id.includes("tslib") && !id.includes("reactivity-store") && !id.includes("use-sync-external-store") && !id.includes("vue");

const start = async () => {
  await rollupWatch({
    packageName: "cli",
    packageScope: "packages",
    external: external,
    plugins: {
      singleOther({ defaultPlugins }) {
        return [
          ...defaultPlugins,
          alias({
            entries: [
              { find: "react", replacement: "@my-react/react" },
              { find: "ink", replacement: "@my-react/react-terminal" },
            ],
          }),
        ];
      },
    },
  });
  // await rollupWatch({ packageName: "shiki", packageScope: "packages", external: external });
};

start();
