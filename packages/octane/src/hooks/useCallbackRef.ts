/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { useCallback, useRef } from "octane";

export const useCallbackRef = <T extends Function>(cb?: T) => {
  const cbRef = useRef(cb);

  cbRef.current = cb;

  return useCallback((...args: any[]) => {
    return cbRef.current?.(...args);
  }, []) as unknown as T;
};
