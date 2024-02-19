import { getSplitContentLines } from "@git-diff-view/core";
import { Fragment, memo, useCallback, useEffect, useRef } from "react";
import * as React from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim";

import { useDiffViewContext } from "..";
import { useTextWidth } from "../hooks/useTextWidth";

import { DiffSplitExtendLine } from "./DiffSplitExtendLineNormal";
import { DiffSplitLastHunkLine, DiffSplitHunkLine } from "./DiffSplitHunkLineNormal";
import { DiffSplitLine } from "./DiffSplitLineNormal";
import { DiffSplitWidgetLine } from "./DiffSplitWidgetLineNormal";
import { SplitSide } from "./DiffView";
import { removeAllSelection, syncScroll } from "./tools";

import type { DiffFile } from "@git-diff-view/core";
import type { MouseEventHandler } from "react";

const onMouseDown: MouseEventHandler<HTMLTableSectionElement> = (e) => {
  const ele = e.target;

  // need remove all the selection
  if (ele && ele instanceof HTMLElement && ele.nodeName === "BUTTON") {
    removeAllSelection();
    return;
  }
};

const DiffSplitViewTable = ({ side, diffFile, width }: { side: SplitSide; diffFile: DiffFile; width: number }) => {
  const className = side === SplitSide.new ? "new-diff-table" : "old-diff-table";

  const lines = getSplitContentLines(diffFile);

  return (
    <table className={className + " border-collapse w-full"} data-mode={SplitSide[side]}>
      <colgroup>
        <col className={`diff-table-${SplitSide[side]}-num-col`} style={{ minWidth: Math.round(width) + 25 }} />
        <col className={`diff-table-${SplitSide[side]}-content-col`} />
      </colgroup>
      <thead className="hidden">
        <tr>
          <th scope="col">{SplitSide[side]} line number</th>
          <th scope="col">{SplitSide[side]} line content</th>
        </tr>
      </thead>
      <tbody className="diff-table-body leading-[1.4]" onMouseDownCapture={onMouseDown}>
        {lines.map((line) => (
          <Fragment key={line.index}>
            <DiffSplitHunkLine index={line.index} side={side} lineNumber={line.lineNumber} diffFile={diffFile} />
            <DiffSplitLine index={line.index} side={side} lineNumber={line.lineNumber} diffFile={diffFile} />
            <DiffSplitWidgetLine index={line.index} side={side} lineNumber={line.lineNumber} diffFile={diffFile} />
            <DiffSplitExtendLine index={line.index} side={side} lineNumber={line.lineNumber} diffFile={diffFile} />
          </Fragment>
        ))}
        <DiffSplitLastHunkLine side={side} diffFile={diffFile} />
      </tbody>
    </table>
  );
};

export const DiffSplitViewNormal = memo(({ diffFile }: { diffFile: DiffFile }) => {
  const ref1 = useRef<HTMLDivElement>(null);

  const ref2 = useRef<HTMLDivElement>(null);

  const splitLineLength = diffFile.splitLineLength;

  const { useDiffContext } = useDiffViewContext();

  const fontSize = useDiffContext(useCallback((s) => s.fontSize, []));

  useSyncExternalStore(diffFile.subscribe, diffFile.getUpdateCount);

  useEffect(() => {
    const left = ref1.current;
    const right = ref2.current;
    if (!left || !right) return;
    return syncScroll(left, right);
  }, []);

  const width = useTextWidth({
    text: splitLineLength.toString(),
    font: { fontSize: fontSize + "px", fontFamily: "Menlo, Consolas, monospace" },
  });

  return (
    <div className="split-diff-view split-diff-view-wrap w-full flex basis-[50%]">
      <div
        className="old-diff-table-wrapper overflow-auto w-full scrollbar-hide scrollbar-disable"
        ref={ref1}
        style={{
          overscrollBehaviorX: "none",
          fontFamily: "Menlo, Consolas, monospace",
          fontSize: "var(--diff-font-size--)",
        }}
      >
        <DiffSplitViewTable side={SplitSide.old} diffFile={diffFile} width={width} />
      </div>
      <div className="diff-split-line w-[1.5px] bg-[#ccc]" />
      <div
        className="new-diff-table-wrapper overflow-auto w-full scrollbar-hide scrollbar-disable"
        ref={ref2}
        style={{
          overscrollBehaviorX: "none",
          fontFamily: "Menlo, Consolas, monospace",
          fontSize: "var(--diff-font-size--)",
        }}
      >
        <DiffSplitViewTable side={SplitSide.new} diffFile={diffFile} width={width} />
      </div>
    </div>
  );
});

DiffSplitViewNormal.displayName = "DiffSplitViewNormal";
