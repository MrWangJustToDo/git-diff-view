import { createEffect, createSignal, onCleanup, type Accessor } from "solid-js";

import { useId } from "./useId";
import { useIsMounted } from "./useIsMounted";

export type ObserveElement = HTMLElement & {
  __observeCallback?: Set<() => void>;
  __observeInstance?: ResizeObserver;
};

export const useDomWidth = ({ selector, enable }: { selector: Accessor<string>; enable: Accessor<boolean> }) => {
  const id = useId();

  const mounted = useIsMounted();

  const [width, setWidth] = createSignal(0);

  const observeWidth = () => {
    if (!mounted()) return;

    if (enable()) {
      const container = document.querySelector(`#diff-root${id()}`);

      const wrapper = container?.querySelector(selector());

      if (!wrapper) return;

      const typedWrapper = wrapper as ObserveElement;

      const cb = () => {
        const rect = wrapper?.getBoundingClientRect();
        setWidth(rect?.width ?? 0);
      };

      cb();

      const cleanCb = () => {
        typedWrapper?.__observeCallback?.delete(cb);
        if (typedWrapper?.__observeCallback?.size === 0) {
          typedWrapper.__observeInstance?.disconnect();
          typedWrapper.removeAttribute("data-observe");
          delete typedWrapper.__observeCallback;
          delete typedWrapper.__observeInstance;
        }
      };

      if (typedWrapper.__observeCallback) {
        typedWrapper.__observeCallback.add(cb);

        onCleanup(() => cleanCb());

        return;
      }

      typedWrapper.__observeCallback = new Set();

      typedWrapper.__observeCallback.add(cb);

      const observer = new ResizeObserver(() => typedWrapper?.__observeCallback?.forEach?.((cb) => cb()));

      typedWrapper.__observeInstance = observer;

      observer.observe(typedWrapper);

      typedWrapper.setAttribute("data-observe", "height");

      onCleanup(() => cleanCb());
    }
  };

  createEffect(observeWidth)

  return width;
};
