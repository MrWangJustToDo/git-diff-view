import react from "@my-react/react-vite";
// import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
// import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/git-diff-view/",
  plugins: [react()],
  worker: {
    format: "es",
  },
  resolve: {
    alias: {
      ink: "@my-react/react-terminal/web",
    },
    dedupe: ["@my-react/react-terminal/web", "ink", "@my-react/react-terminal", "ink/web"],
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "es2022",
    },
  },
  build: {
    sourcemap: true,
    target: "es2022",
  },
});
