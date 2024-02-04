import { DiffLineType, type DiffFile, checkDiffLineIncludeChange } from "@git-diff-view/core";
import * as React from "react";

import { useDiffViewContext, SplitSide } from "..";

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
  const getCurrentSyntaxLine = side === SplitSide.old ? diffFile.getOldSyntaxLine : diffFile.getNewSyntaxLine;

  const oldLine = diffFile.getSplitLeftLine(index);

  const newLine = diffFile.getSplitRightLine(index);

  const currentLine = side === SplitSide.old ? oldLine : newLine;

  const hasDiff = !!currentLine?.diff;

  const hasContent = !!currentLine.lineNumber;

  const hasChange = checkDiffLineIncludeChange(currentLine?.diff);

  const isAdded = currentLine?.diff?.type === DiffLineType.Add;

  const isDelete = currentLine?.diff?.type === DiffLineType.Delete;

  const { useDiffContext } = useDiffViewContext();

  const { enableHighlight, enableAddWidget, onAddWidgetClick } = useDiffContext(
    React.useCallback(
      (s) => ({
        enableHighlight: s.enableHighlight,
        enableAddWidget: s.enableAddWidget,
        onAddWidgetClick: s.onAddWidgetClick,
      }),
      []
    )
  );

  const { useWidget } = useDiffWidgetContext();

  const { setWidget } = useWidget.getReadonlyState();

  const contentBG = getContentBG(isAdded, isDelete, hasDiff);

  const lineNumberBG = getLineNumberBG(isAdded, isDelete, hasDiff);

  const syntaxLine = getCurrentSyntaxLine(currentLine.lineNumber);

  return (
    <tr
      data-line={lineNumber}
      data-state={hasDiff || !hasContent ? "diff" : "plain"}
      data-side={SplitSide[side]}
      className={"diff-line" + (hasContent ? " group" : "")}
    >
      {hasContent ? (
        <>
          <td
            className={`diff-line-${SplitSide[side]}-num sticky left-0 pl-[10px] pr-[10px] text-right align-top select-none w-[1%] min-w-[40px]`}
            style={{
              backgroundColor: lineNumberBG,
              color: `var(${plainLineNumberColorName})`,
            }}
          >
            {hasDiff && enableAddWidget && (
              <DiffSplitAddWidget
                index={index}
                lineNumber={currentLine.lineNumber}
                side={side}
                diffFile={diffFile}
                onWidgetClick={onAddWidgetClick}
                className="absolute left-[100%] translate-x-[-50%] z-[1]"
                onOpenAddWidget={(lineNumber, side) => setWidget({ lineNumber: lineNumber, side: side })}
              />
            )}
            <span data-line-num={currentLine.lineNumber} style={{ opacity: hasChange ? undefined : 0.5 }}>
              {currentLine.lineNumber}
            </span>
          </td>
          <td
            className={`diff-line-${SplitSide[side]}-content pr-[10px] align-top`}
            style={{ backgroundColor: contentBG }}
          >
            <DiffContent
              enableWrap={false}
              diffFile={diffFile}
              rawLine={currentLine.value!}
              diffLine={currentLine.diff}
              syntaxLine={syntaxLine}
              enableHighlight={enableHighlight}
            />
          </td>
        </>
      ) : (
        <td
          className={`diff-line-${SplitSide[side]}-placeholder select-none`}
          style={{ backgroundColor: `var(${emptyBGName})` }}
          colSpan={2}
        >
          <span>&ensp;</span>
        </td>
      )}
    </tr>
  );
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
  const getCurrentLine = side === SplitSide.old ? diffFile.getSplitLeftLine : diffFile.getSplitRightLine;

  const currentLine = getCurrentLine(index);

  if (currentLine?.isHidden) return null;

  return <_DiffSplitLine index={index} diffFile={diffFile} lineNumber={lineNumber} side={side} />;
};
