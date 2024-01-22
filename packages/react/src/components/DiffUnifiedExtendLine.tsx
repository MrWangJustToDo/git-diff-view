import * as React from "react";

import { useDiffViewContext, SplitSide } from "..";
import { useDomWidth } from "../hooks/useDomWidth";

import type { DiffFileExtends } from "../utils";

const _DiffUnifiedExtendLine = ({ index, diffFile, lineNumber }: { index: number; diffFile: DiffFileExtends; lineNumber: number }) => {
  const { extendData, renderExtendLine } = useDiffViewContext();

  const unifiedItem = diffFile.getUnifiedLine(index);

  const oldExtend = extendData?.oldFile?.[unifiedItem.oldLineNumber];

  const newExtend = extendData?.newFile?.[unifiedItem.newLineNumber];

  const width = useDomWidth({
    selector: ".unified-diff-table-wrapper",
    enable: true,
  });

  return (
    <tr data-line={`${lineNumber}-extend`} data-state="extend" className="diff-line diff-line-extend">
      <td className="diff-line-extend-content align-top p-0" colSpan={4}>
        <div className="diff-line-extend-wrapper sticky left-0" style={{ width }}>
          {width > 0 &&
            oldExtend &&
            renderExtendLine({ diffFile, side: SplitSide.old, lineNumber: unifiedItem.oldLineNumber, data: oldExtend.data, onUpdate: diffFile.notifyAll })}
          {width > 0 &&
            newExtend &&
            renderExtendLine({ diffFile, side: SplitSide.new, lineNumber: unifiedItem.newLineNumber, data: newExtend.data, onUpdate: diffFile.notifyAll })}
        </div>
      </td>
    </tr>
  );
};

export const DiffUnifiedExtendLine = ({ index, diffFile, lineNumber }: { index: number; diffFile: DiffFileExtends; lineNumber: number }) => {
  const { extendData } = useDiffViewContext();

  const unifiedItem = diffFile.getUnifiedLine(index);

  const oldExtend = extendData?.oldFile?.[unifiedItem.oldLineNumber];

  const newExtend = extendData?.newFile?.[unifiedItem.newLineNumber];

  if ((!oldExtend && !newExtend) || !unifiedItem || unifiedItem.isHidden || !unifiedItem.diff) return null;

  return <_DiffUnifiedExtendLine index={index} diffFile={diffFile} lineNumber={lineNumber} />;
};
