import path from "node:path";
import dts from "rollup-plugin-dts";

export default {
  input: path.resolve("dist/types/index.d.ts"),
  plugins: [dts({ respectExternal: false })],
  external: [/^octane(?:\/.*)?$/, /^reactivity-store(?:\/.*)?$/, /^@git-diff-view(?:\/.*)?$/],
  output: {
    file: "dist/index.d.ts",
    format: "es",
  },
};
