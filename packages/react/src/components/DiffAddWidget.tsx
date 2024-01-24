import * as React from "react";

import { addWidgetBGName, addWidgetColorName } from "./color";

import type { SplitSide } from "..";
import type { DiffFile } from "@git-diff-view/core";

export const DiffSplitAddWidget = ({
  side,
  lineNumber,
  onWidgetClick,
  onOpenAddWidget,
}: {
  index: number;
  lineNumber: number;
  diffFile: DiffFile;
  side: SplitSide;
  onWidgetClick?: (lineNumber: number, side: SplitSide) => void;
  onOpenAddWidget: (lineNumber: number, side: SplitSide) => void;
}) => {
  return (
    <div
      className="diff-add-widget-wrapper absolute left-[100%] top-[1px] translate-x-[-50%]"
      style={{
        width: "calc(var(--diff-font-size--) * 1.4)",
        height: "calc(var(--diff-font-size--) * 1.4)",
      }}
    >
      <button
        className="diff-add-widget absolute overflow-hidden cursor-pointer rounded-md w-0 h-0 left-0 top-0 flex items-center justify-center transition-transform origin-center group-hover:w-full group-hover:h-full hover:scale-110"
        style={{
          color: `var(${addWidgetColorName})`,
          zIndex: 1,
          fontSize: `1.2em`,
          backgroundColor: `var(${addWidgetBGName})`,
        }}
        onClick={() => {
          onOpenAddWidget(lineNumber, side);
          onWidgetClick?.(lineNumber, side);
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
  onWidgetClick?: (lineNumber: number, side: SplitSide) => void;
  onOpenAddWidget: (lineNumber: number, side: SplitSide) => void;
}) => {
  return (
    <div
      className="diff-add-widget-wrapper absolute left-[100%] top-[1px] translate-x-[-50%]"
      style={{
        width: "calc(var(--diff-font-size--) * 1.4)",
        height: "calc(var(--diff-font-size--) * 1.4)",
      }}
    >
      <button
        className="diff-add-widget absolute overflow-hidden cursor-pointer rounded-md w-0 h-0 left-0 top-0 flex items-center justify-center transition-transform origin-center group-hover:w-full group-hover:h-full hover:scale-110"
        style={{
          color: `var(${addWidgetColorName})`,
          zIndex: 1,
          fontSize: `1.2em`,
          backgroundColor: `var(${addWidgetBGName})`,
        }}
        onClick={() => {
          onOpenAddWidget(lineNumber, side);
          onWidgetClick?.(lineNumber, side);
        }}
      >
        +
      </button>
    </div>
  );
};
