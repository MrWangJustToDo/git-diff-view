/* eslint-disable @typescript-eslint/ban-ts-comment */
import { DiffFileLineType, getSplitLines, type DiffFile } from "@git-diff-view/core";
import { memo, useCallback, useEffect, useRef } from "react";
import * as React from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim/index.js";


import { useTextWidth } from "../../hooks/useTextWidth";
import { SplitSide } from "../DiffView";
import { useDiffViewContext } from "../DiffViewContext";
import { removeAllSelection, syncScroll, diffFontSizeName } from "../tools";

import { DiffSplitViewLine } from "./DiffSplitViewLineNormal_v2";

import type { MouseEventHandler } from "react";

const onMouseDown: MouseEventHandler<HTMLTableSectionElement> = (e) => {
  const ele = e.target;

  // need remove all the selection
  if (ele && ele instanceof HTMLElement && ele.nodeName === "BUTTON") {
    removeAllSelection();
    return;
  }
};

export const DiffSplitViewTable = ({ side, diffFile }: { side: SplitSide; diffFile: DiffFile }) => {
  const className = side === SplitSide.new ? "new-diff-table" : "old-diff-table";

  const lines = getSplitLines(diffFile);

  return (
    <div className={className + " w-max min-w-full"} data-mode={SplitSide[side]}>
      <div className="diff-table-body leading-[1.6]" onMouseDownCapture={onMouseDown}>
        {lines.map((line) => (
          <DiffSplitViewLine
            key={line.index + "-" + DiffFileLineType[line.type]}
            side={side}
            line={line}
            diffFile={diffFile}
          />
        ))}
      </div>
    </div>
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
        className="old-diff-table-wrapper scrollbar-hide scrollbar-disable w-full overflow-x-auto overflow-y-hidden"
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
      <div className="diff-split-line w-[1.5px] bg-[rgb(222,222,222)]" />
      <div
        className="new-diff-table-wrapper scrollbar-hide scrollbar-disable w-full overflow-x-auto overflow-y-hidden"
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
