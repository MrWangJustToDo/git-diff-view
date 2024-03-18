declare global {
  const __DEV__: boolean;
  const __VERSION__: string;

  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";
    }
  }

  export type DePromise<T> = T extends Promise<infer U> ? U : T;
}

export {};
