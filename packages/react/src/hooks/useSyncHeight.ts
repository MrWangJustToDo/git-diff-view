import { useCallback } from "react";

import { useDiffViewContext } from "../components/DiffViewContext";

import { useSafeLayout } from "./useSafeLayout";

export const useSyncHeight = ({
  selector,
  side,
  enable,
}: {
  selector: string;
  side: string;
  enable: boolean;
}) => {
  const { useDiffContext } = useDiffViewContext();

  const id = useDiffContext(useCallback((s) => s.id, []));

  useSafeLayout(() => {
    if (enable) {
      const container = document.querySelector(`#diff-root${id}`);

      const elements = Array.from(container?.querySelectorAll(selector) || []);

      if (elements.length === 2) {
        const ele1 = elements[0] as HTMLElement;
        const ele2 = elements[1] as HTMLElement;

        const cb = () => {
          ele1.style.height = "auto";
          ele2.style.height = "auto";
          const rect1 = ele1.getBoundingClientRect();
          const rect2 = ele2.getBoundingClientRect();
          if (rect1.height !== rect2.height) {
            const maxHeight = Math.max(rect1.height, rect2.height);
            ele1.style.height = maxHeight + "px";
            ele2.style.height = maxHeight + "px";
            ele1.setAttribute("data-sync-height", String(maxHeight));
            ele2.setAttribute("data-sync-height", String(maxHeight));
          } else {
            ele1.removeAttribute("data-sync-height");
            ele2.removeAttribute("data-sync-height");
          }
        };

        cb();

        const observer = new ResizeObserver(cb);

        const target = ele1.getAttribute("data-side") === side ? ele1 : ele2;

        observer.observe(target);

        target.setAttribute("data-observe", "height");

        return () => {
          observer.disconnect();
          target?.removeAttribute("data-observe");
        };
      }
    }
  }, [selector, enable, side, id]);
};
