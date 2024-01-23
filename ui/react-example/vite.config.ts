import react from "@my-react/react-vite";
// import react from '@vitejs/plugin-react'
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  base: '/git-diff-view/',
  plugins: [react()],
});
