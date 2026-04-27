import type { Cache } from "./cache";
import type { File } from "./file";

type GitDiffCache = Cache<string, File>[] | undefined;

declare global {
  const __DEV__: boolean;
  const __VERSION__: string;

  interface GlobalThis {
    "@git-diff-cache": GitDiffCache;
  }

  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";
    }
  }
}

export {};
