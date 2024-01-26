import { type Ref, watchPostEffect } from "vue";

import { useId } from "../context";

import { useIsMounted } from "./useIsMounted";

export const useSyncHeight = ({
  selector,
  side,
  enable,
}: {
  selector: Ref<string>;
  side: Ref<string>;
  enable: Ref<boolean>;
}) => {
  const id = useId();

  const isMounted = useIsMounted();

  const observeHeight = (onCancel: (cb: () => void) => void) => {
    if (!isMounted.value) return;

    if (enable.value) {
      const container = document.querySelector(`#diff-root${id.value}`);

      const elements = Array.from(container?.querySelectorAll(selector.value));

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

        const observer = new ResizeObserver(cb);

        cb();

        const target = ele1.getAttribute("data-side") === side.value ? ele1 : ele2;

        observer.observe(target);

        onCancel(() => observer.disconnect());
      }
    }
  };

  watchPostEffect(observeHeight);
};
