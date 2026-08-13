import { DiffLineType, SplitSide, checkDiffLineIncludeChange, type DiffFile } from "@git-diff-view/core";

import { DiffContent } from "./DiffContent";
import { useDiffViewContext } from "./DiffViewContext";
import {
  estimateDigitWidth,
  estimateLineHeight,
  estimateLineNumberWidth,
  SPLIT_NUM_PAD_END,
  SPLIT_NUM_PAD_START,
} from "./styleUtils";
import { contentSurface, joinClass, lineNumberSurface, surfaceClass } from "../theme";

export const DiffSplitContentLine = ({
  index,
  diffFile,
  lineNumber,
}: {
  index: number;
  diffFile: DiffFile;
  lineNumber: number;
}) => {
  const oldLine = diffFile.getSplitLeftLine(index);
  const newLine = diffFile.getSplitRightLine(index);

  if (oldLine?.isHidden && newLine?.isHidden) {
    return <view />;
  }

  const { useDiffContext } = useDiffViewContext();
  const { enableHighlight, fontSize, onDiffLineClick } = useDiffContext.useShallowStableSelector((s) => ({
    enableHighlight: s.enableHighlight,
    fontSize: s.fontSize || 13,
    onDiffLineClick: s.onDiffLineClick,
  }));
  const lineCount = Math.max(diffFile.splitLineLength, diffFile.fileLineLength);
  const asideWidth = estimateLineNumberWidth(lineCount, fontSize);
  const digitWidth = estimateDigitWidth(lineCount, fontSize);
  const lineHeight = estimateLineHeight(fontSize);

  const oldSyntaxLine = diffFile.getOldSyntaxLine(oldLine?.lineNumber ?? -1);
  const newSyntaxLine = diffFile.getNewSyntaxLine(newLine?.lineNumber ?? -1);
  const oldPlainLine = diffFile.getOldPlainLine(oldLine?.lineNumber ?? -1);
  const newPlainLine = diffFile.getNewPlainLine(newLine?.lineNumber ?? -1);

  const hasDiff = !!oldLine?.diff || !!newLine?.diff;
  const hasChange = checkDiffLineIncludeChange(oldLine?.diff) || checkDiffLineIncludeChange(newLine?.diff);
  const oldLineIsDelete = oldLine?.diff?.type === DiffLineType.Delete;
  const newLineIsAdded = newLine?.diff?.type === DiffLineType.Add;

  const hasOldLine = !!oldLine?.lineNumber;
  const hasNewLine = !!newLine?.lineNumber;

  const oldContentSurface = contentSurface(false, oldLineIsDelete, hasDiff);
  const oldNumSurface = lineNumberSurface(false, oldLineIsDelete, hasDiff);
  const newContentSurface = contentSurface(newLineIsAdded, false, hasDiff);
  const newNumSurface = lineNumberSurface(newLineIsAdded, false, hasDiff);
  const numFgClass = hasDiff ? "diff-fg-num" : "diff-fg-num-expand";

  const renderSide = (
    hasLine: boolean,
    line: typeof oldLine,
    side: SplitSide,
    numSurface: ReturnType<typeof lineNumberSurface>,
    contentSurfaceName: ReturnType<typeof contentSurface>,
    plainLine: ReturnType<DiffFile["getOldPlainLine"]>,
    syntaxLine: ReturnType<DiffFile["getOldSyntaxLine"]>
  ) => (
    <view
      className={joinClass(
        "diff-split-pane flex min-w-0 flex-1 flex-row items-stretch",
        surfaceClass(hasLine ? contentSurfaceName : "empty")
      )}
      style={{ flexBasis: "0%" }}
      bindtap={
        hasLine && onDiffLineClick
          ? () =>
              onDiffLineClick({
                type: "content",
                lineNumber,
                side,
                oldLineNumber: side === SplitSide.old ? line?.lineNumber : undefined,
                newLineNumber: side === SplitSide.new ? line?.lineNumber : undefined,
              })
          : undefined
      }
    >
      <view
        className={joinClass(
          "diff-line-num flex flex-shrink-0 items-start justify-end",
          surfaceClass(hasLine ? numSurface : "empty")
        )}
        style={{
          width: `${asideWidth}px`,
          minWidth: `${asideWidth}px`,
          maxWidth: `${asideWidth}px`,
          paddingLeft: `${SPLIT_NUM_PAD_START}px`,
          paddingRight: `${SPLIT_NUM_PAD_END}px`,
        }}
      >
        {hasLine ? (
          <text
            className={joinClass(numFgClass, "text-right")}
            style={{
              width: `${digitWidth}px`,
              opacity: hasChange ? 1 : 0.5,
              lineHeight: `${lineHeight}px`,
              whiteSpace: "nowrap",
            }}
          >
            {String(line!.lineNumber)}
          </text>
        ) : (
          <text style={{ width: `${digitWidth}px`, lineHeight: `${lineHeight}px`, whiteSpace: "nowrap" }}>
            {"\u00A0"}
          </text>
        )}
      </view>
      <view
        className={joinClass(
          "diff-line-content min-w-0 flex-1 pr-[10px]",
          surfaceClass(hasLine ? contentSurfaceName : "empty")
        )}
        style={{ flexBasis: "0%" }}
      >
        {hasLine ? (
          <DiffContent
            enableWrap={true}
            diffFile={diffFile}
            rawLine={line!.value || ""}
            diffLine={line!.diff}
            plainLine={plainLine}
            syntaxLine={syntaxLine}
            enableHighlight={!!enableHighlight}
          />
        ) : (
          <text>{"\u00A0"}</text>
        )}
      </view>
    </view>
  );

  return (
    <view className="diff-line diff-split-row flex w-full flex-row items-stretch" flatten={false}>
      {renderSide(hasOldLine, oldLine, SplitSide.old, oldNumSurface, oldContentSurface, oldPlainLine, oldSyntaxLine)}
      <view className="diff-split-divider diff-border-bg w-px flex-shrink-0" style={{ minWidth: "1px" }} />
      {renderSide(hasNewLine, newLine, SplitSide.new, newNumSurface, newContentSurface, newPlainLine, newSyntaxLine)}
    </view>
  );
};
