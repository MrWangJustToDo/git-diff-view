import { createEffect, createSignal, onCleanup } from "solid-js";

import { useDiffViewContext } from "../components/DiffViewContext";

import type { DiffViewProps } from "../components/DiffView";
import type { createDiffConfigStore } from "../components/tools";
import type { DiffModeEnum } from "@git-diff-view/utils";

type AllKey = keyof ReturnType<ReturnType<typeof createDiffConfigStore>["getReadonlyState"]>;

type Data = {
  id: string;
  setId: (id: string) => void;
  dom: HTMLElement | undefined;
  setDom: (dom: HTMLElement) => void;
  mode: DiffModeEnum;
  setMode: (mode: DiffModeEnum) => void;
  isMounted: boolean;
  setIsIsMounted: (isMounted: boolean) => void;
  enableWrap: boolean;
  setEnableWrap: (enableWrap: boolean) => void;
  enableAddWidget: boolean;
  setEnableAddWidget: (enableAddWidget: boolean) => void;
  enableHighlight: boolean;
  setEnableHighlight: (enableHighlight: boolean) => void;
  fontSize: number;
  setFontSize: (fontSize: number) => void;
  extendData: DiffViewProps<any>["extendData"];
  setExtendData: (extendData: DiffViewProps<any>["extendData"]) => void;
  renderWidgetLine: DiffViewProps<any>["renderWidgetLine"];
  setRenderWidgetLine: (renderWidgetLine: DiffViewProps<any>["renderWidgetLine"]) => void;
  renderExtendLine: DiffViewProps<any>["renderExtendLine"];
  setRenderExtendLine: (renderExtendLine: DiffViewProps<any>["renderExtendLine"]) => void;
  onAddWidgetClick: { current: DiffViewProps<any>["onAddWidgetClick"] };
  setOnAddWidgetClick: (onAddWidgetClick: { current: DiffViewProps<any>["onAddWidgetClick"] }) => void;
};

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
