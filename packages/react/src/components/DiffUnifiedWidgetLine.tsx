import * as React from "react";

import { useDiffViewContext, SplitSide } from "..";
import { useDomWidth } from "../hooks/useDomWidth";

import type { DiffFileExtends } from "../utils";

const _DiffUnifiedWidgetLine = ({ index, diffFile }: { index: number; diffFile: DiffFileExtends; lineNumber: number }) => {
  const unifiedItem = diffFile.getUnifiedLine(index);

  const oldWidget = unifiedItem?.oldLineNumber ? diffFile.checkWidgetLine(unifiedItem.oldLineNumber, SplitSide.old) : undefined;

  const newWidget = unifiedItem?.newLineNumber ? diffFile.checkWidgetLine(unifiedItem.newLineNumber, SplitSide.new) : undefined;

  const { renderAddWidget } = useDiffViewContext();

  const width = useDomWidth({
    selector: ".unified-diff-table-wrapper",
    enable: true,
  });

  return (
    <tr data-state="widget" className="diff-line diff-line-widget">
      <td className="diff-line-widget-content p-0" colSpan={4}>
        <div className="diff-line-widget-wrapper sticky left-0" style={{ width }}>
          {oldWidget && renderAddWidget?.({ diffFile, side: SplitSide.old, lineNumber: unifiedItem.oldLineNumber, onClose: diffFile.onCloseAddWidget })}
          {newWidget && renderAddWidget?.({ diffFile, side: SplitSide.new, lineNumber: unifiedItem.newLineNumber, onClose: diffFile.onCloseAddWidget })}
        </div>
      </td>
    </tr>
  );
};

export const DiffUnifiedWidgetLine = ({ index, diffFile, lineNumber }: { index: number; diffFile: DiffFileExtends; lineNumber: number }) => {
  const unifiedItem = diffFile.getUnifiedLine(index);

  const oldWidget = unifiedItem.oldLineNumber ? diffFile.checkWidgetLine(unifiedItem.oldLineNumber, SplitSide.old) : undefined;

  const newWidget = unifiedItem.newLineNumber ? diffFile.checkWidgetLine(unifiedItem.newLineNumber, SplitSide.new) : undefined;

  const currentIsShow = oldWidget || newWidget;

  if (!currentIsShow) return null;

  return <_DiffUnifiedWidgetLine index={index} diffFile={diffFile} lineNumber={lineNumber} />;
};
