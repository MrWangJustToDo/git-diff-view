import { numIterator } from "@git-diff-view/core";
import { Fragment, useEffect, useRef } from "react";

import { DiffSplitExtendLine } from "./DiffSplitExtendLine";
import { DiffSplitExpandLastLine, DiffSplitHunkLine } from "./DiffSplitHunkLine";
import { DiffSplitLine } from "./DiffSplitLine";
import { useDiffViewContext } from "./DiffViewContext";

import type { DiffFileExtends } from "../utils";
import type { DiffFile } from "@git-diff-view/core";

export enum SplitSide {
  old,
  new,
}

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
  isHighlight,
  isWrap,
  diffFile,
}: {
  side: SplitSide;
  lineLength: number;
  isHighlight: boolean;
  isWrap: boolean;
  diffFile: DiffFile;
}) => {
  const className = side === SplitSide.new ? "new-diff-table" : "old-diff-table";

  const showExpandLast = diffFile.splitLastStartIndex && Number.isFinite(diffFile.splitLastStartIndex);

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
            <DiffSplitHunkLine index={index} side={side} isWrap={isWrap} lineNumber={index + 1} isHighlight={isHighlight} diffFile={diffFile} />
            <DiffSplitLine index={index} side={side} isWrap={isWrap} lineNumber={index + 1} isHighlight={isHighlight} diffFile={diffFile} />
            <DiffSplitExtendLine
              index={index}
              side={side}
              isWrap={isWrap}
              lineNumber={index + 1}
              isHighlight={isHighlight}
              diffFile={diffFile as DiffFileExtends}
            />
          </Fragment>
        ))}
        {showExpandLast && <DiffSplitExpandLastLine side={side} key="last" isWrap={isWrap} isHighlight={isHighlight} diffFile={diffFile} />}
      </tbody>
    </table>
  );
};

export const DiffSplitView = ({ diffFile }: { diffFile: DiffFile }) => {
  const { isWrap, isHighlight } = useDiffViewContext();

  const ref1 = useRef<HTMLDivElement>(null);

  const ref2 = useRef<HTMLDivElement>(null);

  const lineLength = diffFile.lineLength;

  useEffect(() => {
    const left = ref1.current;
    const right = ref2.current;
    if (!left || !right) return;
    return syncScroll(left, right);
  }, [isWrap]);

  return (
    <div className="split-diff-view w-full flex basis-[50%]">
      <div className="old-diff-table-wrapper overflow-auto w-full" ref={ref1} style={{ overscrollBehaviorX: "none" }}>
        <DiffSplitViewTable side={SplitSide.old} isHighlight={isHighlight} isWrap={isWrap} lineLength={lineLength} diffFile={diffFile} />
      </div>
      <div className="diff-split-line w-[1.5px] bg-[grey] opacity-[0.4]" />
      <div className="new-diff-table-wrapper overflow-auto w-full" ref={ref2} style={{ overscrollBehaviorX: "none" }}>
        <DiffSplitViewTable side={SplitSide.new} isHighlight={isHighlight} isWrap={isWrap} lineLength={lineLength} diffFile={diffFile} />
      </div>
    </div>
  );
};
