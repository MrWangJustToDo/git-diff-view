import { composeLen } from "@git-diff-view/core";
import * as React from "react";
import { useCallback } from "react";

import { useDiffViewContext } from "..";

import { hunkContentBGName, hunkContentColorName, hunkLineNumberBGName, plainLineNumberColorName } from "./color";
import { ExpandAll, ExpandDown, ExpandUp } from "./DiffExpand";

import type { DiffFile } from "@git-diff-view/core";

const _DiffUnifiedHunkLine = ({
  index,
  diffFile,
  lineNumber,
}: {
  index: number;
  diffFile: DiffFile;
  lineNumber: number;
}) => {
  const currentHunk = diffFile.getUnifiedHunkLine(index);

  const expandEnabled = diffFile.getExpandEnabled();

  const { useDiffContext } = useDiffViewContext();

  const enableWrap = useDiffContext(useCallback((s) => s.enableWrap, []));

  const isExpandAll =
    currentHunk &&
    currentHunk.unifiedInfo &&
    currentHunk.unifiedInfo.endHiddenIndex - currentHunk.unifiedInfo.startHiddenIndex < composeLen;

  return (
    <tr data-line={`${lineNumber}-hunk`} data-state="hunk" className="diff-line diff-line-hunk">
      <td
        className="diff-line-hunk-action sticky left-0 p-[1px] w-[1%] min-w-[100px] select-none"
        style={{
          backgroundColor: `var(${hunkLineNumberBGName})`,
          color: `var(${plainLineNumberColorName})`,
        }}
      >
        {expandEnabled ? (
          isExpandAll ? (
            <button
              className="w-full diff-widget-tooltip hover:bg-blue-300 flex justify-center items-center py-[6px] cursor-pointer rounded-[2px]"
              title="Expand All"
              data-title="Expand All"
              onClick={() => diffFile.onUnifiedHunkExpand("all", index)}
            >
              <ExpandAll className="fill-current" />
            </button>
          ) : (
            <>
              <button
                className="w-full diff-widget-tooltip hover:bg-blue-300 flex justify-center items-center py-[2px] cursor-pointer rounded-[2px]"
                title="Expand Down"
                data-title="Expand Down"
                onClick={() => diffFile.onUnifiedHunkExpand("down", index)}
              >
                <ExpandDown className="fill-current" />
              </button>
              <button
                className="w-full diff-widget-tooltip hover:bg-blue-300 flex justify-center items-center py-[2px] cursor-pointer rounded-[2px]"
                title="Expand Up"
                data-title="Expand Up"
                onClick={() => diffFile.onUnifiedHunkExpand("up", index)}
              >
                <ExpandUp className="fill-current" />
              </button>
            </>
          )
        ) : null}
      </td>
      <td
        className="diff-line-hunk-content pr-[10px] align-middle"
        style={{ backgroundColor: `var(${hunkContentBGName})` }}
      >
        <div
          className="pl-[1.5em]"
          style={{
            whiteSpace: enableWrap ? "pre-wrap" : "pre",
            wordBreak: enableWrap ? "break-all" : "initial",
            color: `var(${hunkContentColorName})`,
          }}
        >
          {currentHunk.unifiedInfo.plainText}
        </div>
      </td>
    </tr>
  );
};

export const DiffUnifiedHunkLine = ({
  index,
  diffFile,
  lineNumber,
}: {
  index: number;
  diffFile: DiffFile;
  lineNumber: number;
}) => {
  const currentHunk = diffFile.getUnifiedHunkLine(index);

  const currentIsShow =
    currentHunk &&
    currentHunk.unifiedInfo &&
    currentHunk.unifiedInfo.startHiddenIndex < currentHunk.unifiedInfo.endHiddenIndex;

  if (!currentIsShow) return null;

  return <_DiffUnifiedHunkLine index={index} diffFile={diffFile} lineNumber={lineNumber} />;
};

export const DiffUnifiedLastHunkLine = ({ diffFile }: { diffFile: DiffFile }) => {
  const currentIsShow = diffFile.getNeedShowExpandAll("unified");

  const expandEnabled = diffFile.getExpandEnabled();

  if (!currentIsShow || !expandEnabled) return null;

  return (
    <tr data-line="last-hunk" data-state="hunk" className="diff-line diff-line-hunk">
      <td
        className="diff-line-hunk-action sticky left-0 w-[1%] min-w-[100px] select-none"
        style={{
          backgroundColor: `var(${hunkLineNumberBGName})`,
          color: `var(${plainLineNumberColorName})`,
        }}
      >
        <button
          className="w-full diff-widget-tooltip hover:bg-blue-300 flex justify-center items-center py-[6px] cursor-pointer rounded-[2px]"
          title="Expand Down"
          data-title="Expand Down"
          onClick={() => diffFile.onUnifiedLastExpand()}
        >
          <ExpandDown className="fill-current" />
        </button>
      </td>
      <td
        className="diff-line-hunk-content pr-[10px] align-middle"
        style={{ backgroundColor: `var(${hunkContentBGName})` }}
      >
        <span>&ensp;</span>
      </td>
    </tr>
  );
};
