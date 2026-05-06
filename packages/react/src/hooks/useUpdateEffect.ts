import { useEffect, useRef } from "react";

import type { DependencyList, EffectCallback } from "react";

export const useUpdateEffect = (effect: EffectCallback, deps: DependencyList) => {
  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) {
      return effect();
    }
    isMounted.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
