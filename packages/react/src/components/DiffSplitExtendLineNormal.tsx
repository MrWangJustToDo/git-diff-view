import * as React from "react";

import { useDiffViewContext, SplitSide } from "..";
import { useDomWidth } from "../hooks/useDomWidth";
import { useSyncHeight } from "../hooks/useSyncHeight";

import { emptyBGName } from "./color";

import type { DiffFile } from "@git-diff-view/core";

const _DiffSplitExtendLine = ({
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

  const { extendData, renderExtendLine } = useDiffContext(
    React.useCallback((s) => ({ extendData: s.extendData, renderExtendLine: s.renderExtendLine }), [])
  );
  const oldLine = diffFile.getSplitLeftLine(index);

  const newLine = diffFile.getSplitRightLine(index);

  const oldLineExtend = extendData?.oldFile?.[oldLine?.lineNumber];

  const newLineExtend = extendData?.newFile?.[newLine?.lineNumber];

  const currentExtend = side === SplitSide.old ? oldLineExtend : newLineExtend;

  const currentLineNumber = side === SplitSide.old ? oldLine.lineNumber : newLine.lineNumber;

  const otherSide = side === SplitSide.old ? SplitSide.new : SplitSide.old;

  useSyncHeight({
    selector: `tr[data-line="${lineNumber}-extend"]`,
    side: currentExtend ? SplitSide[side] : SplitSide[otherSide],
    enable: side === SplitSide.new && typeof renderExtendLine === "function",
  });

  const width = useDomWidth({
    selector: side === SplitSide.old ? ".old-diff-table-wrapper" : ".new-diff-table-wrapper",
    enable: !!currentExtend && typeof renderExtendLine === "function",
  });

  if (!renderExtendLine) return null;

  return (
    <tr
      data-line={`${lineNumber}-extend`}
      data-state="extend"
      data-side={SplitSide[side]}
      className="diff-line diff-line-extend"
    >
      {currentExtend ? (
        <td className={`diff-line-extend-${SplitSide[side]}-content p-0`} colSpan={2}>
          <div className="diff-line-extend-wrapper sticky left-0" style={{ width }}>
            {width > 0 &&
              renderExtendLine?.({
                diffFile,
                side,
                lineNumber: currentLineNumber,
                data: currentExtend.data,
                onUpdate: diffFile.notifyAll,
              })}
          </div>
        </td>
      ) : (
        <td
          className={`diff-line-extend-${SplitSide[side]}-placeholder p-0 select-none`}
          style={{ backgroundColor: `var(${emptyBGName})` }}
          colSpan={2}
        >
          <span>&ensp;</span>
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

  const hasExtend = useDiffContext(
    React.useCallback(
      (s) => s.extendData?.oldFile?.[oldLine?.lineNumber] || s.extendData?.newFile?.[newLine?.lineNumber],
      [oldLine?.lineNumber, newLine?.lineNumber]
    )
  );

  // if the expand action not enabled, the `isHidden` property will never change
  const enableExpand = diffFile.getExpandEnabled();

  const currentLine = side === SplitSide.old ? oldLine : newLine;

  const currentIsShow = hasExtend && (!currentLine.isHidden || !enableExpand);

  if (!currentIsShow) return null;

  return <_DiffSplitExtendLine index={index} diffFile={diffFile} side={side} lineNumber={lineNumber} />;
};
