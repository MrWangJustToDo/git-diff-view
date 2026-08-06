import { SplitSide, type DiffFile } from "@git-diff-view/core";
import { useCallback } from "@lynx-js/react";

import { useDiffViewContext } from "./DiffViewContext";
import { surfaceClass } from "../theme";

export const DiffUnifiedExtendLine = ({
  index,
  diffFile,
  lineNumber,
}: {
  index: number;
  diffFile: DiffFile;
  lineNumber: number;
}) => {
  const { useDiffContext } = useDiffViewContext();
  const unifiedItem = diffFile.getUnifiedLine(index);

  const { oldLineExtend, newLineExtend, renderExtendLine } = useDiffContext(
    useCallback(
      (s) => ({
        oldLineExtend: s.extendData?.oldFile?.[unifiedItem?.oldLineNumber ?? -1],
        newLineExtend: s.extendData?.newFile?.[unifiedItem?.newLineNumber ?? -1],
        renderExtendLine: s.renderExtendLine,
      }),
      [unifiedItem?.oldLineNumber, unifiedItem?.newLineNumber]
    )
  );

  if (!renderExtendLine) return <view />;
  if (!oldLineExtend?.data && !newLineExtend?.data) return <view />;

  return (
    <view className="diff-extend diff-extend-column flex w-full flex-col">
      {oldLineExtend?.data != null
        ? renderExtendLine({
            diffFile,
            side: SplitSide.old,
            lineNumber: unifiedItem.oldLineNumber ?? -1,
            data: oldLineExtend.data,
            onUpdate: diffFile.notifyAll,
          })
        : null}
      {newLineExtend?.data != null
        ? renderExtendLine({
            diffFile,
            side: SplitSide.new,
            lineNumber: unifiedItem.newLineNumber ?? -1,
            data: newLineExtend.data,
            onUpdate: diffFile.notifyAll,
          })
        : null}
      {!oldLineExtend?.data && !newLineExtend?.data ? (
        <view className={surfaceClass("empty") + " h-px"} />
      ) : null}
    </view>
  );
};
