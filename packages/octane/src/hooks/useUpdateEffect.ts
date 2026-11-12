import { useEffect, useRef } from "octane";

type DependencyList = unknown[];
type EffectCallback = () => void | (() => void);

export const useUpdateEffect = (effect: EffectCallback, deps: DependencyList) => {
  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) {
      return effect();
    }
    isMounted.current = true;
  }, deps);
};
