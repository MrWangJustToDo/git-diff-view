import path from "node:path";
import dts from "rollup-plugin-dts";

export default {
  input: path.resolve("dist/types/index.d.ts"),
  plugins: [dts({ includeExternal: ["@git-diff-view/utils"] })],
  // Reason: shared utils are not a published runtime dependency of the adapter,
  // so their declarations must be bundled just like the existing React adapter.
  external: [/^octane(?:\/.*)?$/, /^reactivity-store(?:\/.*)?$/, /^@git-diff-view\/core(?:\/.*)?$/],
  output: {
    file: "dist/index.d.ts",
    format: "es",
  },
};
