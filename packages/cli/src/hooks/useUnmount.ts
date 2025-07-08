import { useEffect, useRef } from "react";

export const useUnmount = (cb: () => void, deps: any[]) => {
  const ref = useRef(cb);

  ref.current = cb;

  useEffect(() => ref.current, deps);
};
