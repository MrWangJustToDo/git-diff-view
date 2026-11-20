import { useEffect, useRef } from "octane";

export const useUnmount = (cb: () => void, deps: any[]) => {
  const ref = useRef(cb);

  ref.current = cb;

  useEffect(() => ref.current, deps);
};
