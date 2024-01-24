import * as React from "react";

import { useDiffViewContext, SplitSide } from "..";
import { useDomWidth } from "../hooks/useDomWidth";
import { useSyncHeight } from "../hooks/useSyncHeight";

import { emptyBGName } from "./color";
import { useDiffWidgetContext } from "./DiffWidgetContext";

import type { DiffFile } from "@git-diff-view/core";

const _DiffSplitWidgetLine = ({ index, diffFile, side, lineNumber }: { index: number; side: SplitSide; diffFile: DiffFile; lineNumber: number }) => {
  const leftItem = diffFile.getSplitLeftLine(index);

  const rightItem = diffFile.getSplitRightLine(index);

  const { widget, setWidget } = useDiffWidgetContext();

  const leftWidget = leftItem.lineNumber && widget.widgetSide === SplitSide.old && widget.widgetLineNumber === leftItem.lineNumber;

  const rightWidget = rightItem.lineNumber && widget.widgetSide === SplitSide.new && widget.widgetLineNumber === rightItem.lineNumber;

  const currentItem = side === SplitSide.old ? leftItem : rightItem;

  const currentWidget = side === SplitSide.old ? leftWidget : rightWidget;

  const { renderWidgetLine } = useDiffViewContext();

  useSyncHeight({
    selector: `tr[data-line="${lineNumber}-widget"]`,
    side: side === SplitSide.old ? "left" : "right",
    enable: !!currentWidget,
  });

  const width = useDomWidth({
    selector: side === SplitSide.old ? ".old-diff-table-wrapper" : ".new-diff-table-wrapper",
    enable: !!currentWidget,
  });

  return (
    <tr
      data-line={`${lineNumber}-widget`}
      data-state="widget"
      data-side={side === SplitSide.old ? "left" : "right"}
      className={"diff-line diff-line-widget" + !currentWidget ? " diff-line-widget-empty" : ""}
      style={{
        backgroundColor: !currentWidget ? `var(${emptyBGName})` : undefined,
      }}
    >
      <td className="diff-line-widget-content p-0" colSpan={2}>
        <div className="diff-line-widget-wrapper sticky left-0" style={{ width }}>
          {width > 0 &&
            currentWidget &&
            renderWidgetLine?.({
              diffFile,
              side,
              lineNumber: currentItem.lineNumber,
              onClose: () => setWidget({}),
            })}
        </div>
      </td>
    </tr>
  );
};

export const DiffSplitWidgetLine = ({ index, diffFile, side, lineNumber }: { index: number; side: SplitSide; diffFile: DiffFile; lineNumber: number }) => {
  const { widget } = useDiffWidgetContext();

  const leftItem = diffFile.getSplitLeftLine(index);

  const rightItem = diffFile.getSplitRightLine(index);

  const leftWidget = leftItem.lineNumber && widget.widgetSide === SplitSide.old && widget.widgetLineNumber === leftItem.lineNumber;

  const rightWidget = rightItem.lineNumber && widget.widgetSide === SplitSide.new && widget.widgetLineNumber === rightItem.lineNumber;

  const currentIsShow = leftWidget || rightWidget;

  if (!currentIsShow) return null;

  return <_DiffSplitWidgetLine index={index} diffFile={diffFile} side={side} lineNumber={lineNumber} />;
};
