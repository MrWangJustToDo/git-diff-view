import { createEffect, onCleanup, type Accessor } from "solid-js";

import { useId } from "./useId";
import { useIsMounted } from "./useIsMounted";

export const useSyncHeight = ({
  selector,
  wrapper,
  side,
  enable,
}: {
  selector: Accessor<string>;
  wrapper: Accessor<string>;
  side: Accessor<string>;
  enable: Accessor<boolean>;
}) => {
  const id = useId();

  const isMounted = useIsMounted();

  const observeHeight = () => {
    if (!isMounted()) return;

    if (enable()) {
      let clean = () => {};

      const timer = setTimeout(() => {
        const container = document.querySelector(`#diff-root${id()}`);

        const elements = Array.from(container?.querySelectorAll(selector()) || []);

        const wrappers = Array.from(container?.querySelectorAll(wrapper()) || []);

        if (elements.length === 2 && wrappers.length === 2) {
          const ele1 = elements[0] as HTMLElement;
          const ele2 = elements[1] as HTMLElement;

          const wrapper1 = wrappers[0] as HTMLElement;
          const wrapper2 = wrappers[1] as HTMLElement;

          const target = ele1.getAttribute("data-side") === side() ? ele1 : ele2;

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

      onCleanup(() => {
        clean();
        clearTimeout(timer);
      });
    }
  };

  createEffect(observeHeight);
};
