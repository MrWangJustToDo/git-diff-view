import { useEffect, useState } from "react";

import { useDiffViewContext } from "..";

export const useDomWidth = ({ selector, enable }: { selector: string; enable: boolean }) => {
  const [width, setWidth] = useState(0);

  const { id } = useDiffViewContext();

  useEffect(() => {
    if (enable) {
      const container = document.querySelector(`#diff-root${id}`);

      const wrapper = container?.querySelector(selector);

      const cb = () => {
        const rect = wrapper?.getBoundingClientRect();
        setWidth(rect?.width ?? 0);
      };

      const observer = new ResizeObserver(cb);

      cb();

      if (wrapper) {
        observer.observe(wrapper);

        return () => observer.disconnect();
      }
    }
  }, [selector, enable, id]);

  return width;
};
