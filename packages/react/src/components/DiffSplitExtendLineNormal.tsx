import * as React from "react";

import { useDiffViewContext, SplitSide } from "..";

import { emptyBGName } from "./color";

import type { DiffFile } from "@git-diff-view/core";

const _DiffSplitExtendLine = ({
  index,
  diffFile,
  lineNumber,
}: {
  index: number;
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

  return (
    <tr data-line={`${lineNumber}-extend`} data-state="extend" className="diff-line diff-line-extend">
      {oldLineExtend ? (
        <td className="diff-line-extend-old-content p-0" colSpan={2}>
          <div className="diff-line-extend-wrapper">
            {renderExtendLine?.({
              diffFile,
              side: SplitSide.old,
              lineNumber: oldLine.lineNumber,
              data: oldLineExtend.data,
              onUpdate: diffFile.notifyAll,
            })}
          </div>
        </td>
      ) : (
        <td
          className="diff-line-extend-old-placeholder p-0"
          style={{ backgroundColor: `var(${emptyBGName})` }}
          colSpan={2}
        >
          <span>&ensp;</span>
        </td>
      )}
      {newLineExtend ? (
        <td className="diff-line-extend-new-content p-0 border-l-[1px] border-l-[#ccc]" colSpan={2}>
          <div className="diff-line-extend-wrapper">
            {renderExtendLine?.({
              diffFile,
              side: SplitSide.new,
              lineNumber: newLine.lineNumber,
              data: newLineExtend.data,
              onUpdate: diffFile.notifyAll,
            })}
          </div>
        </td>
      ) : (
        <td
          className="diff-line-extend-new-placeholder p-0 border-l-[1px] border-l-[#ccc]"
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
  lineNumber,
}: {
  index: number;
  diffFile: DiffFile;
  lineNumber: number;
}) => {
  const { useDiffContext } = useDiffViewContext();

  const extendData = useDiffContext(React.useCallback((s) => s.extendData, []));

  const oldLine = diffFile.getSplitLeftLine(index);

  const newLine = diffFile.getSplitRightLine(index);

  // if the expand action not enabled, the `isHidden` property will never change
  const enableExpand = diffFile.getExpandEnabled();

  const oldLineExtend = extendData?.oldFile?.[oldLine?.lineNumber];

  const newLineExtend = extendData?.newFile?.[newLine?.lineNumber];

  const currentIsShow =
    (oldLineExtend || newLineExtend) && ((!oldLine?.isHidden && !newLine?.isHidden) || !enableExpand);

  if (!currentIsShow) return null;

  return <_DiffSplitExtendLine index={index} diffFile={diffFile} lineNumber={lineNumber} />;
};
