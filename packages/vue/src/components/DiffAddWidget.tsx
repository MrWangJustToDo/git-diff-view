import { addWidgetBGName, addWidgetColorName, diffFontSizeName } from "@git-diff-view/utils";

import { type SplitSide } from "./DiffView";

import type { DiffFile } from "@git-diff-view/core";

export const DiffSplitAddWidget = ({
  side,
  className,
  lineNumber,
  onWidgetClick,
  onOpenAddWidget,
}: {
  index: number;
  className?: string;
  lineNumber: number;
  diffFile: DiffFile;
  side: SplitSide;
  onOpenAddWidget: (lineNumber: number, side: SplitSide) => void;
  onWidgetClick?: (event: "onAddWidgetClick", lineNumber: number, side: SplitSide) => void;
}) => {
  return (
    <div
      class={
        "diff-add-widget-wrapper invisible select-none transition-transform hover:scale-110 group-hover:visible" +
        (className ? " " + className : "")
      }
      style={{
        width: `calc(var(${diffFontSizeName}) * 1.4)`,
        height: `calc(var(${diffFontSizeName}) * 1.4)`,
        top: `calc(var(${diffFontSizeName}) * 0.1)`,
      }}
    >
      <button
        class="diff-add-widget z-[1] flex h-full w-full origin-center cursor-pointer items-center justify-center rounded-md text-[1.2em]"
        style={{
          color: `var(${addWidgetColorName})`,
          backgroundColor: `var(${addWidgetBGName})`,
        }}
        onClick={() => {
          onOpenAddWidget(lineNumber, side);
          onWidgetClick?.("onAddWidgetClick", lineNumber, side);
        }}
      >
        +
      </button>
    </div>
  );
};

export const DiffUnifiedAddWidget = ({
  lineNumber,
  side,
  onWidgetClick,
  onOpenAddWidget,
}: {
  index: number;
  diffFile: DiffFile;
  lineNumber: number;
  side: SplitSide;
  onOpenAddWidget: (lineNumber: number, side: SplitSide) => void;
  onWidgetClick?: (event: "onAddWidgetClick", lineNumber: number, side: SplitSide) => void;
}) => {
  return (
    <div
      class="diff-add-widget-wrapper invisible absolute left-[100%] translate-x-[-50%] select-none transition-transform hover:scale-110 group-hover:visible"
      style={{
        width: `calc(var(${diffFontSizeName}) * 1.4)`,
        height: `calc(var(${diffFontSizeName}) * 1.4)`,
        top: `calc(var(${diffFontSizeName}) * 0.1)`,
      }}
    >
      <button
        class="diff-add-widget z-[1] flex h-full w-full origin-center cursor-pointer items-center justify-center rounded-md text-[1.2em]"
        style={{
          color: `var(${addWidgetColorName})`,
          backgroundColor: `var(${addWidgetBGName})`,
        }}
        onClick={() => {
          onOpenAddWidget(lineNumber, side);
          onWidgetClick?.("onAddWidgetClick", lineNumber, side);
        }}
      >
        +
      </button>
    </div>
  );
};
