import { numIterator } from "@git-diff-view/core";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import * as React from "react";

import { DiffSplitExtendLine } from "./DiffSplitExtendLine";
import { DiffSplitExpandLastLine, DiffSplitHunkLine } from "./DiffSplitHunkLine";
import { DiffSplitLine } from "./DiffSplitLine";
import { DiffSplitWidgetLine } from "./DiffSplitWidgetLine";
import { SplitSide } from "./DiffView";
import { useDiffViewContext } from "./DiffViewContext";
import { DiffWidgetContext } from "./DiffWidgetContext";

import type { DiffWidgetContextType } from "./DiffWidgetContext";
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

const DiffSplitViewTable = ({
  side,
  lineLength,
  diffFile,
}: {
  side: SplitSide;
  lineLength: number;
  diffFile: DiffFile;
}) => {
  const className = side === SplitSide.new ? "new-diff-table" : "old-diff-table";

  return (
    <table className={className + " border-collapse w-full"} data-mode={SplitSide[side]}>
      <colgroup>
        <col className={`${SplitSide[side]}-diff-table-num-col`} />
        <col className={`${SplitSide[side]}-diff-table-content-col`} />
      </colgroup>
      <thead className="hidden">
        <tr>
          <th scope="col">line number</th>
          <th scope="col">line content</th>
        </tr>
      </thead>
      <tbody
        className="leading-[1.4]"
        style={{
          fontFamily: "Menlo, Consolas, monospace",
          fontSize: "var(--diff-font-size--)",
        }}
      >
        {numIterator(lineLength, (index) => (
          <Fragment key={index}>
            <DiffSplitHunkLine index={index} side={side} lineNumber={index + 1} diffFile={diffFile} />
            <DiffSplitLine index={index} side={side} lineNumber={index + 1} diffFile={diffFile} />
            <DiffSplitWidgetLine index={index} side={side} lineNumber={index + 1} diffFile={diffFile} />
            <DiffSplitExtendLine index={index} side={side} lineNumber={index + 1} diffFile={diffFile} />
          </Fragment>
        ))}
        <DiffSplitExpandLastLine side={side} key="last" diffFile={diffFile} />
      </tbody>
    </table>
  );
};

export const DiffSplitView = ({ diffFile }: { diffFile: DiffFile }) => {
  const { enableWrap } = useDiffViewContext();

  const [widget, setWidget] = useState<DiffWidgetContextType>({});

  const contextValue = useMemo(() => ({ widget, setWidget }), [widget, setWidget]);

  const ref1 = useRef<HTMLDivElement>(null);

  const ref2 = useRef<HTMLDivElement>(null);

  const lineLength = diffFile.lineLength;

  useEffect(() => {
    const left = ref1.current;
    const right = ref2.current;
    if (!left || !right) return;
    return syncScroll(left, right);
  }, [enableWrap]);

  useEffect(() => {
    setWidget({});
  }, [diffFile]);

  return (
    <DiffWidgetContext.Provider value={contextValue}>
      <div className="split-diff-view w-full flex basis-[50%]">
        <div className="old-diff-table-wrapper overflow-auto w-full" ref={ref1} style={{ overscrollBehaviorX: "none" }}>
          <DiffSplitViewTable side={SplitSide.old} lineLength={lineLength} diffFile={diffFile} />
        </div>
        <div className="diff-split-line w-[1.5px] bg-[grey] opacity-[0.4]" />
        <div className="new-diff-table-wrapper overflow-auto w-full" ref={ref2} style={{ overscrollBehaviorX: "none" }}>
          <DiffSplitViewTable side={SplitSide.new} lineLength={lineLength} diffFile={diffFile} />
        </div>
      </div>
    </DiffWidgetContext.Provider>
  );
};
