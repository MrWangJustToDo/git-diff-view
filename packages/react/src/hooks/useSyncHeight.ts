import { useCallback, useEffect } from "react";

import { useDiffViewContext } from "../components/DiffViewContext";

// TODO
export const useSyncHeight = ({
  selector,
  wrapper,
  side,
  enable,
}: {
  selector: string;
  wrapper?: string;
  side: string;
  enable: boolean;
}) => {
  const { useDiffContext } = useDiffViewContext();

  const id = useDiffContext(useCallback((s) => s.id, []));

  useEffect(() => {
    if (enable) {
      let clean = () => {};
      // fix the dom delay update
      const timer = setTimeout(() => {
        const container = document.querySelector(`#diff-root${id}`);

        const elements = Array.from(container?.querySelectorAll(selector) || []);

        const wrappers = wrapper ? Array.from(container?.querySelectorAll(wrapper) || []) : elements;

        if (elements.length === 2 && wrappers.length === 2) {
          const ele1 = elements[0] as HTMLElement;
          const ele2 = elements[1] as HTMLElement;

          const wrapper1 = wrappers[0] as HTMLElement;
          const wrapper2 = wrappers[1] as HTMLElement;

          const target = ele1.getAttribute("data-side") === side ? ele1 : ele2;

          const cb = () => {
            ele1.style.height = "auto";
            ele2.style.height = "auto";
            const rect1 = ele1.getBoundingClientRect();
            const rect2 = ele2.getBoundingClientRect();
            const maxHeight = Math.max(rect1.height, rect2.height);
            wrapper1.style.height = maxHeight + "px";
            wrapper2.style.height = maxHeight + "px";
            wrapper1.setAttribute("data-sync-height", String(maxHeight));
            wrapper2.setAttribute("data-sync-height", String(maxHeight));
          };

          cb();

          const observer = new ResizeObserver(cb);

          observer.observe(target);

          target.setAttribute("data-observe", "height");

          clean = () => {
            observer.disconnect();
            target?.removeAttribute("data-observe");
          };
        }
      });

      return () => {
        clean();
        clearTimeout(timer);
      };
    }
  }, [selector, enable, side, id, wrapper]);
};
