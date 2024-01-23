import { composeLen } from "@git-diff-view/core";
import * as React from "react";

import { useDiffViewContext } from "..";

import { hunkContentBGName, hunkLineNumberBGName, plainLineNumberColorName } from "./color";
import { ExpandAll, ExpandDown, ExpandUp } from "./DiffExpand";

import type { DiffFile } from "@git-diff-view/core";

const _DiffUnifiedHunkLine = ({ index, diffFile, lineNumber }: { index: number; diffFile: DiffFile; lineNumber: number }) => {
  const currentHunk = diffFile.getUnifiedHunkLine(index);

  const { enableWrap } = useDiffViewContext();

  const isExpandAll = currentHunk.unifiedInfo.endHiddenIndex - currentHunk.unifiedInfo.startHiddenIndex < composeLen;

  return (
    <tr
      data-line={`${lineNumber}-hunk`}
      data-state="hunk"
      className="diff-line diff-line-hunk select-none"
      style={{ backgroundColor: `var(${hunkContentBGName})` }}
    >
      <td
        className="diff-line-num diff-line-num-hunk left-0 text-left select-none w-[1%] min-w-[60px] whitespace-nowrap z-[1]"
        style={{
          position: enableWrap ? "relative" : "sticky",
          backgroundColor: `var(${hunkLineNumberBGName})`,
          color: `var(${plainLineNumberColorName})`,
        }}
      >
        {isExpandAll ? (
          <button
            className="w-full hover:bg-blue-300 flex justify-center items-center py-[6px] cursor-pointer rounded-[2px]"
            title="Expand All"
            onClick={() => diffFile.onUnifiedHunkExpand("all", index)}
          >
            <ExpandAll className="fill-current" />
          </button>
        ) : (
          <>
            <button
              className="w-full hover:bg-blue-300 flex justify-center items-center py-[2px] cursor-pointer rounded-[2px]"
              title="Expand Down"
              onClick={() => diffFile.onUnifiedHunkExpand("down", index)}
            >
              <ExpandDown className="fill-current" />
            </button>
            <button
              className="w-full hover:bg-blue-300 flex justify-center items-center py-[2px] cursor-pointer rounded-[2px]"
              title="Expand Up"
              onClick={() => diffFile.onUnifiedHunkExpand("up", index)}
            >
              <ExpandUp className="fill-current" />
            </button>
          </>
        )}
      </td>
      <td className="diff-line-content diff-line-content-hunk pr-[10px] align-middle">
        <div
          className="opacity-[0.5] pl-[1.5em]"
          style={{
            whiteSpace: enableWrap ? "pre-wrap" : "pre",
            wordBreak: enableWrap ? "break-all" : "initial",
          }}
        >
          {currentHunk.unifiedInfo.plainText}
        </div>
      </td>
    </tr>
  );
};

export const DiffUnifiedHunkLine = ({ index, diffFile, lineNumber }: { index: number; diffFile: DiffFile; lineNumber: number }) => {
  const currentHunk = diffFile.getUnifiedHunkLine(index);

  const currentIsShow = currentHunk && currentHunk.unifiedInfo.startHiddenIndex < currentHunk.unifiedInfo.endHiddenIndex;

  if (!currentIsShow) return null;

  return <_DiffUnifiedHunkLine index={index} diffFile={diffFile} lineNumber={lineNumber} />;
};

const _DiffUnifiedExpandLastLine = ({ diffFile }: { diffFile: DiffFile }) => {
  const { enableWrap } = useDiffViewContext();

  return (
    <tr data-line="last-hunk" data-state="hunk" className="diff-line diff-line-hunk select-none" style={{ backgroundColor: `var(${hunkContentBGName})` }}>
      <td
        className="diff-line-num diff-line-num-hunk left-0 text-left select-none w-[1%] min-w-[60px] whitespace-nowrap"
        style={{
          position: enableWrap ? "relative" : "sticky",
          backgroundColor: `var(${hunkLineNumberBGName})`,
          color: `var(${plainLineNumberColorName})`,
        }}
      >
        <button
          className="w-full hover:bg-blue-300 flex justify-center items-center py-[2px] cursor-pointer rounded-[2px]"
          title="Expand Down"
          onClick={() => diffFile.onUnifiedLastExpand()}
        >
          <ExpandDown className="fill-current" />
        </button>
      </td>
      <td className="diff-line-content diff-line-content-hunk pr-[10px] align-middle" />
    </tr>
  );
};

export const DiffUnifiedExpandLastLine = ({ diffFile }: { diffFile: DiffFile }) => {
  if (!diffFile.getNeedShowExpandAll("unified")) return null;

  return <_DiffUnifiedExpandLastLine diffFile={diffFile} />;
};
