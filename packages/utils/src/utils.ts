// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export const memoFunc = <T extends Function>(func: T): T => {
  const cache = {};
  return ((key: string) => {
    if (cache[key]) {
      return cache[key];
    }
    const result = func(key);
    cache[key] = result;
    return result;
  }) as unknown as T;
};
