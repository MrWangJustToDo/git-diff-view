import { numIterator } from "@git-diff-view/core";
import { Fragment, memo, useEffect, useRef } from "react";
import * as React from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim";

import { DiffSplitExtendLine } from "./DiffSplitExtendLineNormal";
import { DiffSplitLastHunkLine, DiffSplitHunkLine } from "./DiffSplitHunkLineNormal";
import { DiffSplitLine } from "./DiffSplitLineNormal";
import { DiffSplitWidgetLine } from "./DiffSplitWidgetLineNormal";
import { SplitSide } from "./DiffView";

import type { DiffFile } from "@git-diff-view/core";

const syncScroll = (left: HTMLElement, right: HTMLElement) => {
  const onScroll = function (event: Event) {
    if (event === null || event.target === null) return;
    if (event.target === left) {
      right.scrollTop = left.scrollTop;
      right.scrollLeft = left.scrollLeft;
    } else {
      left.scrollTop = right.scrollTop;
      left.scrollLeft = right.scrollLeft;
    }
  };
  if (!left.onscroll) {
    left.onscroll = onScroll;
  }
  if (!right.onscroll) {
    right.onscroll = onScroll;
  }

  return () => {
    left.onscroll = null;
    right.onscroll = null;
  };
};

const DiffSplitViewTable = ({ side, diffFile }: { side: SplitSide; diffFile: DiffFile }) => {
  const className = side === SplitSide.new ? "new-diff-table" : "old-diff-table";

  const splitLineLength = diffFile.splitLineLength;

  return (
    <table className={className + " border-collapse w-full"} data-mode={SplitSide[side]}>
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
      <tbody
        className="diff-table-body leading-[1.4]"
        style={{
          fontFamily: "Menlo, Consolas, monospace",
          fontSize: "var(--diff-font-size--)",
        }}
      >
        {numIterator(splitLineLength, (index) => (
          <Fragment key={index}>
            <DiffSplitHunkLine index={index} side={side} lineNumber={index + 1} diffFile={diffFile} />
            <DiffSplitLine index={index} side={side} lineNumber={index + 1} diffFile={diffFile} />
            <DiffSplitWidgetLine index={index} side={side} lineNumber={index + 1} diffFile={diffFile} />
            <DiffSplitExtendLine index={index} side={side} lineNumber={index + 1} diffFile={diffFile} />
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

  useSyncExternalStore(diffFile.subscribe, diffFile.getUpdateCount);

  useEffect(() => {
    const left = ref1.current;
    const right = ref2.current;
    if (!left || !right) return;
    return syncScroll(left, right);
  }, []);

  return (
    <div className="split-diff-view split-diff-view-wrap w-full flex basis-[50%]">
      <div className="old-diff-table-wrapper overflow-auto w-full" ref={ref1} style={{ overscrollBehaviorX: "none" }}>
        <DiffSplitViewTable side={SplitSide.old} diffFile={diffFile} />
      </div>
      <div className="diff-split-line w-[1.5px] bg-[#ccc]" />
      <div className="new-diff-table-wrapper overflow-auto w-full" ref={ref2} style={{ overscrollBehaviorX: "none" }}>
        <DiffSplitViewTable side={SplitSide.new} diffFile={diffFile} />
      </div>
    </div>
  );
});

DiffSplitViewNormal.displayName = "DiffSplitViewNormal";
