import { rollupWatch } from "project-tool/rollup";

const external = (id: string) => id.includes("node_modules") && !id.includes("tslib") && !id.endsWith(".css");

const start = async () => {
  await rollupWatch({
    packageName: "react",
    packageScope: "packages",
    external: external,
  });
  // await rollupWatch({ packageName: "shiki", packageScope: "packages", external: external });
};

start();
