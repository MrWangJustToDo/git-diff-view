import { File } from ".";

declare global {
  const __DEV__: boolean;
  const __VERSION__: string;

  interface globalThis {
    __diff_cache__: Map<string, File>;
  }

  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";
    }
  }
}

export {};
