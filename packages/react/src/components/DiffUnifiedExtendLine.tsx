import * as React from "react";

import { useDiffViewContext, SplitSide } from "..";

import type { DiffFileExtends } from "../utils";

export const DiffUnifiedExtendLine = ({ index, diffFile, lineNumber }: { index: number; diffFile: DiffFileExtends; lineNumber: number }) => {
  const { enableWrap, extendData, renderExtendLine } = useDiffViewContext();

  const unifiedItem = diffFile.getUnifiedLine(index);

  const oldExtend = extendData?.oldFile?.[unifiedItem.oldLineNumber];

  const newExtend = extendData?.newFile?.[unifiedItem.newLineNumber];

  if ((!oldExtend && !newExtend) || !unifiedItem || unifiedItem.isHidden || !unifiedItem.diff) return null;

  return (
    <tr data-line={`${lineNumber}-extend`} data-state="extend" className="diff-line diff-line-extend">
      <td className="diff-line-extend-content" style={{ position: enableWrap ? "relative" : "sticky" }} colSpan={4}>
        {oldExtend && renderExtendLine({ diffFile, side: SplitSide.old, lineNumber: oldExtend.lineNumber, data: oldExtend.data, onUpdate: diffFile.notifyAll })}
        {newExtend && renderExtendLine({ diffFile, side: SplitSide.new, lineNumber: newExtend.lineNumber, data: newExtend.data, onUpdate: diffFile.notifyAll })}
      </td>
    </tr>
  );
};
