import { useSyncHeight } from "../hooks/useSyncHeight";

import { emptyBGName } from "./color";
import { SplitSide } from "./DiffSplitView";

import type { DiffFileExtends } from "../utils";

export const DiffSplitExtendLine = ({
  index,
  diffFile,
  isWrap,
  side,
  lineNumber,
}: {
  index: number;
  side: SplitSide;
  diffFile: DiffFileExtends;
  lineNumber: number;
  isWrap: boolean;
  isHighlight: boolean;
}) => {
  const currentLeftExtend = diffFile.getSplitExtendLine(index, "left");

  const currentRightExtend = diffFile.getSplitExtendLine(index, "right");

  const currentIsShow = currentLeftExtend || currentRightExtend;

  useSyncHeight({
    selector: `tr[data-line="${lineNumber}-extend"]`,
    side: side === SplitSide.old ? "left" : "right",
    enable: !!currentIsShow,
  });

  if (!currentIsShow) return null;

  const currentExtend = side === SplitSide.old ? currentLeftExtend : currentRightExtend;

  return (
    <tr
      data-line={`${lineNumber}-extend`}
      data-state="hunk"
      data-side={side === SplitSide.old ? "left" : "right"}
      className="diff-line diff-line-extend"
      style={{
        backgroundColor: !currentExtend ? `var(${emptyBGName})` : undefined,
      }}
    >
      <td className="diff-line-extend-content" style={{ position: isWrap ? "relative" : "sticky" }} colSpan={2}>
        {currentExtend}
      </td>
    </tr>
  );
};
