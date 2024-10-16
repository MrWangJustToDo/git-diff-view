import react from "@my-react/react-vite";
// import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/git-diff-view/",
  plugins: [react(), tsconfigPaths({ root: "./" })],
  worker: {
    format: "es",
  },
  build: {
    sourcemap: true,
    target: "es2015",
  },
});
