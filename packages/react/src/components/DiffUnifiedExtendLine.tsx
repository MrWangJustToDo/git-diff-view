import * as React from "react";
import { useCallback } from "react";

import { useDiffViewContext, SplitSide } from "..";
import { useDomWidth } from "../hooks/useDomWidth";

import type { DiffFile } from "@git-diff-view/core";

const _DiffUnifiedExtendLine = ({
  index,
  diffFile,
  lineNumber,
}: {
  index: number;
  diffFile: DiffFile;
  lineNumber: number;
}) => {
  const { useDiffContext } = useDiffViewContext();

  const renderExtendLine = useDiffContext(useCallback((s) => s.renderExtendLine, []));

  const unifiedItem = diffFile.getUnifiedLine(index);

  const oldExtend = useDiffContext(
    useCallback((s) => s.extendData?.oldFile?.[unifiedItem?.oldLineNumber], [unifiedItem?.oldLineNumber])
  );

  const newExtend = useDiffContext(
    useCallback((s) => s.extendData?.newFile?.[unifiedItem?.newLineNumber], [unifiedItem?.newLineNumber])
  );

  const width = useDomWidth({
    selector: ".unified-diff-table-wrapper",
    enable: typeof renderExtendLine === "function",
  });

  if (!renderExtendLine) return null;

  return (
    <tr data-line={`${lineNumber}-extend`} data-state="extend" className="diff-line diff-line-extend">
      <td className="diff-line-extend-content align-top p-0" colSpan={2}>
        <div className="diff-line-extend-wrapper sticky left-0" style={{ width }}>
          {width > 0 &&
            oldExtend &&
            renderExtendLine?.({
              diffFile,
              side: SplitSide.old,
              lineNumber: unifiedItem.oldLineNumber,
              data: oldExtend.data,
              onUpdate: diffFile.notifyAll,
            })}
          {width > 0 &&
            newExtend &&
            renderExtendLine?.({
              diffFile,
              side: SplitSide.new,
              lineNumber: unifiedItem.newLineNumber,
              data: newExtend.data,
              onUpdate: diffFile.notifyAll,
            })}
        </div>
      </td>
    </tr>
  );
};

export const DiffUnifiedExtendLine = ({
  index,
  diffFile,
  lineNumber,
}: {
  index: number;
  diffFile: DiffFile;
  lineNumber: number;
}) => {
  const { useDiffContext } = useDiffViewContext();

  const unifiedItem = diffFile.getUnifiedLine(index);

  const hasExtend = useDiffContext(
    useCallback(
      (s) => s.extendData?.oldFile?.[unifiedItem?.oldLineNumber] || s.extendData?.newFile?.[unifiedItem?.newLineNumber],
      [unifiedItem.oldLineNumber, unifiedItem.newLineNumber]
    )
  );

  if (!hasExtend || !unifiedItem || unifiedItem.isHidden || !unifiedItem.diff) return null;

  return <_DiffUnifiedExtendLine index={index} diffFile={diffFile} lineNumber={lineNumber} />;
};
