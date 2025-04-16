import { diffFontSizeName, addWidgetColorName, addWidgetBGName } from "@git-diff-view/utils";

import type { SplitSide } from "./DiffView";
import type { DiffFile } from "@git-diff-view/core";

export const DiffSplitAddWidget = (props: {
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
        (props.className ? " " + props.className : "")
      }
      style={{
        width: `calc(var(${diffFontSizeName}) * 1.4)`,
        height: `calc(var(${diffFontSizeName}) * 1.4)`,
      }}
    >
      <button
        class="diff-add-widget z-[1] flex h-full w-full origin-center cursor-pointer items-center justify-center rounded-md text-[1.2em]"
        style={{
          color: `var(${addWidgetColorName})`,
          "background-color": `var(${addWidgetBGName})`,
        }}
        onClick={() => {
          props.onOpenAddWidget(props.lineNumber, props.side);
          props.onWidgetClick?.("onAddWidgetClick", props.lineNumber, props.side);
        }}
      >
        +
      </button>
    </div>
  );
};

export const DiffUnifiedAddWidget = (props: {
  index: number;
  diffFile: DiffFile;
  lineNumber: number;
  side: SplitSide;
  onOpenAddWidget: (lineNumber: number, side: SplitSide) => void;
  onWidgetClick?: (event: "onAddWidgetClick", lineNumber: number, side: SplitSide) => void;
}) => {
  return (
    <div
      class="diff-add-widget-wrapper invisible absolute left-[100%] top-[1px] translate-x-[-50%] select-none transition-transform hover:scale-110 group-hover:visible"
      style={{
        width: `calc(var(${diffFontSizeName}) * 1.4)`,
        height: `calc(var(${diffFontSizeName}) * 1.4)`,
      }}
    >
      <button
        class="diff-add-widget z-[1] flex h-full w-full origin-center cursor-pointer items-center justify-center rounded-md text-[1.2em]"
        style={{
          color: `var(${addWidgetColorName})`,
          "background-color": `var(${addWidgetBGName})`,
        }}
        onClick={() => {
          props.onOpenAddWidget(props.lineNumber, props.side);
          props.onWidgetClick?.("onAddWidgetClick", props.lineNumber, props.side);
        }}
      >
        +
      </button>
    </div>
  );
};
