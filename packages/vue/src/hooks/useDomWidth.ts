import { getElementRoot } from "@git-diff-view/utils";
import { ref, watchPostEffect } from "vue";

import { useDom, useId, useIsMounted } from "../context";

import type { Ref } from "vue";

export type ObserveElement = HTMLElement & {
  __observeCallback: Set<() => void>;
  __observeInstance: ResizeObserver;
};

export const useDomWidth = ({ selector, enable }: { selector: Ref<string>; enable: Ref<boolean> }) => {
  const id = useId();

  const dom = useDom();

  const mounted = useIsMounted();

  const width = ref(0);

  const observeWidth = (onCancel: (cb: () => void) => void) => {
    if (!mounted.value) return;

    if (enable.value) {
      const rootDocument = getElementRoot(dom.value);

      const container = rootDocument.querySelector(`#diff-root${id.value}`);

      const wrapper = container?.querySelector(selector.value);

      if (!wrapper) return;

      const typedWrapper = wrapper as ObserveElement;

      const cb = () => {
        const rect = wrapper?.getBoundingClientRect();
        width.value = rect?.width ?? 0;
      };

      cb();

      const cleanCb = () => {
        typedWrapper.__observeCallback.delete(cb);
        if (typedWrapper.__observeCallback.size === 0) {
          typedWrapper.__observeInstance?.disconnect();
          typedWrapper.removeAttribute("data-observe");
          delete typedWrapper.__observeCallback;
          delete typedWrapper.__observeInstance;
        }
      };

      if (typedWrapper.__observeCallback) {
        typedWrapper.__observeCallback.add(cb);

        onCancel(() => cleanCb());

        return;
      }

      typedWrapper.__observeCallback = new Set();

      typedWrapper.__observeCallback.add(cb);

      const observer = new ResizeObserver(() => typedWrapper.__observeCallback.forEach((cb) => cb()));

      typedWrapper.__observeInstance = observer;

      observer.observe(typedWrapper);

      typedWrapper.setAttribute("data-observe", "height");

      onCancel(() => cleanCb());
    }
  };

  watchPostEffect((onCancel) => observeWidth(onCancel));

  return width;
};
