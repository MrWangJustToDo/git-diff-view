import { defineConfig, loadEnv } from "vite";

import type { UserConfig } from "vite";

// https://vitejs.dev/config/
//
// React implementation switch (no code edit required). @my-react/react is the
// default; the official react is used only when explicitly requested:
//
//   pnpm dev:react                 # @my-react/react (default)
//   MY_REACT=0 pnpm dev:react      # official react
//
// It also works by putting `MY_REACT=0` into an `.env` / `.env.local` file
// inside `ui/react-example`.
//
// When @my-react is enabled, `@my-react/react-vite` injects the
// `react` -> `@my-react/react` and `react-dom` -> `@my-react/react-dom` resolve
// aliases, so the source keeps importing from "react" as usual.
//
// The resolved flag is also exposed to the app as the `__MY_REACT__`
// compile-time constant, so components can opt-in to @my-react-only features.
export default defineConfig(async ({ mode }): Promise<UserConfig> => {
  const env = { ...loadEnv(mode, process.cwd(), ""), ...process.env };

  const myReactEnv = (env.MY_REACT ?? "").trim().toLowerCase();

  // @my-react is the default; only `0 / false / no / off` opts out.
  const useMyReact = !/^(0|false|no|off)$/.test(myReactEnv);

  const react = useMyReact
    ? (await import("@my-react/react-vite")).default
    : (await import("@vitejs/plugin-react")).default;

  console.log(`[react-example] React implementation: ${useMyReact ? "@my-react/react" : "react"}`);

  return {
    base: "/git-diff-view/",
    define: {
      __MY_REACT__: JSON.stringify(useMyReact),
    },
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
  };
});
