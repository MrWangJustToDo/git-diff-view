import { composeLen, type DiffFile } from "@git-diff-view/core";
import * as React from "react";

import { useDiffViewContext, SplitSide } from "..";
import { useSyncHeight } from "../hooks/useSyncHeight";

import { hunkContentBGName, hunkLineNumberBGName, plainLineNumberColorName } from "./color";
import { ExpandAll, ExpandDown, ExpandUp } from "./Expand";

const _DiffSplitHunkLine = ({ index, diffFile, side, lineNumber }: { index: number; side: SplitSide; diffFile: DiffFile; lineNumber: number }) => {
  const currentHunk = diffFile.getSplitHunkLine(index);

  const { enableWrap } = useDiffViewContext();

  useSyncHeight({
    selector: `tr[data-line="${lineNumber}-hunk"]`,
    side: side === SplitSide.old ? "left" : "right",
    enable: true,
  });

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
          position: enableWrap ? "relative" : "sticky",
          backgroundColor: side === SplitSide.old ? `var(${hunkLineNumberBGName})` : undefined,
          color: `var(${plainLineNumberColorName})`,
        }}
      >
        {showExpand &&
          (isExpandAll ? (
            <button
              className="w-full hover:bg-blue-300 flex justify-center items-center py-[6px] cursor-pointer rounded-[2px]"
              title="Expand All"
              onClick={() => diffFile.onSplitHunkExpand("all", index)}
            >
              <ExpandAll className="fill-current" />
            </button>
          ) : (
            <>
              <button
                className="w-full hover:bg-blue-300 flex justify-center items-center py-[2px] cursor-pointer rounded-[2px]"
                title="Expand Down"
                onClick={() => diffFile.onSplitHunkExpand("down", index)}
              >
                <ExpandDown className="fill-current" />
              </button>
              <button
                className="w-full hover:bg-blue-300 flex justify-center items-center py-[2px] cursor-pointer rounded-[2px]"
                title="Expand Up"
                onClick={() => diffFile.onSplitHunkExpand("up", index)}
              >
                <ExpandUp className="fill-current" />
              </button>
            </>
          ))}
      </td>
      <td className="diff-line-content diff-line-content-hunk pr-[10px] align-middle">
        {showExpand && (
          <div
            className="opacity-[0.5] pl-[1.5em]"
            style={{
              whiteSpace: enableWrap ? "pre-wrap" : "pre",
              wordBreak: enableWrap ? "break-all" : "initial",
            }}
          >
            {currentHunk.splitInfo.plainText}
          </div>
        )}
      </td>
    </tr>
  );
};

export const DiffSplitHunkLine = ({ index, diffFile, side, lineNumber }: { index: number; side: SplitSide; diffFile: DiffFile; lineNumber: number }) => {
  const currentHunk = diffFile.getSplitHunkLine(index);

  const currentIsShow = currentHunk && currentHunk.splitInfo.startHiddenIndex < currentHunk.splitInfo.endHiddenIndex;

  if (!currentIsShow) return null;

  return <_DiffSplitHunkLine index={index} diffFile={diffFile} side={side} lineNumber={lineNumber} />;
};

const _DiffSplitExpandLastLine = ({ diffFile, side }: { side: SplitSide; diffFile: DiffFile }) => {
  useSyncHeight({
    selector: `tr[data-line="last-hunk"]`,
    side: side === SplitSide.old ? "left" : "right",
    enable: true,
  });

  const { enableWrap } = useDiffViewContext();

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
          position: enableWrap ? "relative" : "sticky",
          backgroundColor: side === SplitSide.old ? `var(${hunkLineNumberBGName})` : undefined,
          color: `var(${plainLineNumberColorName})`,
        }}
      >
        {side === SplitSide.old && (
          <button
            className="w-full hover:bg-blue-300 flex justify-center items-center py-[2px] cursor-pointer rounded-[2px]"
            title="Expand Down"
            onClick={() => diffFile.onSplitLastExpand()}
          >
            <ExpandDown className="fill-current" />
          </button>
        )}
      </td>
      <td className="diff-line-content diff-line-content-hunk pr-[10px] align-middle"></td>
    </tr>
  );
};

export const DiffSplitExpandLastLine = ({ diffFile, side }: { side: SplitSide; diffFile: DiffFile }) => {
  const currentIsShow = diffFile.getNeedShowExpandAll("split");

  if (!currentIsShow) return null;

  return <_DiffSplitExpandLastLine diffFile={diffFile} side={side} />;
};
