import { defineConfig } from "vite";
// import react from '@vitejs/plugin-react'
import react from "@my-react/react-vite";

// https://vitejs.dev/config/
export default defineConfig({
  base: '/git-diff-view/',
  plugins: [react()],
});
