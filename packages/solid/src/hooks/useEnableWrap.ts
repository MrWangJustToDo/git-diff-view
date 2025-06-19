import { createEffect, createSignal, onCleanup, useContext } from "solid-js";

import { DiffViewContext } from "../components/DiffViewContext";

export const useEnableWrap = () => {
  const reactiveHook = useContext(DiffViewContext);

  const [enableWrap, setEnableWrap] = createSignal(reactiveHook?.getReadonlyState().enableWrap);

  createEffect(() => {
    const unsubscribe = reactiveHook?.subscribe(
      (s) => s.enableWrap,
      () => {
        setEnableWrap(reactiveHook.getReadonlyState().enableWrap);
      }
    );

    onCleanup(() => unsubscribe?.());
  });

  return enableWrap;
};
