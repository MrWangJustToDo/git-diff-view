import * as React from "react";
import { useCallback } from "react";

import { useDiffViewContext, SplitSide } from "..";
import { useDomWidth } from "../hooks/useDomWidth";

import { useDiffWidgetContext } from "./DiffWidgetContext";

import type { DiffFile } from "@git-diff-view/core";

const _DiffUnifiedWidgetLine = ({
  index,
  diffFile,
  lineNumber,
}: {
  index: number;
  diffFile: DiffFile;
  lineNumber: number;
}) => {
  const unifiedItem = diffFile.getUnifiedLine(index);

  const { useWidget } = useDiffWidgetContext();

  const { widgetSide, widgetLineNumber, setWidget } = useWidget(
    React.useCallback(
      (s) => ({ widgetLineNumber: s.widgetLineNumber, widgetSide: s.widgetSide, setWidget: s.setWidget }),
      []
    )
  );

  const oldWidget =
    unifiedItem.oldLineNumber && widgetSide === SplitSide.old && widgetLineNumber === unifiedItem.oldLineNumber;

  const newWidget =
    unifiedItem.newLineNumber && widgetSide === SplitSide.new && widgetLineNumber === unifiedItem.newLineNumber;

  const onClose = () => setWidget({});

  const { useDiffContext } = useDiffViewContext();

  const renderWidgetLine = useDiffContext(useCallback((s) => s.renderWidgetLine, []));

  const width = useDomWidth({
    selector: ".unified-diff-table-wrapper",
    enable: true,
  });

  return (
    <tr data-line={`${lineNumber}-widget`} data-state="widget" className="diff-line diff-line-widget">
      <td className="diff-line-widget-content p-0" colSpan={2}>
        <div className="diff-line-widget-wrapper sticky left-0" style={{ width }}>
          {width > 0 &&
            oldWidget &&
            renderWidgetLine?.({ diffFile, side: SplitSide.old, lineNumber: unifiedItem.oldLineNumber, onClose })}
          {width > 0 &&
            newWidget &&
            renderWidgetLine?.({ diffFile, side: SplitSide.new, lineNumber: unifiedItem.newLineNumber, onClose })}
        </div>
      </td>
    </tr>
  );
};

export const DiffUnifiedWidgetLine = ({
  index,
  diffFile,
  lineNumber,
}: {
  index: number;
  diffFile: DiffFile;
  lineNumber: number;
}) => {
  const { useWidget } = useDiffWidgetContext();

  const { widgetSide, widgetLineNumber } = useWidget(
    React.useCallback((s) => ({ widgetLineNumber: s.widgetLineNumber, widgetSide: s.widgetSide }), [])
  );

  const unifiedItem = diffFile.getUnifiedLine(index);

  const oldWidget =
    unifiedItem.oldLineNumber && widgetSide === SplitSide.old && widgetLineNumber === unifiedItem.oldLineNumber;

  const newWidget =
    unifiedItem.newLineNumber && widgetSide === SplitSide.new && widgetLineNumber === unifiedItem.newLineNumber;

  const currentIsShow = oldWidget || newWidget;

  if (!currentIsShow) return null;

  return <_DiffUnifiedWidgetLine index={index} diffFile={diffFile} lineNumber={lineNumber} />;
};
