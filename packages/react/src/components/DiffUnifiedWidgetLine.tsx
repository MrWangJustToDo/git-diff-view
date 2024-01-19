import * as React from "react";

import { useDiffViewContext, SplitSide } from "..";

import type { DiffFileExtends } from "../utils";

const _DiffUnifiedWidgetLine = ({ index, diffFile }: { index: number; diffFile: DiffFileExtends; lineNumber: number }) => {
  const unifiedItem = diffFile.getUnifiedLine(index);

  const oldWidget = unifiedItem?.oldLineNumber ? diffFile.checkWidgetLine(unifiedItem.oldLineNumber, SplitSide.old) : undefined;

  const newWidget = unifiedItem?.newLineNumber ? diffFile.checkWidgetLine(unifiedItem.newLineNumber, SplitSide.new) : undefined;

  const { enableWrap, renderAddWidget } = useDiffViewContext();

  return (
    <tr data-state="widget" className="diff-line diff-line-widget">
      <td className="diff-line-widget-content" style={{ position: enableWrap ? "relative" : "sticky" }} colSpan={4}>
        {oldWidget && renderAddWidget?.({ diffFile, side: SplitSide.old, lineNumber: unifiedItem.oldLineNumber, onClose: diffFile.onCloseAddWidget })}
        {newWidget && renderAddWidget?.({ diffFile, side: SplitSide.new, lineNumber: unifiedItem.newLineNumber, onClose: diffFile.onCloseAddWidget })}
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
