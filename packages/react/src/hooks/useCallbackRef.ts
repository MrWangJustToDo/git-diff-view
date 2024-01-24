/* eslint-disable @typescript-eslint/ban-types */
import { useCallback, useRef } from "react";

export const useCallbackRef = <T extends Function>(cb?: T): T => {
  const cbRef = useRef(cb);

  cbRef.current = cb;

  const stableCallback = useCallback((...args: any[]) => {
    if (args.length) {
      return cbRef.current?.(...args);
    } else {
      return cbRef.current?.();
    }
  }, []) as unknown as T;

  return stableCallback;
};
