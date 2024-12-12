import * as React from "react";

import { useDiffViewContext, SplitSide } from "..";
import { useDomWidth } from "../hooks/useDomWidth";
import { useSyncHeight } from "../hooks/useSyncHeight";

import { emptyBGName } from "./color";
import { useDiffWidgetContext } from "./DiffWidgetContext";

import type { DiffFile } from "@git-diff-view/core";

const _DiffSplitWidgetLine = ({
  index,
  side,
  diffFile,
  lineNumber,
}: {
  index: number;
  side: SplitSide;
  diffFile: DiffFile;
  lineNumber: number;
}) => {
  const { useWidget } = useDiffWidgetContext();

  const { useDiffContext } = useDiffViewContext();

  const oldLine = diffFile.getSplitLeftLine(index);

  const newLine = diffFile.getSplitRightLine(index);

  const widgetSide = useWidget.getReadonlyState().widgetSide;

  const widgetLineNumber = useWidget.getReadonlyState().widgetLineNumber;

  const setWidget = useWidget.getReadonlyState().setWidget;

  const oldLineWidget = oldLine.lineNumber && widgetSide === SplitSide.old && widgetLineNumber === oldLine.lineNumber;

  const newLineWidget = newLine.lineNumber && widgetSide === SplitSide.new && widgetLineNumber === newLine.lineNumber;

  const currentLine = side === SplitSide.old ? oldLine : newLine;

  const currentWidget = side === SplitSide.old ? oldLineWidget : newLineWidget;

  const renderWidgetLine = useDiffContext.useShallowStableSelector((s) => s.renderWidgetLine);

  const currentWidgetRendered =
    currentWidget &&
    renderWidgetLine?.({
      diffFile,
      side,
      lineNumber: currentLine.lineNumber,
      onClose: () => setWidget({}),
    });

  useSyncHeight({
    selector: `div[data-line="${lineNumber}-widget-content"]`,
    wrapper: `tr[data-line="${lineNumber}-widget"]`,
    side: SplitSide[side],
    enable: !!currentWidget && typeof renderWidgetLine === "function",
  });

  const width = useDomWidth({
    selector: side === SplitSide.old ? ".old-diff-table-wrapper" : ".new-diff-table-wrapper",
    enable: !!currentWidget && typeof renderWidgetLine === "function",
  });

  if (!renderWidgetLine) return null;

  return (
    <tr
      data-line={`${lineNumber}-widget`}
      data-state="widget"
      data-side={SplitSide[side]}
      className="diff-line diff-line-widget"
    >
      {currentWidget ? (
        <td className={`diff-line-widget-${SplitSide[side]}-content p-0`} colSpan={2}>
          <div
            data-line={`${lineNumber}-widget-content`}
            data-side={SplitSide[side]}
            className="diff-line-widget-wrapper sticky left-0"
            style={{ width }}
          >
            {width > 0 && currentWidgetRendered}
          </div>
        </td>
      ) : (
        <td
          className={`diff-line-widget-${SplitSide[side]}-placeholder p-0`}
          style={{ backgroundColor: `var(${emptyBGName})` }}
          colSpan={2}
        >
          <div data-line={`${lineNumber}-widget-content`} data-side={SplitSide[side]} />
        </td>
      )}
    </tr>
  );
};

// TODO! improve performance
export const DiffSplitWidgetLine = ({
  index,
  side,
  diffFile,
  lineNumber,
}: {
  index: number;
  side: SplitSide;
  diffFile: DiffFile;
  lineNumber: number;
}) => {
  const { useWidget } = useDiffWidgetContext();

  const currentIsShow = useWidget.useShallowSelector(
    React.useCallback(
      (s) => {
        const widgetLineNumber = s.widgetLineNumber;

        const widgetSide = s.widgetSide;

        const oldLine = diffFile.getSplitLeftLine(index);

        const newLine = diffFile.getSplitRightLine(index);

        const oldLineWidget =
          oldLine.lineNumber && widgetSide === SplitSide.old && widgetLineNumber === oldLine.lineNumber;

        const newLineWidget =
          newLine.lineNumber && widgetSide === SplitSide.new && widgetLineNumber === newLine.lineNumber;

        const currentIsShow = oldLineWidget || newLineWidget;

        return currentIsShow;
      },
      [diffFile, index]
    ),
    (p, c) => p === c
  );

  if (!currentIsShow) return null;

  return <_DiffSplitWidgetLine index={index} side={side} diffFile={diffFile} lineNumber={lineNumber} />;
};
