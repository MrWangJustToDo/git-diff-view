/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { useCallback, useRef } from "react";

export const useCallbackRef = <T extends Function>(cb?: T) => {
  const cbRef = useRef(cb);

  // eslint-disable-next-line react-hooks/refs
  cbRef.current = cb;

  return useCallback((...args: any[]) => {
    return cbRef.current?.(...args);
  }, []) as unknown as T;
};
