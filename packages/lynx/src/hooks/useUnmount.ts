import { useEffect } from "@lynx-js/react";

export const useUnmount = (fn: () => void, deps: unknown[]) => {
  useEffect(() => {
    return () => {
      fn();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
