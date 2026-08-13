import { DiffFileLineType, SplitSide, type DiffFile } from "@git-diff-view/core";
import { useCallback } from "@lynx-js/react";

import { useDiffViewContext } from "./DiffViewContext";
import { estimateListItemHeight } from "./styleUtils";
import { surfaceClass } from "../theme";

import type { UnifiedNowrapPane } from "./styleUtils";

export const DiffUnifiedExtendLine = ({
  index,
  diffFile,
  lineNumber,
  tableWidth,
  pane,
}: {
  index: number;
  diffFile: DiffFile;
  lineNumber: number;
  tableWidth?: number;
  pane?: UnifiedNowrapPane;
}) => {
  const { useDiffContext } = useDiffViewContext();
  const unifiedItem = diffFile.getUnifiedLine(index);

  const { oldLineExtend, newLineExtend, renderExtendLine, onDiffLineClick, fontSize, enableWrap } = useDiffContext(
    useCallback(
      (s) => ({
        oldLineExtend: s.extendData?.oldFile?.[unifiedItem?.oldLineNumber ?? -1],
        newLineExtend: s.extendData?.newFile?.[unifiedItem?.newLineNumber ?? -1],
        renderExtendLine: s.renderExtendLine,
        onDiffLineClick: s.onDiffLineClick,
        fontSize: s.fontSize || 13,
        enableWrap: s.enableWrap ?? true,
      }),
      [unifiedItem?.oldLineNumber, unifiedItem?.newLineNumber]
    )
  );

  if (!renderExtendLine) return <view />;
  if (!oldLineExtend?.data && !newLineExtend?.data) return <view />;

  const nowrap = !enableWrap && (pane != null || tableWidth != null);
  const rowHeight = estimateListItemHeight(DiffFileLineType.extend, fontSize);
  const paneWidth = pane ? "100%" : tableWidth != null ? `${tableWidth}px` : "100%";

  return (
    <view
      className="diff-extend diff-extend-column flex flex-col"
      style={{
        width: paneWidth,
        ...(nowrap ? { height: `${rowHeight}px`, minHeight: `${rowHeight}px`, overflow: "hidden" } : null),
      }}
      bindtap={
        onDiffLineClick
          ? () =>
              onDiffLineClick({
                type: "extend",
                lineNumber,
                oldLineNumber: unifiedItem?.oldLineNumber ?? undefined,
                newLineNumber: unifiedItem?.newLineNumber ?? undefined,
              })
          : undefined
      }
    >
      {pane === "gutter" ? (
        <view className={surfaceClass("empty")} style={{ width: "100%", height: `${rowHeight}px` }} />
      ) : (
        <view className="flex flex-col" style={{ width: "100%" }}>
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
      )}
    </view>
  );
};
