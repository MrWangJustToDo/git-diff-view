import * as React from "react";

import { useDiffViewContext, SplitSide } from "..";
import { useDomWidth } from "../hooks/useDomWidth";

import { useDiffWidgetContext } from "./DiffWidgetContext";

import type { DiffFile } from "@git-diff-view/core";

const _DiffUnifiedWidgetLine = ({ index, diffFile }: { index: number; diffFile: DiffFile; lineNumber: number }) => {
  const unifiedItem = diffFile.getUnifiedLine(index);

  const { widget, setWidget } = useDiffWidgetContext();

  const oldWidget = unifiedItem.oldLineNumber && widget.widgetSide === SplitSide.old && widget.widgetLineNumber === unifiedItem.oldLineNumber;

  const newWidget = unifiedItem.newLineNumber && widget.widgetSide === SplitSide.new && widget.widgetLineNumber === unifiedItem.newLineNumber;

  const onClose = () => setWidget({});

  const { renderWidgetLine } = useDiffViewContext();

  const width = useDomWidth({
    selector: ".unified-diff-table-wrapper",
    enable: true,
  });

  return (
    <tr data-state="widget" className="diff-line diff-line-widget">
      <td className="diff-line-widget-content p-0" colSpan={4}>
        <div className="diff-line-widget-wrapper sticky left-0" style={{ width }}>
          {width > 0 && oldWidget && renderWidgetLine?.({ diffFile, side: SplitSide.old, lineNumber: unifiedItem.oldLineNumber, onClose })}
          {width > 0 && newWidget && renderWidgetLine?.({ diffFile, side: SplitSide.new, lineNumber: unifiedItem.newLineNumber, onClose })}
        </div>
      </td>
    </tr>
  );
};

export const DiffUnifiedWidgetLine = ({ index, diffFile, lineNumber }: { index: number; diffFile: DiffFile; lineNumber: number }) => {
  const { widget } = useDiffWidgetContext();

  const unifiedItem = diffFile.getUnifiedLine(index);

  const oldWidget = unifiedItem.oldLineNumber && widget.widgetSide === SplitSide.old && widget.widgetLineNumber === unifiedItem.oldLineNumber;

  const newWidget = unifiedItem.newLineNumber && widget.widgetSide === SplitSide.new && widget.widgetLineNumber === unifiedItem.newLineNumber;

  const currentIsShow = oldWidget || newWidget;

  if (!currentIsShow) return null;

  return <_DiffUnifiedWidgetLine index={index} diffFile={diffFile} lineNumber={lineNumber} />;
};
