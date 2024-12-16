import { type DiffFile, type SyntaxLine, type DiffLine, checkDiffLineIncludeChange } from "@git-diff-view/core";
import {
  diffAsideWidthName,
  addContentBGName,
  addLineNumberBGName,
  delContentBGName,
  delLineNumberBGName,
  expandContentBGName,
  plainContentBGName,
  plainLineNumberBGName,
  plainLineNumberColorName,
} from "@git-diff-view/utils";
import * as React from "react";
import { memo } from "react";

import { SplitSide, useDiffViewContext } from "..";

import { DiffUnifiedAddWidget } from "./DiffAddWidget";
import { DiffContent } from "./DiffContent";
import { useDiffWidgetContext } from "./DiffWidgetContext";

import type { DiffViewProps } from "..";

const DiffUnifiedOldLine = ({
  index,
  diffLine,
  rawLine,
  syntaxLine,
  lineNumber,
  diffFile,
  setWidget,
  enableWrap,
  enableAddWidget,
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
  enableAddWidget: boolean;
  enableHighlight: boolean;
  onAddWidgetClick?: DiffViewProps<any>["onAddWidgetClick"];
  setWidget: (props: { side?: SplitSide; lineNumber?: number }) => void;
}) => {
  return (
    <tr data-line={index} data-state="diff" className="diff-line group">
      <td
        className="diff-line-num sticky left-0 w-[1%] min-w-[100px] select-none whitespace-nowrap pl-[10px] pr-[10px] text-right align-top"
        style={{
          color: `var(${plainLineNumberColorName})`,
          backgroundColor: `var(${delLineNumberBGName})`,
          width: `calc(calc(var(${diffAsideWidthName}) + 5px) * 2)`,
          maxWidth: `calc(calc(var(${diffAsideWidthName}) + 5px) * 2)`,
          minWidth: `calc(calc(var(${diffAsideWidthName}) + 5px) * 2)`,
        }}
      >
        {enableAddWidget && (
          <DiffUnifiedAddWidget
            index={index - 1}
            lineNumber={lineNumber}
            diffFile={diffFile}
            side={SplitSide.old}
            onWidgetClick={onAddWidgetClick}
            onOpenAddWidget={(lineNumber, side) => setWidget({ lineNumber, side })}
          />
        )}
        <div className="flex">
          <span data-line-old-num={lineNumber} className="inline-block w-[50%]">
            {lineNumber}
          </span>
          <span className="w-[10px] shrink-0" />
          <span className="inline-block w-[50%]" />
        </div>
      </td>
      <td className="diff-line-content pr-[10px] align-top" style={{ backgroundColor: `var(${delContentBGName})` }}>
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
  enableAddWidget,
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
  enableAddWidget: boolean;
  enableHighlight: boolean;
  onAddWidgetClick?: DiffViewProps<any>["onAddWidgetClick"];
  setWidget: (props: { side?: SplitSide; lineNumber?: number }) => void;
}) => {
  return (
    <tr data-line={index} data-state="diff" className="diff-line group">
      <td
        className="diff-line-num sticky left-0 w-[1%] min-w-[100px] select-none whitespace-nowrap pl-[10px] pr-[10px] text-right align-top"
        style={{
          color: `var(${plainLineNumberColorName})`,
          backgroundColor: `var(${addLineNumberBGName})`,
          width: `calc(calc(var(${diffAsideWidthName}) + 5px) * 2)`,
          maxWidth: `calc(calc(var(${diffAsideWidthName}) + 5px) * 2)`,
          minWidth: `calc(calc(var(${diffAsideWidthName}) + 5px) * 2)`,
        }}
      >
        {enableAddWidget && (
          <DiffUnifiedAddWidget
            index={index - 1}
            lineNumber={lineNumber}
            diffFile={diffFile}
            side={SplitSide.new}
            onWidgetClick={onAddWidgetClick}
            onOpenAddWidget={(lineNumber, side) => setWidget({ lineNumber, side })}
          />
        )}
        <div className="flex">
          <span className="inline-block w-[50%]" />
          <span className="w-[10px] shrink-0" />
          <span data-line-new-num={lineNumber} className="inline-block w-[50%]">
            {lineNumber}
          </span>
        </div>
      </td>
      <td className="diff-line-content pr-[10px] align-top" style={{ backgroundColor: `var(${addContentBGName})` }}>
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

const _DiffUnifiedLine = memo(
  ({ index, diffFile, lineNumber }: { index: number; diffFile: DiffFile; lineNumber: number }) => {
    const unifiedLine = diffFile.getUnifiedLine(index);

    const { useDiffContext } = useDiffViewContext();

    const { enableWrap, enableHighlight, enableAddWidget, onAddWidgetClick } = useDiffContext.useShallowStableSelector(
      (s) => ({
        enableWrap: s.enableWrap,
        enableHighlight: s.enableHighlight,
        enableAddWidget: s.enableAddWidget,
        onAddWidgetClick: s.onAddWidgetClick,
      })
    );

    const { useWidget } = useDiffWidgetContext();

    const setWidget = useWidget.getReadonlyState().setWidget;

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
            enableAddWidget={enableAddWidget}
            lineNumber={unifiedLine.oldLineNumber}
            onAddWidgetClick={(...props) => onAddWidgetClick.current?.(...props)}
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
            enableAddWidget={enableAddWidget}
            lineNumber={unifiedLine.newLineNumber!}
            onAddWidgetClick={(...props) => onAddWidgetClick.current?.(...props)}
          />
        );
      }
    } else {
      return (
        <tr data-line={lineNumber} data-state={unifiedLine.diff ? "diff" : "plain"} className="diff-line group">
          <td
            className="diff-line-num sticky left-0 w-[1%] min-w-[100px] select-none whitespace-nowrap pl-[10px] pr-[10px] text-right align-top"
            style={{
              color: `var(${plainLineNumberColorName})`,
              width: `calc(calc(var(${diffAsideWidthName}) + 5px) * 2)`,
              maxWidth: `calc(calc(var(${diffAsideWidthName}) + 5px) * 2)`,
              minWidth: `calc(calc(var(${diffAsideWidthName}) + 5px) * 2)`,
              backgroundColor: hasDiff ? `var(${plainLineNumberBGName})` : `var(${expandContentBGName})`,
            }}
          >
            {enableAddWidget && hasDiff && (
              <DiffUnifiedAddWidget
                index={index}
                diffFile={diffFile}
                lineNumber={unifiedLine.newLineNumber}
                side={SplitSide.new}
                onWidgetClick={(...props) => onAddWidgetClick.current?.(...props)}
                onOpenAddWidget={(lineNumber, side) => setWidget({ lineNumber, side })}
              />
            )}
            <div className="flex opacity-[0.5]">
              <span data-line-old-num={unifiedLine.oldLineNumber} className="inline-block w-[50%]">
                {unifiedLine.oldLineNumber}
              </span>
              <span className="w-[10px] shrink-0" />
              <span data-line-new-num={unifiedLine.newLineNumber} className="inline-block w-[50%]">
                {unifiedLine.newLineNumber}
              </span>
            </div>
          </td>
          <td
            className="diff-line-content pr-[10px] align-top"
            style={{
              backgroundColor: hasDiff ? `var(${plainContentBGName})` : `var(${expandContentBGName})`,
            }}
          >
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
  }
);

_DiffUnifiedLine.displayName = "_DiffUnifiedLine";

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

  if (unifiedLine?.isHidden) return null;

  return <_DiffUnifiedLine index={index} diffFile={diffFile} lineNumber={lineNumber} />;
};
