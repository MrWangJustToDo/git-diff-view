import devtools from "solid-devtools/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid(), devtools({ autoname: true })],
  worker: {
    format: "es",
  },
});
