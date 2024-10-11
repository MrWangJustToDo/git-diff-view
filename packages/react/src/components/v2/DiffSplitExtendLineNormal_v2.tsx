import * as React from "react";

import { useDomWidth } from "../../hooks/useDomWidth";
import { useSyncHeight } from "../../hooks/useSyncHeight";
import { emptyBGName } from "../color";
import { SplitSide } from "../DiffView";
import { useDiffViewContext } from "../DiffViewContext";

import type { DiffFile } from "@git-diff-view/core";

const _DiffSplitExtendLine = ({
  index,
  diffFile,
  oldLineExtend,
  newLineExtend,
  side,
  lineNumber,
}: {
  index: number;
  side: SplitSide;
  oldLineExtend: { data: any };
  newLineExtend: { data: any };
  diffFile: DiffFile;
  lineNumber: number;
}) => {
  const { useDiffContext } = useDiffViewContext();

  const oldLine = diffFile.getSplitLeftLine(index);

  const newLine = diffFile.getSplitRightLine(index);

  const renderExtendLine = useDiffContext.useShallowStableSelector((s) => s.renderExtendLine);

  const currentExtend = side === SplitSide.old ? oldLineExtend : newLineExtend;

  const currentLineNumber = side === SplitSide.old ? oldLine.lineNumber : newLine.lineNumber;

  useSyncHeight({
    wrapper: `div[data-state="extend"][data-line="${lineNumber}-extend"]`,
    selector: `div[data-line="${lineNumber}-extend-content"]`,
    side: SplitSide[side],
    enable: !!currentExtend?.data && typeof renderExtendLine === "function",
  });

  const width = useDomWidth({
    selector: side === SplitSide.old ? ".old-diff-table-wrapper" : ".new-diff-table-wrapper",
    enable: !!currentExtend?.data && typeof renderExtendLine === "function",
  });

  if (!renderExtendLine) return null;

  return (
    <div
      data-line={`${lineNumber}-extend`}
      data-state="extend"
      data-side={SplitSide[side]}
      className="diff-line diff-line-extend"
    >
      {currentExtend ? (
        <div className={`diff-line-extend-${SplitSide[side]}-content p-0`}>
          <div
            data-line={`${lineNumber}-extend-content`}
            data-side={SplitSide[side]}
            className="diff-line-extend-wrapper sticky left-0"
            style={{ width }}
          >
            {width > 0 &&
              currentExtend?.data &&
              renderExtendLine?.({
                diffFile,
                side,
                lineNumber: currentLineNumber,
                data: currentExtend.data,
                onUpdate: diffFile.notifyAll,
              })}
          </div>
        </div>
      ) : (
        <div
          className={`diff-line-extend-${SplitSide[side]}-placeholder h-full select-none p-0`}
          style={{ backgroundColor: `var(${emptyBGName})` }}
        >
          <div data-line={`${lineNumber}-extend-content`} data-side={SplitSide[side]} />
        </div>
      )}
    </div>
  );
};

export const DiffSplitExtendLine = ({
  index,
  diffFile,
  side,
  lineNumber,
}: {
  index: number;
  side: SplitSide;
  diffFile: DiffFile;
  lineNumber: number;
}) => {
  const { useDiffContext } = useDiffViewContext();

  const oldLine = diffFile.getSplitLeftLine(index);

  const newLine = diffFile.getSplitRightLine(index);

  const { oldLineExtend, newLineExtend } = useDiffContext(
    React.useCallback(
      (s) => ({
        oldLineExtend: s.extendData?.oldFile?.[oldLine?.lineNumber],
        newLineExtend: s.extendData?.newFile?.[newLine?.lineNumber],
      }),
      [oldLine?.lineNumber, newLine?.lineNumber]
    )
  );

  const hasExtend = oldLineExtend?.data || newLineExtend?.data;

  // if the expand action not enabled, the `isHidden` property will never change
  const enableExpand = diffFile.getExpandEnabled();

  const currentLine = side === SplitSide.old ? oldLine : newLine;

  const currentIsShow = hasExtend && (!currentLine.isHidden || !enableExpand);

  if (!currentIsShow) return null;

  return (
    <_DiffSplitExtendLine
      side={side}
      index={index}
      diffFile={diffFile}
      lineNumber={lineNumber}
      oldLineExtend={oldLineExtend}
      newLineExtend={newLineExtend}
    />
  );
};
