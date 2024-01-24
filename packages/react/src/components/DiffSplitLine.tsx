import { DiffLineType, type DiffFile, checkDiffLineIncludeChange } from "@git-diff-view/core";
import * as React from "react";

import { useDiffViewContext, SplitSide } from "..";
import { useSyncHeight } from "../hooks/useSyncHeight";

import { emptyBGName, getContentBG, getLineNumberBG, plainLineNumberColorName } from "./color";
import { DiffSplitAddWidget } from "./DiffAddWidget";
import { DiffContent } from "./DiffContent";
import { useDiffWidgetContext } from "./DiffWidgetContext";

const _DiffSplitLine = ({
  index,
  diffFile,
  lineNumber,
  side,
}: {
  index: number;
  side: SplitSide;
  diffFile: DiffFile;
  lineNumber: number;
}) => {
  const getCurrentItem = side === SplitSide.old ? diffFile.getSplitLeftLine : diffFile.getSplitRightLine;

  const getCurrentSyntaxLine = side === SplitSide.old ? diffFile.getOldSyntaxLine : diffFile.getNewSyntaxLine;

  const currentItem = getCurrentItem(index);

  const hasDiff = !!currentItem?.diff;

  const hasChange = checkDiffLineIncludeChange(currentItem?.diff);

  const isAdded = currentItem?.diff?.type === DiffLineType.Add;

  const isDelete = currentItem?.diff?.type === DiffLineType.Delete;

  const { enableWrap, enableHighlight, enableAddWidget, onAddWidgetClick } = useDiffViewContext();

  const { setWidget } = useDiffWidgetContext();

  useSyncHeight({
    selector: `tr[data-line="${lineNumber}"]`,
    enable: hasDiff,
    side: side === SplitSide.old ? "left" : "right",
  });

  const contentBG = getContentBG(isAdded, isDelete, hasDiff);

  const lineNumberBG = getLineNumberBG(isAdded, isDelete, hasDiff);

  const syntaxLine = getCurrentSyntaxLine(currentItem.lineNumber);

  if (currentItem?.lineNumber) {
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
          className="diff-line-num left-0 pl-[10px] pr-[10px] text-right align-top select-none w-[1%] min-w-[50px]"
          style={{
            position: enableWrap ? "relative" : "sticky",
            backgroundColor: lineNumberBG,
            color: `var(${plainLineNumberColorName})`,
          }}
        >
          {hasDiff && enableAddWidget && (
            <DiffSplitAddWidget
              index={index}
              lineNumber={currentItem.lineNumber}
              side={side}
              diffFile={diffFile}
              onWidgetClick={onAddWidgetClick}
              onOpenAddWidget={(lineNumber, side) => setWidget({ widgetLineNumber: lineNumber, widgetSide: side })}
            />
          )}
          <span data-line-num={currentItem.lineNumber} style={{ opacity: hasChange ? undefined : 0.5 }}>
            {currentItem.lineNumber}
          </span>
        </td>
        <td className="diff-line-content pr-[10px] align-top">
          <DiffContent
            enableWrap={enableWrap}
            diffFile={diffFile}
            rawLine={currentItem.value!}
            diffLine={currentItem.diff}
            syntaxLine={syntaxLine}
            enableHighlight={enableHighlight}
          />
        </td>
      </tr>
    );
  } else {
    return (
      <tr
        data-line={lineNumber}
        data-state="diff"
        data-side={side === SplitSide.old ? "left" : "right"}
        style={{ backgroundColor: `var(${emptyBGName})` }}
        className="diff-line diff-line-empty select-none"
      >
        <td
          className="diff-line-num diff-line-num-placeholder pl-[10px] pr-[10px] left-0 w-[1%] min-w-[50px]"
          style={{
            position: enableWrap ? "relative" : "sticky",
          }}
        />
        <td className="diff-line-content diff-line-content-placeholder pr-[10px] align-top" />
      </tr>
    );
  }
};

export const DiffSplitLine = ({
  index,
  diffFile,
  lineNumber,
  side,
}: {
  index: number;
  side: SplitSide;
  diffFile: DiffFile;
  lineNumber: number;
}) => {
  const getCurrentItem = side === SplitSide.old ? diffFile.getSplitLeftLine : diffFile.getSplitRightLine;

  const currentItem = getCurrentItem(index);

  if (currentItem?.isHidden) return null;

  return <_DiffSplitLine index={index} diffFile={diffFile} lineNumber={lineNumber} side={side} />;
};
