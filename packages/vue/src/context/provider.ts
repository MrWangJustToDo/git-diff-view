import type { DiffModeEnum, SplitSide } from "..";
import type { DiffFile } from "@git-diff-view/core";
import type { InjectionKey, Ref, Slot } from "vue";

export const idSymbol: InjectionKey<Ref<string>> = Symbol();

export const mountedSymbol: InjectionKey<Ref<boolean>> = Symbol();

export const modeSymbol: InjectionKey<Ref<DiffModeEnum>> = Symbol();

export const fontSizeSymbol: InjectionKey<Ref<number>> = Symbol();

export const enableWrapSymbol: InjectionKey<Ref<boolean>> = Symbol();

export const enableHighlightSymbol: InjectionKey<Ref<boolean>> = Symbol();

export const enableAddWidgetSymbol: InjectionKey<Ref<boolean>> = Symbol();

export const slotsSymbol: InjectionKey<{
  widget: Slot<{ lineNumber: number; side: SplitSide; diffFile: DiffFile; onClose: () => void }>;
  extend: Slot<{ lineNumber: number; side: SplitSide; data: any; diffFile: DiffFile; onUpdate: () => void }>;
}> = Symbol();

export const extendDataSymbol: InjectionKey<
  Ref<{ oldFile?: Record<string, { data: any }>; newFile?: Record<string, { data: any }> }>
> = Symbol();

export const onAddWidgetClickSymbol: InjectionKey<
  (event: "onAddWidgetClick", lineNumber: number, side: SplitSide) => void
> = Symbol();

export const widgetStateSymbol: InjectionKey<Ref<{ lineNumber?: number; side?: SplitSide }>> = Symbol();

export const setWidgetStateSymbol: InjectionKey<(props: { lineNumber?: number; side?: SplitSide }) => void> = Symbol();
