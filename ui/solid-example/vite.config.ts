import { defineConfig } from "vite";
import inspect from "vite-plugin-inspect";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid(), inspect()],
});
