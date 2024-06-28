import * as React from "react";

import { useDiffViewContext, SplitSide } from "..";

import { emptyBGName } from "./color";

import type { DiffFile } from "@git-diff-view/core";

const _DiffSplitExtendLine = ({
  index,
  diffFile,
  lineNumber,
  oldLineExtend,
  newLineExtend,
}: {
  index: number;
  diffFile: DiffFile;
  lineNumber: number;
  oldLineExtend: { data: any };
  newLineExtend: { data: any };
}) => {
  const { useDiffContext } = useDiffViewContext();

  const oldLine = diffFile.getSplitLeftLine(index);

  const newLine = diffFile.getSplitRightLine(index);

  // 需要显示的时候才进行方法订阅，可以大幅度提高性能
  const renderExtendLine = useDiffContext(React.useCallback((s) => s.renderExtendLine, []));

  if (!renderExtendLine) return null;

  return (
    <tr data-line={`${lineNumber}-extend`} data-state="extend" className="diff-line diff-line-extend">
      {oldLineExtend ? (
        <td className="diff-line-extend-old-content p-0" colSpan={2}>
          <div className="diff-line-extend-wrapper">
            {oldLineExtend?.data &&
              renderExtendLine?.({
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
          className="diff-line-extend-old-placeholder select-none p-0"
          style={{ backgroundColor: `var(${emptyBGName})` }}
          colSpan={2}
        >
          <span>&ensp;</span>
        </td>
      )}
      {newLineExtend ? (
        <td className="diff-line-extend-new-content border-l-[1px] border-l-[rgb(222,222,222)] p-0" colSpan={2}>
          <div className="diff-line-extend-wrapper">
            {newLineExtend?.data &&
              renderExtendLine?.({
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
          className="diff-line-extend-new-placeholder select-none border-l-[1px] border-l-[rgb(222,222,222)] p-0"
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

  const currentIsShow = hasExtend && ((!oldLine?.isHidden && !newLine?.isHidden) || !enableExpand);

  if (!currentIsShow) return null;

  return (
    <_DiffSplitExtendLine
      index={index}
      diffFile={diffFile}
      lineNumber={lineNumber}
      oldLineExtend={oldLineExtend}
      newLineExtend={newLineExtend}
    />
  );
};
