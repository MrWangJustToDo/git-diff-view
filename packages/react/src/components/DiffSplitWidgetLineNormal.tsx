import * as React from "react";

import { useDiffViewContext, SplitSide } from "..";
import { useDomWidth } from "../hooks/useDomWidth";
import { useSyncHeight } from "../hooks/useSyncHeight";

import { emptyBGName } from "./color";
import { useDiffWidgetContext } from "./DiffWidgetContext";

import type { DiffFile } from "@git-diff-view/core";

const _DiffSplitWidgetLine = ({
  diffFile,
  side,
  lineNumber,
  currentLine,
  setWidget,
  currentWidget,
}: {
  index: number;
  side: SplitSide;
  diffFile: DiffFile;
  lineNumber: number;
  currentLine: ReturnType<DiffFile["getSplitLeftLine"]>;
  currentWidget: boolean;
  setWidget: (props: { side?: SplitSide; lineNumber?: number }) => void;
}) => {
  const { useDiffContext } = useDiffViewContext();

  const renderWidgetLine = useDiffContext.useShallowStableSelector((s) => s.renderWidgetLine);

  useSyncHeight({
    selector: `div[data-line="${lineNumber}-widget-content"]`,
    wrapper: `tr[data-line="${lineNumber}-widget"]`,
    side: SplitSide[side],
    enable: currentWidget && typeof renderWidgetLine === "function",
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
            {width > 0 &&
              renderWidgetLine?.({
                diffFile,
                side,
                lineNumber: currentLine.lineNumber,
                onClose: () => setWidget({}),
              })}
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

export const DiffSplitWidgetLine = ({
  index,
  diffFile,
  side,
  lineNumber,
}: {
  index: number;
  side: SplitSide;
  diffFile: DiffFile;
  lineNumber: number;
}) => {
  const { useWidget } = useDiffWidgetContext();

  const { widgetLineNumber, widgetSide, setWidget } = useWidget.useShallowStableSelector((s) => ({
    widgetLineNumber: s.widgetLineNumber,
    widgetSide: s.widgetSide,
    setWidget: s.setWidget,
  }));

  const oldLine = diffFile.getSplitLeftLine(index);

  const newLine = diffFile.getSplitRightLine(index);

  const oldLineWidget = oldLine.lineNumber && widgetSide === SplitSide.old && widgetLineNumber === oldLine.lineNumber;

  const newLineWidget = newLine.lineNumber && widgetSide === SplitSide.new && widgetLineNumber === newLine.lineNumber;

  const currentLine = side === SplitSide.old ? oldLine : newLine;

  const currentWidget = side === SplitSide.old ? oldLineWidget : newLineWidget;

  const currentIsShow = oldLineWidget || newLineWidget;

  if (!currentIsShow) return null;

  return (
    <_DiffSplitWidgetLine
      index={index}
      diffFile={diffFile}
      side={side}
      lineNumber={lineNumber}
      currentLine={currentLine}
      setWidget={setWidget}
      currentWidget={currentWidget}
    />
  );
};
