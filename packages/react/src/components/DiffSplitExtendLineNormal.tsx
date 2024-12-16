import { emptyBGName } from "@git-diff-view/utils";
import * as React from "react";

import { useDiffViewContext, SplitSide } from "..";
import { useDomWidth } from "../hooks/useDomWidth";
import { useSyncHeight } from "../hooks/useSyncHeight";

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

  const hasExtend = currentExtend?.data !== undefined && currentExtend?.data !== null;

  const currentExtendRendered =
    hasExtend &&
    renderExtendLine?.({
      diffFile,
      side,
      lineNumber: currentLineNumber,
      data: currentExtend.data,
      onUpdate: diffFile.notifyAll,
    });

  useSyncHeight({
    selector: `div[data-line="${lineNumber}-extend-content"]`,
    wrapper: `tr[data-line="${lineNumber}-extend"]`,
    side: SplitSide[side],
    enable: hasExtend && typeof renderExtendLine === "function",
  });

  const width = useDomWidth({
    selector: side === SplitSide.old ? ".old-diff-table-wrapper" : ".new-diff-table-wrapper",
    enable: hasExtend && typeof renderExtendLine === "function",
  });

  if (!renderExtendLine) return null;

  return (
    <tr
      data-line={`${lineNumber}-extend`}
      data-state="extend"
      data-side={SplitSide[side]}
      className="diff-line diff-line-extend"
    >
      {hasExtend ? (
        <td className={`diff-line-extend-${SplitSide[side]}-content p-0`} colSpan={2}>
          <div
            data-line={`${lineNumber}-extend-content`}
            data-side={SplitSide[side]}
            className="diff-line-extend-wrapper sticky left-0"
            style={{ width }}
          >
            {width > 0 && currentExtendRendered}
          </div>
        </td>
      ) : (
        <td
          className={`diff-line-extend-${SplitSide[side]}-placeholder select-none p-0`}
          style={{ backgroundColor: `var(${emptyBGName})` }}
          colSpan={2}
        >
          <div data-line={`${lineNumber}-extend-content`} data-side={SplitSide[side]} />
        </td>
      )}
    </tr>
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
