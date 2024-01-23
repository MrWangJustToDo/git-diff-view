import type { DiffFileExtends } from "../utils";
import type { InjectionKey, Ref, VNode } from "vue";

export enum DiffModeEnum {
  Split,
  Unified,
}

export enum SplitSide {
  old = 1,
  new = 2,
}

export const idSymbol: InjectionKey<Ref<string>> = Symbol();

export const modeSymbol: InjectionKey<Ref<DiffModeEnum>> = Symbol();

export const fontSizeSymbol: InjectionKey<Ref<number>> = Symbol();

export const enableWrapSymbol: InjectionKey<Ref<boolean>> = Symbol();

export const enableHighlightSymbol: InjectionKey<Ref<boolean>> = Symbol();

export const enableAddWidgetSymbol: InjectionKey<Ref<boolean>> = Symbol();

export const renderWidgetLineSymbol: InjectionKey<
  Ref<({ diffFile, side, lineNumber, onClose }: { lineNumber: number; side: SplitSide; diffFile: DiffFileExtends; onClose: () => void }) => VNode>
> = Symbol();

export const extendDataSymbol: InjectionKey<Ref<{ oldFile?: Record<string, { data: any }>; newFile?: Record<string, { data: any }> }>> = Symbol();

export const renderExtendLineSymbol: InjectionKey<
  Ref<
    ({
      diffFile,
      side,
      data,
      lineNumber,
      onUpdate,
    }: {
      lineNumber: number;
      side: SplitSide;
      data: any;
      diffFile: DiffFileExtends;
      onUpdate: () => void;
    }) => VNode
  >
> = Symbol();

export const onAddWidgetClickSymbol: InjectionKey<Ref<(lineNumber: number, side: SplitSide) => void>> = Symbol();
