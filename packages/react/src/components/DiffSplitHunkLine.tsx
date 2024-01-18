import { composeLen, type DiffFile } from "@git-diff-view/core";

import { useSyncHeight } from "../hooks/useSyncHeight";

import { hunkContentBGName, hunkLineNumberBGName, plainLineNumberColorName } from "./color";
import { SplitSide } from "./DiffSplitView";
import { ExpandAll, ExpandDown, ExpandUp } from "./Expand";

export const DiffSplitHunkLine = ({
  index,
  diffFile,
  isWrap,
  side,
  lineNumber,
}: {
  index: number;
  side: SplitSide;
  diffFile: DiffFile;
  lineNumber: number;
  isWrap: boolean;
  isHighlight: boolean;
}) => {
  const currentHunk = diffFile.getSplitHunkLine(index);

  const currentIsShow = currentHunk && currentHunk.splitInfo.startHiddenIndex < currentHunk.splitInfo.endHiddenIndex;

  useSyncHeight({
    selector: `tr[data-line="${lineNumber}-hunk"]`,
    side: side === SplitSide.old ? "left" : "right",
    enable: !!currentIsShow,
  });

  if (!currentIsShow) return null;

  const showExpand = side === SplitSide.old;

  const isExpandAll = currentHunk.splitInfo.endHiddenIndex - currentHunk.splitInfo.startHiddenIndex < composeLen;

  return (
    <tr
      data-line={`${lineNumber}-hunk`}
      data-state="hunk"
      data-side={side === SplitSide.old ? "left" : "right"}
      style={{ backgroundColor: `var(${hunkContentBGName})` }}
      className="diff-line diff-line-hunk select-none"
    >
      <td
        className="diff-line-num diff-line-num-hunk left-[0] z-[1] p-[1px]"
        style={{
          position: isWrap ? "relative" : "sticky",
          backgroundColor: side === SplitSide.old ? `var(${hunkLineNumberBGName})` : undefined,
          color: `var(${plainLineNumberColorName})`,
        }}
      >
        {showExpand &&
          (isExpandAll ? (
            <div
              className="w-full hover:bg-blue-300 flex justify-center items-center py-[6px] cursor-pointer rounded-[2px]"
              title="Expand All"
              onClick={() => diffFile.onSplitHunkExpand("all", index)}
            >
              <ExpandAll className="fill-current" />
            </div>
          ) : (
            <>
              <div
                className="w-full hover:bg-blue-300 flex justify-center items-center py-[2px] cursor-pointer rounded-[2px]"
                title="Expand Down"
                onClick={() => diffFile.onSplitHunkExpand("down", index)}
              >
                <ExpandDown className="fill-current" />
              </div>
              <div
                className="w-full hover:bg-blue-300 flex justify-center items-center py-[2px] cursor-pointer rounded-[2px]"
                title="Expand Up"
                onClick={() => diffFile.onSplitHunkExpand("up", index)}
              >
                <ExpandUp className="fill-current" />
              </div>
            </>
          ))}
      </td>
      <td className="diff-line-content diff-line-content-hunk pr-[10px] align-middle">
        {showExpand && (
          <div
            className="opacity-[0.5] pl-[1.5em]"
            style={{
              whiteSpace: isWrap ? "pre-wrap" : "pre",
              wordBreak: isWrap ? "break-all" : "initial",
            }}
          >
            {currentHunk.splitInfo.plainText}
          </div>
        )}
      </td>
    </tr>
  );
};

export const DiffSplitExpandLastLine = ({ diffFile, isWrap, side }: { side: SplitSide; diffFile: DiffFile; isWrap: boolean; isHighlight: boolean }) => {
  useSyncHeight({
    selector: `tr[data-line="last-hunk"]`,
    side: side === SplitSide.old ? "left" : "right",
    enable: side === SplitSide.old,
  });

  return (
    <tr
      data-line="last-hunk"
      data-state="hunk"
      data-side={side === SplitSide.old ? "left" : "right"}
      style={{ backgroundColor: `var(${hunkContentBGName})` }}
      className="diff-line diff-line-hunk select-none"
    >
      <td
        className="diff-line-num diff-line-num-hunk left-[0] z-[1] p-[1px]"
        style={{
          position: isWrap ? "relative" : "sticky",
          backgroundColor: side === SplitSide.old ? `var(${hunkLineNumberBGName})` : undefined,
          color: `var(${plainLineNumberColorName})`,
        }}
      >
        {side === SplitSide.old && (
          <div
            className="w-full hover:bg-blue-300 flex justify-center items-center py-[2px] cursor-pointer rounded-[2px]"
            title="Expand Down"
            onClick={() => diffFile.onSplitLastExpand()}
          >
            <ExpandDown className="fill-current" />
          </div>
        )}
      </td>
      <td className="diff-line-content diff-line-content-hunk pr-[10px] align-middle"></td>
    </tr>
  );
};
