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

export const DiffUnifiedContentLine = ({
  index,
  diffFile,
  lineNumber,
}: {
  index: number;
  diffFile: DiffFile;
  lineNumber: number;
}) => {
  const unifiedLine = diffFile.getUnifiedLine(index);

  if (unifiedLine?.isHidden) return <view />;

  const { useDiffContext } = useDiffViewContext();
  const { enableHighlight, enableWrap, fontSize } = useDiffContext.useShallowStableSelector((s) => ({
    enableHighlight: s.enableHighlight,
    enableWrap: s.enableWrap,
    fontSize: s.fontSize || 13,
  }));
  const lineCount = Math.max(diffFile.unifiedLineLength, diffFile.fileLineLength);
  const numColWidth = estimateUnifiedLineNumberWidth(lineCount, fontSize);
  const digitWidth = estimateDigitWidth(lineCount, fontSize);
  const lineHeight = estimateLineHeight(fontSize);

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

  // Match split / react unified: changed lines full opacity, context dimmed.
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

  return (
    <view className="diff-line flex w-full flex-row" flatten={false}>
      {/* 小空白 + 行号 + 中空白 + 行号 + 小空白 — fixed widths, never wrap on native */}
      <view
        className={joinClass("diff-line-num flex flex-shrink-0 flex-row items-start", surfaceClass(numSurface))}
        style={{
          width: `${numColWidth}px`,
          minWidth: `${numColWidth}px`,
          maxWidth: `${numColWidth}px`,
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
      <view
        className={joinClass("diff-line-content min-w-0 flex-1", surfaceClass(contentSurfaceName))}
        style={{ flexBasis: "0%" }}
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
    </view>
  );
};
