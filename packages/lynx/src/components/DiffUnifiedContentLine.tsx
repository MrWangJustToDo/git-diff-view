import {
  DiffLineType,
  checkDiffLineIncludeChange,
  type DiffFile,
} from "@git-diff-view/core";

import { DiffContent } from "./DiffContent";
import { useDiffViewContext } from "./DiffViewContext";
import {
  estimateDigitWidth,
  estimateLineHeight,
  estimateUnifiedLineNumberWidth,
  UNIFIED_NUM_PAD_EDGE,
  UNIFIED_NUM_PAD_MID,
} from "./styleUtils";
import { joinClass, surfaceClass, type DiffSurface } from "../theme";

import type { UnifiedNowrapPane } from "./styleUtils";

export const DiffUnifiedContentLine = ({
  index,
  diffFile,
  lineNumber,
  tableWidth,
  pane,
}: {
  index: number;
  diffFile: DiffFile;
  lineNumber: number;
  /** When set (nowrap), content column width = tableWidth - numCol. */
  tableWidth?: number;
  pane?: UnifiedNowrapPane;
}) => {
  const unifiedLine = diffFile.getUnifiedLine(index);

  if (unifiedLine?.isHidden) return <view />;

  const { useDiffContext } = useDiffViewContext();
  const { enableHighlight, enableWrap, fontSize, onDiffLineClick } = useDiffContext.useShallowStableSelector((s) => ({
    enableHighlight: s.enableHighlight,
    enableWrap: s.enableWrap,
    fontSize: s.fontSize || 13,
    onDiffLineClick: s.onDiffLineClick,
  }));
  const lineCount = Math.max(diffFile.unifiedLineLength, diffFile.fileLineLength);
  const numColWidth = estimateUnifiedLineNumberWidth(lineCount, fontSize);
  const digitWidth = estimateDigitWidth(lineCount, fontSize);
  const lineHeight = estimateLineHeight(fontSize);
  const nowrap = !enableWrap && (pane != null || tableWidth != null);
  const contentColWidth = nowrap && tableWidth != null ? Math.max(0, tableWidth - numColWidth) : undefined;
  const showGutter = pane !== "content";
  const showContent = pane !== "gutter";

  const hasDiff = !!unifiedLine.diff;
  const hasChange = checkDiffLineIncludeChange(unifiedLine.diff);
  const rawLine = unifiedLine.value || "";
  const diffLine = unifiedLine.diff;
  const newLineNumber = unifiedLine.newLineNumber;
  const oldLineNumber = unifiedLine.oldLineNumber;

  const syntaxLine = newLineNumber
    ? diffFile.getNewSyntaxLine(newLineNumber)
    : oldLineNumber
      ? diffFile.getOldSyntaxLine(oldLineNumber)
      : undefined;

  const plainLine = newLineNumber
    ? diffFile.getNewPlainLine(newLineNumber)
    : oldLineNumber
      ? diffFile.getOldPlainLine(oldLineNumber)
      : undefined;

  const isDelete = hasChange && !!oldLineNumber;
  const isAdd = hasChange && !!newLineNumber && !oldLineNumber;

  let numSurface: DiffSurface = hasDiff ? "plain-num" : "expand-num";
  let contentSurfaceName: DiffSurface = hasDiff ? "plain" : "expand";

  if (isDelete) {
    numSurface = "del-num";
    contentSurfaceName = "del";
  } else if (isAdd || (hasChange && diffLine?.type === DiffLineType.Add)) {
    numSurface = "add-num";
    contentSurfaceName = "add";
  }

  const numFgClass = hasDiff ? "diff-fg-num" : "diff-fg-num-expand";
  const numOpacity = hasChange ? 1 : 0.5;

  const numTextStyle = {
    width: `${digitWidth}px`,
    minWidth: `${digitWidth}px`,
    maxWidth: `${digitWidth}px`,
    opacity: numOpacity,
    lineHeight: `${lineHeight}px`,
    whiteSpace: "nowrap" as const,
  };

  const rowBindtap = onDiffLineClick
    ? () =>
        onDiffLineClick({
          type: "content",
          lineNumber,
          oldLineNumber: oldLineNumber ?? undefined,
          newLineNumber: newLineNumber ?? undefined,
        })
    : undefined;

  const rowHeightStyle = nowrap
    ? { height: `${lineHeight}px`, minHeight: `${lineHeight}px`, maxHeight: `${lineHeight}px` }
    : undefined;

  return (
    <view
      className={pane ? "diff-line flex flex-col" : "diff-line flex flex-row"}
      flatten={false}
      style={
        pane === "gutter"
          ? { width: "100%", ...rowHeightStyle }
          : pane === "content"
            ? { width: "100%", ...rowHeightStyle }
            : nowrap
              ? { width: `${tableWidth}px`, ...rowHeightStyle }
              : { width: "100%" }
      }
      bindtap={rowBindtap}
    >
      {showGutter ? (
        <view
          className={joinClass("diff-line-num flex flex-shrink-0 flex-row items-start", surfaceClass(numSurface))}
          style={{
            width: `${numColWidth}px`,
            minWidth: `${numColWidth}px`,
            maxWidth: `${numColWidth}px`,
            minHeight: `${lineHeight}px`,
            paddingLeft: `${UNIFIED_NUM_PAD_EDGE}px`,
            paddingRight: `${UNIFIED_NUM_PAD_EDGE}px`,
          }}
        >
          <text className={joinClass(numFgClass, "text-right")} style={numTextStyle}>
            {oldLineNumber != null ? String(oldLineNumber) : "\u00A0"}
          </text>
          <view
            className="flex-shrink-0"
            style={{ width: `${UNIFIED_NUM_PAD_MID}px`, minWidth: `${UNIFIED_NUM_PAD_MID}px` }}
          />
          <text className={joinClass(numFgClass, "text-right")} style={numTextStyle}>
            {newLineNumber != null ? String(newLineNumber) : "\u00A0"}
          </text>
        </view>
      ) : null}
      {showContent ? (
        <view
          className={joinClass(
            nowrap ? "diff-line-content flex-shrink-0 pr-[10px]" : "diff-line-content min-w-0 flex-1",
            surfaceClass(contentSurfaceName)
          )}
          style={
            nowrap
              ? {
                  width: pane ? "100%" : `${contentColWidth}px`,
                  minWidth: pane ? "100%" : `${contentColWidth}px`,
                  minHeight: `${lineHeight}px`,
                }
              : { flexBasis: "0%" }
          }
        >
          <DiffContent
            enableWrap={!!enableWrap}
            diffFile={diffFile}
            enableHighlight={!!enableHighlight}
            rawLine={rawLine}
            diffLine={diffLine}
            plainLine={plainLine}
            syntaxLine={syntaxLine}
          />
        </view>
      ) : null}
    </view>
  );
};
