import * as React from "react";

import { useDiffViewContext, SplitSide } from "..";

import { emptyBGName } from "./color";
import { useDiffWidgetContext } from "./DiffWidgetContext";

import type { DiffFile } from "@git-diff-view/core";

const _DiffSplitWidgetLine = ({
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

  const { useWidget } = useDiffWidgetContext();

  const { widgetSide, widgetLineNumber, setWidget } = useWidget(
    React.useCallback(
      (s) => ({ widgetLineNumber: s.widgetLineNumber, widgetSide: s.widgetSide, setWidget: s.setWidget }),
      []
    )
  );

  const oldLineWidget = oldLine.lineNumber && widgetSide === SplitSide.old && widgetLineNumber === oldLine.lineNumber;

  const newLineWidget = newLine.lineNumber && widgetSide === SplitSide.new && widgetLineNumber === newLine.lineNumber;

  const { useDiffContext } = useDiffViewContext();

  const renderWidgetLine = useDiffContext(React.useCallback((s) => s.renderWidgetLine, []));

  return (
    <tr data-line={`${lineNumber}-widget`} data-state="widget" className="diff-line diff-line-widget">
      {oldLineWidget ? (
        <td className="diff-line-widget-old-content p-0" colSpan={2}>
          <div className="diff-line-widget-wrapper">
            {renderWidgetLine?.({
              diffFile,
              side: SplitSide.old,
              lineNumber: oldLine.lineNumber,
              onClose: () => setWidget({}),
            })}
          </div>
        </td>
      ) : (
        <td
          className="diff-line-widget-old-placeholder p-0"
          style={{ backgroundColor: `var(${emptyBGName})` }}
          colSpan={2}
        >
          <span>&ensp;</span>
        </td>
      )}
      {newLineWidget ? (
        <td className="diff-line-widget-new-content p-0 border-l-[1px] border-l-[#ccc]" colSpan={2}>
          <div className="diff-line-widget-wrapper">
            {renderWidgetLine?.({
              diffFile,
              side: SplitSide.new,
              lineNumber: newLine.lineNumber,
              onClose: () => setWidget({}),
            })}
          </div>
        </td>
      ) : (
        <td
          className="diff-line-widget-new-placeholder p-0 border-l-[1px] border-l-[#ccc]"
          style={{ backgroundColor: `var(${emptyBGName})` }}
          colSpan={2}
        >
          <span>&ensp;</span>
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

  const { widgetLineNumber, widgetSide } = useWidget(
    React.useCallback((s) => ({ widgetLineNumber: s.widgetLineNumber, widgetSide: s.widgetSide }), [])
  );

  const oldLine = diffFile.getSplitLeftLine(index);

  const newLine = diffFile.getSplitRightLine(index);

  const oldLineWidget = oldLine.lineNumber && widgetSide === SplitSide.old && widgetLineNumber === oldLine.lineNumber;

  const newLineWidget = newLine.lineNumber && widgetSide === SplitSide.new && widgetLineNumber === newLine.lineNumber;

  const currentIsShow = oldLineWidget || newLineWidget;

  if (!currentIsShow) return null;

  return <_DiffSplitWidgetLine index={index} diffFile={diffFile} lineNumber={lineNumber} />;
};
