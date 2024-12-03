import { createSSRApp } from "vue";

import "@git-diff-view/vue/styles/diff-view.css";

import App from "./App.vue";

// SSR requires a fresh app instance per request, therefore we export a function
// that creates a fresh app instance. If using Vuex, we'd also be creating a
// fresh store here.
export function createApp() {
  const app = createSSRApp(App);
  return { app };
}
