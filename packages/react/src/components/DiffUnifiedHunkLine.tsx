import { composeLen } from "@git-diff-view/core";

import { hunkContentBGName, hunkLineNumberBGName, plainLineNumberColorName } from "./color";
import { ExpandAll, ExpandDown, ExpandUp } from "./Expand";

import type { DiffFile } from "@git-diff-view/core";

export const DiffUnifiedHunkLine = ({
  index,
  diffFile,
  isWrap,
}: {
  index: number;
  diffFile: DiffFile;
  lineNumber: number;
  isWrap: boolean;
  isHighlight: boolean;
}) => {
  const currentHunk = diffFile.getUnifiedHunkLine(index);

  const currentIsShow = currentHunk && currentHunk.unifiedInfo.startHiddenIndex < currentHunk.unifiedInfo.endHiddenIndex;

  if (!currentIsShow) return null;

  const isExpandAll = currentHunk.unifiedInfo.endHiddenIndex - currentHunk.unifiedInfo.startHiddenIndex < composeLen;

  return (
    <tr data-state="hunk" className="diff-line diff-line-hunk select-none" style={{ backgroundColor: `var(${hunkContentBGName})` }}>
      <td
        className="diff-line-num diff-line-num-hunk left-[0] text-left select-none w-[1%] min-w-[60px] whitespace-nowrap z-[1]"
        style={{
          position: isWrap ? "relative" : "sticky",
          backgroundColor: `var(${hunkLineNumberBGName})`,
          color: `var(${plainLineNumberColorName})`,
        }}
      >
        {isExpandAll ? (
          <div
            className="w-full hover:bg-blue-300 flex justify-center items-center py-[6px] cursor-pointer rounded-[2px]"
            title="Expand All"
            onClick={() => diffFile.onUnifiedHunkExpand("all", index)}
          >
            <ExpandAll className="fill-current" />
          </div>
        ) : (
          <>
            <div
              className="w-full hover:bg-blue-300 flex justify-center items-center py-[2px] cursor-pointer rounded-[2px]"
              title="Expand Down"
              onClick={() => diffFile.onUnifiedHunkExpand("down", index)}
            >
              <ExpandDown className="fill-current" />
            </div>
            <div
              className="w-full hover:bg-blue-300 flex justify-center items-center py-[2px] cursor-pointer rounded-[2px]"
              title="Expand Up"
              onClick={() => diffFile.onUnifiedHunkExpand("up", index)}
            >
              <ExpandUp className="fill-current" />
            </div>
          </>
        )}
      </td>
      <td className="diff-line-content diff-line-content-hunk pr-[10px] align-middle">
        <div
          className="opacity-[0.5] pl-[1.5em]"
          style={{
            whiteSpace: isWrap ? "pre-wrap" : "pre",
            wordBreak: isWrap ? "break-all" : "initial",
          }}
        >
          {currentHunk.unifiedInfo.plainText}
        </div>
      </td>
    </tr>
  );
};

export const DiffUnifiedExpandLastLine = ({ diffFile, isWrap }: { diffFile: DiffFile; isWrap: boolean; isHighlight: boolean }) => {
  if (!diffFile.unifiedLastStartIndex || !Number.isFinite(diffFile.unifiedLastStartIndex)) {
    return null;
  }

  return (
    <tr data-line="last-hunk" data-state="hunk" className="diff-line diff-line-hunk select-none" style={{ backgroundColor: `var(${hunkContentBGName})` }}>
      <td
        className="diff-line-num diff-line-num-hunk left-[0] text-left select-none w-[1%] min-w-[60px] whitespace-nowrap"
        style={{
          position: isWrap ? "relative" : "sticky",
          backgroundColor: `var(${hunkLineNumberBGName})`,
          color: `var(${plainLineNumberColorName})`,
        }}
      >
        <div
          className="w-full hover:bg-blue-300 flex justify-center items-center py-[2px] cursor-pointer rounded-[2px]"
          title="Expand Down"
          onClick={() => diffFile.onUnifiedLastExpand()}
        >
          <ExpandDown className="fill-current" />
        </div>
      </td>
      <td className="diff-line-content diff-line-content-hunk pr-[10px] align-middle" />
    </tr>
  );
};
