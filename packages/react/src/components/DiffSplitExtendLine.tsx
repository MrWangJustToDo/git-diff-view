import * as React from "react";

import { useDiffViewContext, SplitSide } from "..";
import { useDomWidth } from "../hooks/useDomWidth";
import { useSyncHeight } from "../hooks/useSyncHeight";

import { emptyBGName } from "./color";

import type { DiffFileExtends } from "../utils";

const _DiffSplitExtendLine = ({ index, diffFile, side, lineNumber }: { index: number; side: SplitSide; diffFile: DiffFileExtends; lineNumber: number }) => {
  const { extendData, renderExtendLine } = useDiffViewContext();

  const oldItem = diffFile.getSplitLeftLine(index);

  const newItem = diffFile.getSplitRightLine(index);

  const oldExtend = extendData?.oldFile?.[oldItem?.lineNumber];

  const newExtend = extendData?.newFile?.[newItem.lineNumber];

  const currentExtend = side === SplitSide.old ? oldExtend : newExtend;

  useSyncHeight({
    selector: `tr[data-line="${lineNumber}-extend"]`,
    side: side === SplitSide.old ? "left" : "right",
    enable: !!currentExtend,
  });

  const width = useDomWidth({
    selector: side === SplitSide.old ? ".old-diff-table-wrapper" : ".new-diff-table-wrapper",
    enable: !!currentExtend,
  });

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
      <td className="diff-line-extend-content align-top p-[0]" colSpan={2}>
        <div className="diff-line-extend-wrapper sticky left-0" style={{ width }}>
          {width > 0 &&
            currentExtend &&
            renderExtendLine({ diffFile, side, lineNumber: currentExtend.lineNumber, data: currentExtend.data, onUpdate: diffFile.notifyAll })}
        </div>
      </td>
    </tr>
  );
};

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
  const { extendData } = useDiffViewContext();

  const oldItem = diffFile.getSplitLeftLine(index);

  const newItem = diffFile.getSplitRightLine(index);

  const currentItem = side === SplitSide.old ? oldItem : newItem;

  const oldExtend = extendData?.oldFile?.[oldItem?.lineNumber];

  const newExtend = extendData?.newFile?.[newItem.lineNumber];

  const currentIsShow = (oldExtend || newExtend) && currentItem && !currentItem.isHidden && currentItem.diff;

  if (!currentIsShow) return null;

  return <_DiffSplitExtendLine index={index} diffFile={diffFile} side={side} lineNumber={lineNumber} />;
};
