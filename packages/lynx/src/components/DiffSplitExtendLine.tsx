import { SplitSide, type DiffFile } from "@git-diff-view/core";
import { useCallback } from "@lynx-js/react";

import { useDiffViewContext } from "./DiffViewContext";
import { joinClass, surfaceClass } from "../theme";

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

  const { oldLineExtend, newLineExtend, renderExtendLine, onDiffLineClick } = useDiffContext(
    useCallback(
      (s) => ({
        oldLineExtend: s.extendData?.oldFile?.[oldLine?.lineNumber ?? -1],
        newLineExtend: s.extendData?.newFile?.[newLine?.lineNumber ?? -1],
        renderExtendLine: s.renderExtendLine,
        onDiffLineClick: s.onDiffLineClick,
      }),
      [oldLine?.lineNumber, newLine?.lineNumber]
    )
  );

  if (!renderExtendLine) return <view />;
  if (!oldLineExtend?.data && !newLineExtend?.data) return <view />;

  const oldRendered =
    oldLineExtend?.data != null
      ? renderExtendLine({
          diffFile,
          side: SplitSide.old,
          lineNumber: oldLine?.lineNumber ?? -1,
          data: oldLineExtend.data,
          onUpdate: diffFile.notifyAll,
        })
      : null;

  const newRendered =
    newLineExtend?.data != null
      ? renderExtendLine({
          diffFile,
          side: SplitSide.new,
          lineNumber: newLine?.lineNumber ?? -1,
          data: newLineExtend.data,
          onUpdate: diffFile.notifyAll,
        })
      : null;

  return (
    <view className="diff-line diff-split-row diff-extend flex w-full flex-row" flatten={false}>
      <view
        className={joinClass("diff-split-pane min-w-0 flex-1", !oldRendered && surfaceClass("empty"))}
        style={{ flexBasis: "0%" }}
        bindtap={
          oldRendered && onDiffLineClick
            ? () =>
                onDiffLineClick({
                  type: "extend",
                  lineNumber,
                  side: SplitSide.old,
                  oldLineNumber: oldLine?.lineNumber,
                })
            : undefined
        }
      >
        {oldRendered}
      </view>
      <view className="diff-split-divider diff-border-bg w-px flex-shrink-0" style={{ minWidth: "1px" }} />
      <view
        className={joinClass("diff-split-pane min-w-0 flex-1", !newRendered && surfaceClass("empty"))}
        style={{ flexBasis: "0%" }}
        bindtap={
          newRendered && onDiffLineClick
            ? () =>
                onDiffLineClick({
                  type: "extend",
                  lineNumber,
                  side: SplitSide.new,
                  newLineNumber: newLine?.lineNumber,
                })
            : undefined
        }
      >
        {newRendered}
      </view>
    </view>
  );
};
