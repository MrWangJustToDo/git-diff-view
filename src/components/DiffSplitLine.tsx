import { DiffFile } from "../diff";
import { DiffLineType } from "../diff/diff-line";
import { useSyncHeight } from "../hooks/useSyncHeight";
import { DiffAddWidget } from "./DiffAddWidget";
import { DiffContent } from "./DiffContent";
import { SplitSide } from "./DiffSplitView";
import {
  addContentBGName,
  addLineNumberBGName,
  delContentBGName,
  delLineNumberBGName,
  emptyBGName,
  expandContentBGName,
  plainContentBGName,
  plainLineNumberBGName,
  plainLineNumberColorName,
} from "./color";

export const DiffSplitLine = ({
  index,
  diffFile,
  lineNumber,
  isWrap,
  side,
  isHighlight,
}: {
  index: number;
  side: SplitSide;
  diffFile: DiffFile;
  lineNumber: number;
  isWrap: boolean;
  isHighlight: boolean;
}) => {
  const getCurrentItem =
    side === SplitSide.old
      ? diffFile.getSplitLeftLine
      : diffFile.getSplitRightLine;

  const getCurrentSyntaxLine =
    side === SplitSide.old
      ? diffFile.getOldSyntaxLine
      : diffFile.getNewSyntaxLine;

  const currentItem = getCurrentItem(index);

  const hasDiff = !!currentItem?.diff || !currentItem?.lineNumber;

  const hasChange = currentItem?.diff?.isIncludeableLine();

  const isAdded = currentItem?.diff?.type === DiffLineType.Add;

  const isDelete = currentItem?.diff?.type === DiffLineType.Delete;

  useSyncHeight({
    selector: `tr[data-line="${lineNumber}"]`,
    enable: hasDiff,
    side: side === SplitSide.old ? "left" : "right",
  });

  const contentBG = isAdded
    ? `var(${addContentBGName})`
    : isDelete
    ? `var(${delContentBGName})`
    : hasDiff
    ? `var(${plainContentBGName})`
    : `var(${expandContentBGName})`;

  const lineNumberBG = isAdded
    ? `var(${addLineNumberBGName})`
    : isDelete
    ? `var(${delLineNumberBGName})`
    : hasDiff
    ? `var(${plainLineNumberBGName})`
    : `var(${expandContentBGName})`;

  if (currentItem?.isHidden) return null;

  if (currentItem?.lineNumber) {
    const syntaxLine = getCurrentSyntaxLine(currentItem.lineNumber);
    return (
      <tr
        data-line={lineNumber}
        data-state={hasDiff ? "diff" : "plain"}
        data-side={side === SplitSide.old ? "left" : "right"}
        data-mode={isAdded ? "add" : isDelete ? "del" : undefined}
        className="diff-line group"
        style={{
          backgroundColor: contentBG,
        }}
      >
        <td
          className="diff-line-num left-[0] pl-[10px] pr-[10px] text-right align-top select-none z-[1]"
          style={{
            position: isWrap ? "relative" : "sticky",
            backgroundColor: lineNumberBG,
            color: `var(${plainLineNumberColorName})`,
          }}
        >
          {hasDiff && <DiffAddWidget diffFile={diffFile} />}
          <span
            data-line-num={currentItem.lineNumber}
            style={{ opacity: hasChange ? undefined : 0.5 }}
          >
            {currentItem.lineNumber}
          </span>
        </td>
        <td className="diff-line-content pr-[10px] align-top relative">
          <DiffContent
            isWrap={isWrap}
            diffFile={diffFile}
            rawLine={currentItem.value!}
            diffLine={currentItem.diff}
            syntaxLine={syntaxLine}
            isHighlight={isHighlight}
          />
        </td>
      </tr>
    );
  } else {
    return (
      <tr
        data-line={lineNumber}
        data-state={hasDiff ? "diff" : "plain"}
        data-side={side === SplitSide.old ? "left" : "right"}
        style={{ backgroundColor: `var(${emptyBGName})` }}
        className="diff-line diff-line-empty select-none"
      >
        <td
          className="diff-line-num diff-line-num-placeholder pl-[10px] pr-[10px] left-[0] z-[1]"
          style={{
            position: isWrap ? "relative" : "sticky",
          }}
        />
        <td className="diff-line-content diff-line-content-placeholder pr-[10px] align-top" />
      </tr>
    );
  }
};
