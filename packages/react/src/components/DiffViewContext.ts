import { createContext, useContext } from "react";

import type { DiffViewProps } from "..";
import type { Ref, UseSelectorWithStore } from "reactivity-store";

export enum DiffModeEnum {
  Split = 1,
  Unified = 2,
}

export const DiffViewContext = createContext<{
  useDiffContext: UseSelectorWithStore<{
    id: Ref<string>;
    mode: Ref<DiffModeEnum>;
    enableWrap: Ref<boolean>;
    enableAddWidget: Ref<boolean>;
    enableHighlight: Ref<boolean>;
    fontSize: Ref<number>;
    renderWidgetLine: Ref<DiffViewProps<any>["renderWidgetLine"]>;
    extendData: Ref<DiffViewProps<any>["extendData"]>;
    renderExtendLine: Ref<DiffViewProps<any>["renderExtendLine"]>;
    onAddWidgetClick: Ref<DiffViewProps<any>["onAddWidgetClick"]>;
  }>;
}>(null);

DiffViewContext.displayName = "DiffViewContext";

export const useDiffViewContext = () => useContext(DiffViewContext);
