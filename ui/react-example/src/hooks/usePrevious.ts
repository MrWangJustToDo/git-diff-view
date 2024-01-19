import { useEffect, useRef } from "react";

export const usePrevious = <T>(v: T) => {
  const ref = useRef(v);

  useEffect(() => {
    ref.current = v;
  }, [v]);

  return ref.current;
};
