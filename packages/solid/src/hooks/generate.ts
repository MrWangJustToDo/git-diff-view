import { createEffect, createSignal, onCleanup } from "solid-js";

import { useDiffViewContext } from "../components/DiffViewContext";

import type { createDiffConfigStore } from "../components/tools";

type AllKey = keyof ReturnType<ReturnType<typeof createDiffConfigStore>["getReadonlyState"]>;

type Data = ReturnType<ReturnType<typeof createDiffConfigStore>["getReadonlyState"]>;

export const generateHook = <T extends AllKey, K extends Data[T] = Data[T]>(key: T) => {
  return () => {
    const reactiveHook = useDiffViewContext();

    const [state, setState] = createSignal<K>(reactiveHook?.getReadonlyState()[key] as K);

    createEffect(() => {
      const init = () => setState(() => reactiveHook?.getReadonlyState()[key] as K);

      init();

      const unsubscribe = reactiveHook?.subscribe(
        (s) => s[key],
        () => init()
      );

      onCleanup(() => unsubscribe?.());
    });

    return state;
  };
};
