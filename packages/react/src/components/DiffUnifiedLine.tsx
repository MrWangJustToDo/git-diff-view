import { type DiffFile, type SyntaxLine, type DiffLine, checkDiffLineIncludeChange } from "@git-diff-view/core";
import * as React from "react";

import { SplitSide, useDiffViewContext } from "..";

import {
  addContentBGName,
  addLineNumberBGName,
  delContentBGName,
  delLineNumberBGName,
  expandContentBGName,
  plainContentBGName,
  plainLineNumberBGName,
  plainLineNumberColorName,
} from "./color";
import { DiffUnifiedAddWidget } from "./DiffAddWidget";
import { DiffContent } from "./DiffContent";
import { useDiffWidgetContext } from "./DiffWidgetContext";

import type { DiffWidgetContextType } from "./DiffWidgetContext";
import type { DiffViewContextProps } from "..";
import type { Dispatch, SetStateAction } from "react";

const DiffUnifiedOldLine = ({
  index,
  diffLine,
  rawLine,
  syntaxLine,
  lineNumber,
  diffFile,
  setWidget,
  enableWrap,
  enableHighlight,
  onAddWidgetClick,
}: {
  index: number;
  lineNumber: number;
  rawLine: string;
  syntaxLine?: SyntaxLine;
  diffLine?: DiffLine;
  diffFile: DiffFile;
  enableWrap: boolean;
  enableHighlight: boolean;
  onAddWidgetClick?: DiffViewContextProps["onAddWidgetClick"];
  setWidget: Dispatch<SetStateAction<DiffWidgetContextType>>;
}) => {
  return (
    <tr
      data-line={index}
      data-state="diff"
      data-mode="del"
      className="diff-line group"
      style={{ backgroundColor: `var(${delContentBGName})` }}
    >
      <td
        className="diff-line-num left-0 pl-[10px] pr-[10px] text-left select-none w-[1%] min-w-[100px] whitespace-nowrap align-top"
        style={{
          position: enableWrap ? "relative" : "sticky",
          color: `var(${plainLineNumberColorName})`,
          backgroundColor: `var(${delLineNumberBGName})`,
        }}
      >
        <DiffUnifiedAddWidget
          index={index - 1}
          lineNumber={lineNumber}
          diffFile={diffFile}
          side={SplitSide.old}
          onWidgetClick={onAddWidgetClick}
          onOpenAddWidget={(lineNumber, side) => setWidget({ widgetLineNumber: lineNumber, widgetSide: side })}
        />
        <div className="flex">
          <span data-line-num-old={lineNumber} className="inline-block w-[50%]">
            {lineNumber}
          </span>
          <span className="w-[10px] shrink-0" />
          <span className="inline-block w-[50%]" />
        </div>
      </td>
      <td className="diff-line-content pr-[10px] align-top">
        <DiffContent
          enableWrap={enableWrap}
          diffFile={diffFile}
          enableHighlight={enableHighlight}
          rawLine={rawLine}
          diffLine={diffLine}
          syntaxLine={syntaxLine}
        />
      </td>
    </tr>
  );
};

const DiffUnifiedNewLine = ({
  index,
  diffLine,
  rawLine,
  syntaxLine,
  lineNumber,
  diffFile,
  setWidget,
  enableWrap,
  enableHighlight,
  onAddWidgetClick,
}: {
  index: number;
  lineNumber: number;
  rawLine: string;
  syntaxLine?: SyntaxLine;
  diffLine?: DiffLine;
  diffFile: DiffFile;
  enableWrap: boolean;
  enableHighlight: boolean;
  onAddWidgetClick?: DiffViewContextProps["onAddWidgetClick"];
  setWidget: Dispatch<SetStateAction<DiffWidgetContextType>>;
}) => {
  return (
    <tr
      data-line={index}
      data-state="diff"
      data-mode="add"
      className="diff-line group"
      style={{ backgroundColor: `var(${addContentBGName})` }}
    >
      <td
        className="diff-line-num left-0 pl-[10px] pr-[10px] text-right select-none w-[1%] min-w-[100px] whitespace-nowrap align-top"
        style={{
          position: enableWrap ? "relative" : "sticky",
          color: `var(${plainLineNumberColorName})`,
          backgroundColor: `var(${addLineNumberBGName})`,
        }}
      >
        <DiffUnifiedAddWidget
          index={index - 1}
          lineNumber={lineNumber}
          diffFile={diffFile}
          side={SplitSide.new}
          onWidgetClick={onAddWidgetClick}
          onOpenAddWidget={(lineNumber, side) => setWidget({ widgetLineNumber: lineNumber, widgetSide: side })}
        />
        <div className="flex">
          <span className="inline-block w-[50%]" />
          <span className="shrink-0 w-[10px]" />
          <span data-line-num-new={lineNumber} className="inline-block w-[50%]">
            {lineNumber}
          </span>
        </div>
      </td>
      <td className="diff-line-content pr-[10px] align-top">
        <DiffContent
          enableWrap={enableWrap}
          diffFile={diffFile}
          enableHighlight={enableHighlight}
          rawLine={rawLine}
          diffLine={diffLine}
          syntaxLine={syntaxLine}
        />
      </td>
    </tr>
  );
};

const _DiffUnifiedLine = ({
  index,
  diffFile,
  lineNumber,
}: {
  index: number;
  diffFile: DiffFile;
  lineNumber: number;
}) => {
  const unifiedLine = diffFile.getUnifiedLine(index);

  const { enableWrap, enableHighlight, enableAddWidget, onAddWidgetClick } = useDiffViewContext();

  const { setWidget } = useDiffWidgetContext();

  const hasDiff = unifiedLine.diff;

  const hasChange = checkDiffLineIncludeChange(unifiedLine.diff);

  const rawLine = unifiedLine.value || "";

  const diffLine = unifiedLine.diff;

  const newLineNumber = unifiedLine.newLineNumber;

  const oldLinenumber = unifiedLine.oldLineNumber;

  const syntaxLine = newLineNumber
    ? diffFile.getNewSyntaxLine(newLineNumber)
    : oldLinenumber
      ? diffFile.getOldSyntaxLine(oldLinenumber)
      : undefined;

  if (hasChange) {
    if (unifiedLine.oldLineNumber) {
      return (
        <DiffUnifiedOldLine
          index={lineNumber}
          enableWrap={enableWrap}
          diffFile={diffFile}
          rawLine={rawLine}
          diffLine={diffLine}
          setWidget={setWidget}
          syntaxLine={syntaxLine}
          enableHighlight={enableHighlight}
          lineNumber={unifiedLine.oldLineNumber}
          onAddWidgetClick={onAddWidgetClick}
        />
      );
    } else {
      return (
        <DiffUnifiedNewLine
          index={lineNumber}
          enableWrap={enableWrap}
          rawLine={rawLine}
          diffLine={diffLine}
          diffFile={diffFile}
          setWidget={setWidget}
          syntaxLine={syntaxLine}
          enableHighlight={enableHighlight}
          lineNumber={unifiedLine.newLineNumber!}
          onAddWidgetClick={onAddWidgetClick}
        />
      );
    }
  } else {
    return (
      <tr
        data-line={lineNumber}
        data-state={unifiedLine.diff ? "diff" : "plain"}
        className="diff-line group"
        style={{
          backgroundColor: hasDiff ? `var(${plainContentBGName})` : `var(${expandContentBGName})`,
        }}
      >
        <td
          className="diff-line-num left-0 pl-[10px] pr-[10px] text-right select-none w-[1%] min-w-[100px] whitespace-nowrap align-top"
          style={{
            position: enableWrap ? "relative" : "sticky",
            color: `var(${plainLineNumberColorName})`,
            backgroundColor: hasDiff ? `var(${plainLineNumberBGName})` : `var(${expandContentBGName})`,
          }}
        >
          {enableAddWidget && hasDiff && (
            <DiffUnifiedAddWidget
              index={index}
              diffFile={diffFile}
              lineNumber={unifiedLine.newLineNumber}
              side={SplitSide.new}
              onWidgetClick={onAddWidgetClick}
              onOpenAddWidget={(lineNumber, side) => setWidget({ widgetLineNumber: lineNumber, widgetSide: side })}
            />
          )}
          <div className="flex opacity-[0.5]">
            <span data-line-num-old={unifiedLine.oldLineNumber} className="inline-block w-[50%]">
              {unifiedLine.oldLineNumber}
            </span>
            <span className="w-[10px] shrink-0" />
            <span data-line-num-new={unifiedLine.newLineNumber} className="inline-block w-[50%]">
              {unifiedLine.newLineNumber}
            </span>
          </div>
        </td>
        <td className="diff-line-content pr-[10px] align-top">
          <DiffContent
            enableWrap={enableWrap}
            diffFile={diffFile}
            enableHighlight={enableHighlight}
            rawLine={rawLine}
            diffLine={diffLine}
            syntaxLine={syntaxLine}
          />
        </td>
      </tr>
    );
  }
};

export const DiffUnifiedLine = ({
  index,
  diffFile,
  lineNumber,
}: {
  index: number;
  diffFile: DiffFile;
  lineNumber: number;
}) => {
  const unifiedLine = diffFile.getUnifiedLine(index);

  if (unifiedLine?.isHidden) return null;

  return <_DiffUnifiedLine index={index} diffFile={diffFile} lineNumber={lineNumber} />;
};
