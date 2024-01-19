import * as React from "react";

import { useDiffViewContext, SplitSide } from "..";
import { useSyncHeight } from "../hooks/useSyncHeight";

import { emptyBGName } from "./color";

import type { DiffFileExtends } from "../utils";

export const DiffSplitExtendLine = ({
  index,
  diffFile,
  side,
  lineNumber,
}: {
  index: number;
  side: SplitSide;
  diffFile: DiffFileExtends;
  lineNumber: number;
}) => {
  const { enableWrap, extendData, renderExtendLine } = useDiffViewContext();

  const oldItem = diffFile.getSplitLeftLine(index);

  const newItem = diffFile.getSplitRightLine(index);

  const currentItem = side === SplitSide.old ? oldItem : newItem;

  const oldExtend = extendData?.oldFile?.[oldItem?.lineNumber];

  const newExtend = extendData?.newFile?.[newItem.lineNumber];

  const currentIsShow = (oldExtend || newExtend) && currentItem && !currentItem.isHidden && currentItem.diff;

  const currentExtend = side === SplitSide.old ? oldExtend : newExtend;

  useSyncHeight({
    selector: `tr[data-line="${lineNumber}-extend"]`,
    side: side === SplitSide.old ? "left" : "right",
    enable: !!currentExtend,
  });

  if (!currentIsShow) return null;

  return (
    <tr
      data-line={`${lineNumber}-extend`}
      data-state="extend"
      data-side={side === SplitSide.old ? "left" : "right"}
      className="diff-line diff-line-extend"
      style={{
        backgroundColor: !currentExtend ? `var(${emptyBGName})` : undefined,
      }}
    >
      <td className="diff-line-extend-content" style={{ position: enableWrap ? "relative" : "sticky" }} colSpan={2}>
        {currentExtend && renderExtendLine({ diffFile, side, lineNumber: currentExtend.lineNumber, data: currentExtend.data, onUpdate: diffFile.notifyAll })}
      </td>
    </tr>
  );
};
