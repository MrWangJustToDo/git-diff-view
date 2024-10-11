import * as React from "react";

import { borderColorName, emptyBGName } from "../color";
import { SplitSide } from "../DiffView";
import { useDiffViewContext } from "../DiffViewContext";

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
  const renderExtendLine = useDiffContext.useShallowStableSelector((s) => s.renderExtendLine);

  if (!renderExtendLine) return null;

  return (
    <div data-line={`${lineNumber}-extend`} data-state="extend" className="diff-line diff-line-extend flex">
      {oldLineExtend ? (
        <div className="diff-line-extend-old-content w-[50%] p-0">
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
        </div>
      ) : (
        <div
          className="diff-line-extend-old-placeholder w-[50%] select-none p-0"
          style={{ backgroundColor: `var(${emptyBGName})` }}
        >
          <span>&ensp;</span>
        </div>
      )}
      <div className="diff-split-line w-[1px]" style={{ backgroundColor: `var(${borderColorName})` }} />
      {newLineExtend ? (
        <div className="diff-line-extend-new-content w-[50%] p-0">
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
        </div>
      ) : (
        <div
          className="diff-line-extend-new-placeholder w-[50%] select-none p-0"
          style={{ backgroundColor: `var(${emptyBGName})` }}
        >
          <span>&ensp;</span>
        </div>
      )}
    </div>
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
