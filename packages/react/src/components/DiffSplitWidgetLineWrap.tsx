import * as React from "react";

import { useDiffViewContext, SplitSide } from "..";

import { borderColorName, emptyBGName } from "./color";
import { useDiffWidgetContext } from "./DiffWidgetContext";

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

  const oldWidgetRendered =
    oldLineWidget &&
    renderWidgetLine?.({ diffFile, side: SplitSide.old, lineNumber: oldLine.lineNumber, onClose: () => setWidget({}) });

  const newWidgetRendered =
    newLineWidget &&
    renderWidgetLine?.({ diffFile, side: SplitSide.new, lineNumber: newLine.lineNumber, onClose: () => setWidget({}) });

  if (!renderWidgetLine) return null;

  return (
    <tr data-line={`${lineNumber}-widget`} data-state="widget" className="diff-line diff-line-widget">
      {oldWidgetRendered ? (
        <td className="diff-line-widget-old-content p-0" colSpan={2}>
          <div className="diff-line-widget-wrapper">{oldWidgetRendered}</div>
        </td>
      ) : (
        <td
          className="diff-line-widget-old-placeholder select-none p-0"
          style={{ backgroundColor: `var(${emptyBGName})` }}
          colSpan={2}
        >
          {newWidgetRendered && <span>&ensp;</span>}
        </td>
      )}
      {newWidgetRendered ? (
        <td
          className="diff-line-widget-new-content border-l-[1px] p-0"
          colSpan={2}
          style={{ borderLeftColor: `var(${borderColorName})` }}
        >
          <div className="diff-line-widget-wrapper">{newWidgetRendered}</div>
        </td>
      ) : (
        <td
          className="diff-line-widget-new-placeholder select-none border-l-[1px] p-0"
          style={{ backgroundColor: `var(${emptyBGName})`, borderLeftColor: `var(${borderColorName})` }}
          colSpan={2}
        >
          {oldWidgetRendered && <span>&ensp;</span>}
        </td>
      )}
    </tr>
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

  const { widgetLineNumber, widgetSide } = useWidget((s) => ({
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
