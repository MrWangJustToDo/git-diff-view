import { DiffLineType, type DiffFile, checkDiffLineIncludeChange } from "@git-diff-view/core";
import {
  getContentBG,
  getLineNumberBG,
  plainLineNumberColorName,
  diffAsideWidthName,
  emptyBGName,
} from "@git-diff-view/utils";
import * as React from "react";

import { SplitSide } from "..";

import { DiffSplitAddWidget } from "./DiffAddWidget";
import { DiffContent } from "./DiffContent";
// import { DiffContent_v2 } from "./DiffContent_v2";
import { useDiffViewContext } from "./DiffViewContext";
import { useDiffWidgetContext } from "./DiffWidgetContext";

const InternalDiffSplitLine = ({
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

  const { enableHighlight, enableAddWidget, onAddWidgetClick } = useDiffContext.useShallowStableSelector((s) => ({
    enableHighlight: s.enableHighlight,
    enableAddWidget: s.enableAddWidget,
    onAddWidgetClick: s.onAddWidgetClick,
  }));

  const { useWidget } = useDiffWidgetContext();

  const setWidget = useWidget.getReadonlyState().setWidget;

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
            className={`diff-line-${SplitSide[side]}-num sticky left-0 w-[1%] min-w-[40px] select-none pl-[10px] pr-[10px] text-right align-top`}
            style={{
              backgroundColor: lineNumberBG,
              color: `var(${plainLineNumberColorName})`,
              width: `var(${diffAsideWidthName})`,
              minWidth: `var(${diffAsideWidthName})`,
              maxWidth: `var(${diffAsideWidthName})`,
            }}
          >
            {hasDiff && enableAddWidget && (
              <DiffSplitAddWidget
                index={index}
                lineNumber={currentLine.lineNumber}
                side={side}
                diffFile={diffFile}
                onWidgetClick={(...props) => onAddWidgetClick.current?.(...props)}
                className="absolute left-[100%] z-[1] translate-x-[-50%]"
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

export const DiffSplitContentLine = ({
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

  return <InternalDiffSplitLine index={index} diffFile={diffFile} lineNumber={lineNumber} side={side} />;
};
