import * as React from "react";

import { useDiffViewContext, SplitSide } from "..";
import { useSyncHeight } from "../hooks/useSyncHeight";

import { emptyBGName } from "./color";

import type { DiffFileExtends } from "../utils";

const _DiffSplitWidgetLine = ({ index, diffFile, side, lineNumber }: { index: number; side: SplitSide; diffFile: DiffFileExtends; lineNumber: number }) => {
  const leftItem = diffFile.getSplitLeftLine(index);

  const rightItem = diffFile.getSplitRightLine(index);

  const leftWidget = leftItem.lineNumber ? diffFile.checkWidgetLine(leftItem.lineNumber, SplitSide.old) : undefined;

  const rightWidget = rightItem.lineNumber ? diffFile.checkWidgetLine(rightItem.lineNumber, SplitSide.new) : undefined;

  const currentItem = side === SplitSide.old ? leftItem : rightItem;

  const currentWidget = side === SplitSide.old ? leftWidget : rightWidget;

  const { enableWrap, renderAddWidget } = useDiffViewContext();

  useSyncHeight({
    selector: `tr[data-line="${lineNumber}-widget"]`,
    side: side === SplitSide.old ? "left" : "right",
    enable: !!currentWidget,
  });

  return (
    <tr
      data-line={`${lineNumber}-widget`}
      data-state="widget"
      data-side={side === SplitSide.old ? "left" : "right"}
      className="diff-line diff-line-widget"
      style={{
        backgroundColor: !currentWidget ? `var(${emptyBGName})` : undefined,
      }}
    >
      <td className="diff-line-widget-content" style={{ position: enableWrap ? "relative" : "sticky" }} colSpan={2}>
        {currentWidget && renderAddWidget?.({ diffFile, side, lineNumber: currentItem.lineNumber, onClose: diffFile.onCloseAddWidget })}
      </td>
    </tr>
  );
};

export const DiffSplitWidgetLine = ({
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
  const leftItem = diffFile.getSplitLeftLine(index);

  const rightItem = diffFile.getSplitRightLine(index);

  const leftWidget = leftItem.lineNumber ? diffFile.checkWidgetLine(leftItem.lineNumber, SplitSide.old) : undefined;

  const rightWidget = rightItem.lineNumber ? diffFile.checkWidgetLine(rightItem.lineNumber, SplitSide.new) : undefined;

  const currentIsShow = leftWidget || rightWidget;

  if (!currentIsShow) return null;

  return <_DiffSplitWidgetLine index={index} diffFile={diffFile} side={side} lineNumber={lineNumber} />;
};
