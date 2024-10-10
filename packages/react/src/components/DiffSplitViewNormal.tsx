/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getSplitContentLines, type DiffFile } from "@git-diff-view/core";
import { Fragment, memo, useCallback, useEffect, useRef } from "react";
import * as React from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim/index.js";

import { useDiffViewContext } from "..";
import { useTextWidth } from "../hooks/useTextWidth";

import { borderColorName } from "./color";
import { DiffSplitExtendLine } from "./DiffSplitExtendLineNormal";
import { DiffSplitHunkLine } from "./DiffSplitHunkLineNormal";
import { DiffSplitLine } from "./DiffSplitLineNormal";
import { DiffSplitWidgetLine } from "./DiffSplitWidgetLineNormal";
import { SplitSide } from "./DiffView";
import { diffAsideWidthName, diffFontSizeName, removeAllSelection, syncScroll } from "./tools";

import type { MouseEventHandler } from "react";

const onMouseDown: MouseEventHandler<HTMLTableSectionElement> = (e) => {
  const ele = e.target;

  // need remove all the selection
  if (ele && ele instanceof HTMLElement && ele.nodeName === "BUTTON") {
    removeAllSelection();
    return;
  }
};

const DiffSplitViewTable = ({ side, diffFile }: { side: SplitSide; diffFile: DiffFile }) => {
  const className = side === SplitSide.new ? "new-diff-table" : "old-diff-table";

  const lines = getSplitContentLines(diffFile);

  return (
    <table className={className + " w-full border-collapse"} data-mode={SplitSide[side]}>
      <colgroup>
        <col className={`diff-table-${SplitSide[side]}-num-col`} />
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
        <DiffSplitHunkLine
          side={side}
          index={diffFile.splitLineLength}
          lineNumber={diffFile.splitLineLength}
          diffFile={diffFile}
        />
      </tbody>
    </table>
  );
};

export const DiffSplitViewNormal = memo(({ diffFile }: { diffFile: DiffFile }) => {
  const ref1 = useRef<HTMLDivElement>(null);

  const ref2 = useRef<HTMLDivElement>(null);

  const splitLineLength = Math.max(diffFile.splitLineLength, diffFile.fileLineLength);

  const { useDiffContext } = useDiffViewContext();

  const fontSize = useDiffContext(useCallback((s) => s.fontSize, []));

  useSyncExternalStore(diffFile.subscribe, diffFile.getUpdateCount);

  useEffect(() => {
    const left = ref1.current;
    const right = ref2.current;
    if (!left || !right) return;
    return syncScroll(left, right);
  }, []);

  const font = React.useMemo(
    () => ({ fontSize: fontSize + "px", fontFamily: "Menlo, Consolas, monospace" }),
    [fontSize]
  );

  const _width = useTextWidth({
    text: splitLineLength.toString(),
    font,
  });

  const width = Math.max(40, _width + 25);

  return (
    <div className="split-diff-view split-diff-view-wrap flex w-full basis-[50%]">
      <div
        className="old-diff-table-wrapper diff-table-scroll-container w-full overflow-x-auto overflow-y-hidden"
        ref={ref1}
        style={{
          // @ts-ignore
          [diffAsideWidthName]: `${Math.round(width)}px`,
          overscrollBehaviorX: "none",
          fontFamily: "Menlo, Consolas, monospace",
          fontSize: `var(${diffFontSizeName})`,
        }}
      >
        <DiffSplitViewTable side={SplitSide.old} diffFile={diffFile} />
      </div>
      <div className="diff-split-line w-[1.5px]" style={{ backgroundColor: `var(${borderColorName})` }} />
      <div
        className="new-diff-table-wrapper diff-table-scroll-container w-full overflow-x-auto overflow-y-hidden"
        ref={ref2}
        style={{
          // @ts-ignore
          [diffAsideWidthName]: `${Math.round(width)}px`,
          overscrollBehaviorX: "none",
          fontFamily: "Menlo, Consolas, monospace",
          fontSize: `var(${diffFontSizeName})`,
        }}
      >
        <DiffSplitViewTable side={SplitSide.new} diffFile={diffFile} />
      </div>
    </div>
  );
});

DiffSplitViewNormal.displayName = "DiffSplitViewNormal";
