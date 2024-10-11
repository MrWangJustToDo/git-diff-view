import * as React from "react";

import { borderColorName, emptyBGName } from "../color";
import { SplitSide } from "../DiffView";
import { useDiffViewContext } from "../DiffViewContext";
import { useDiffWidgetContext } from "../DiffWidgetContext";

import type { DiffFile } from "@git-diff-view/core";

const _DiffSplitWidgetLine = ({
  index,
  diffFile,
  lineNumber,
  oldLineWidget,
  newLineWidget,
}: {
  index: number;
  diffFile: DiffFile;
  lineNumber: number;
  oldLineWidget: boolean;
  newLineWidget: boolean;
}) => {
  const { useWidget } = useDiffWidgetContext();

  const setWidget = useWidget.getReadonlyState().setWidget;

  const { useDiffContext } = useDiffViewContext();

  const renderWidgetLine = useDiffContext.useShallowStableSelector((s) => s.renderWidgetLine);

  const oldLine = diffFile.getSplitLeftLine(index);

  const newLine = diffFile.getSplitRightLine(index);

  if (!renderWidgetLine) return null;

  return (
    <div data-line={`${lineNumber}-widget`} data-state="widget" className="diff-line diff-line-widget flex">
      {oldLineWidget ? (
        <div className="diff-line-widget-old-content w-[50%] p-0">
          <div className="diff-line-widget-wrapper">
            {renderWidgetLine?.({
              diffFile,
              side: SplitSide.old,
              lineNumber: oldLine.lineNumber,
              onClose: () => setWidget({}),
            })}
          </div>
        </div>
      ) : (
        <div
          className="diff-line-widget-old-placeholder w-[50%] select-none p-0"
          style={{ backgroundColor: `var(${emptyBGName})` }}
        >
          <span>&ensp;</span>
        </div>
      )}
      <div className="diff-split-line w-[1px] flex-shrink-0" style={{ backgroundColor: `var(${borderColorName})` }} />
      {newLineWidget ? (
        <div className="diff-line-widget-new-content w-[50%] p-0">
          <div className="diff-line-widget-wrapper">
            {renderWidgetLine?.({
              diffFile,
              side: SplitSide.new,
              lineNumber: newLine.lineNumber,
              onClose: () => setWidget({}),
            })}
          </div>
        </div>
      ) : (
        <div
          className="diff-line-widget-new-placeholder w-[50%] select-none p-0"
          style={{ backgroundColor: `var(${emptyBGName})` }}
        >
          <span>&ensp;</span>
        </div>
      )}
    </div>
  );
};

export const DiffSplitWidgetLine = ({
  index,
  diffFile,
  lineNumber,
}: {
  index: number;
  diffFile: DiffFile;
  lineNumber: number;
}) => {
  const { useWidget } = useDiffWidgetContext();

  const { widgetLineNumber, widgetSide } = useWidget.useShallowStableSelector((s) => ({
    widgetLineNumber: s.widgetLineNumber,
    widgetSide: s.widgetSide,
  }));

  const oldLine = diffFile.getSplitLeftLine(index);

  const newLine = diffFile.getSplitRightLine(index);

  const oldLineWidget = oldLine.lineNumber && widgetSide === SplitSide.old && widgetLineNumber === oldLine.lineNumber;

  const newLineWidget = newLine.lineNumber && widgetSide === SplitSide.new && widgetLineNumber === newLine.lineNumber;

  const currentIsShow = oldLineWidget || newLineWidget;

  if (!currentIsShow) return null;

  return (
    <_DiffSplitWidgetLine
      index={index}
      diffFile={diffFile}
      lineNumber={lineNumber}
      oldLineWidget={oldLineWidget}
      newLineWidget={newLineWidget}
    />
  );
};
