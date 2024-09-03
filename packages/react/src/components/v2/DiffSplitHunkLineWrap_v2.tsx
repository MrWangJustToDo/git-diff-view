import { composeLen, type DiffFile } from "@git-diff-view/core";
import * as React from "react";

import { hunkLineNumberBGName, plainLineNumberColorName, hunkContentBGName, hunkContentColorName } from "../color";
import { ExpandUp, ExpandDown, ExpandAll } from "../DiffExpand";
import { useDiffViewContext, DiffModeEnum } from "../DiffViewContext";
import { diffAsideWidthName } from "../tools";

const DiffSplitHunkLineGitHub = ({
  index,
  diffFile,
  lineNumber,
}: {
  index: number;
  diffFile: DiffFile;
  lineNumber: number;
}) => {
  const currentHunk = diffFile.getSplitHunkLine(index);

  const expandEnabled = diffFile.getExpandEnabled();

  const couldExpand = expandEnabled && currentHunk && currentHunk.splitInfo;

  const isExpandAll =
    currentHunk &&
    currentHunk.splitInfo &&
    currentHunk.splitInfo.endHiddenIndex - currentHunk.splitInfo.startHiddenIndex < composeLen;

  const currentIsShow =
    currentHunk &&
    currentHunk.splitInfo &&
    currentHunk.splitInfo.startHiddenIndex < currentHunk.splitInfo.endHiddenIndex;

  const currentIsPureHunk = currentHunk && diffFile._getIsPureDiffRender() && !currentHunk.splitInfo;

  const isFirstLine = currentHunk && currentHunk.isFirst;

  const isLastLine = currentHunk && currentHunk.isLast;

  if (!currentIsShow && !currentIsPureHunk) return null;

  return (
    <div data-line={`${lineNumber}-hunk`} data-state="hunk" className="diff-line diff-line-hunk flex">
      <div
        className="diff-line-hunk-action flex w-[1%] min-w-[40px] select-none flex-col items-center justify-center p-[1px]"
        style={{
          backgroundColor: `var(${hunkLineNumberBGName})`,
          color: `var(${plainLineNumberColorName})`,
          width: `var(${diffAsideWidthName})`,
          minWidth: `var(${diffAsideWidthName})`,
          maxWidth: `var(${diffAsideWidthName})`,
        }}
      >
        {couldExpand ? (
          isFirstLine ? (
            <button
              className="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px] hover:bg-blue-300"
              title="Expand Up"
              data-title="Expand Up"
              onClick={() => diffFile.onSplitHunkExpand("up", index)}
            >
              <ExpandUp className="fill-current" />
            </button>
          ) : isLastLine ? (
            <button
              className="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px] hover:bg-blue-300"
              title="Expand Down"
              data-title="Expand Down"
              onClick={() => diffFile.onSplitHunkExpand("down", index)}
            >
              <ExpandDown className="fill-current" />
            </button>
          ) : isExpandAll ? (
            <button
              className="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px] hover:bg-blue-300"
              title="Expand All"
              data-title="Expand All"
              onClick={() => diffFile.onSplitHunkExpand("all", index)}
            >
              <ExpandAll className="fill-current" />
            </button>
          ) : (
            <>
              <button
                className="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[2px] hover:bg-blue-300"
                title="Expand Down"
                data-title="Expand Down"
                onClick={() => diffFile.onSplitHunkExpand("down", index)}
              >
                <ExpandDown className="fill-current" />
              </button>
              <button
                className="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[2px] hover:bg-blue-300"
                title="Expand Up"
                data-title="Expand Up"
                onClick={() => diffFile.onSplitHunkExpand("up", index)}
              >
                <ExpandUp className="fill-current" />
              </button>
            </>
          )
        ) : (
          <div className="min-h-[28px]">&ensp;</div>
        )}
      </div>
      <div
        className="diff-line-hunk-content flex w-full items-center px-[10px]"
        style={{ backgroundColor: `var(${hunkContentBGName})`, color: `var(${hunkContentColorName})` }}
      >
        {currentHunk.splitInfo?.plainText || currentHunk.text}
      </div>
    </div>
  );
};

const DiffSplitHunkLineGitLab = ({
  index,
  diffFile,
  lineNumber,
}: {
  index: number;
  diffFile: DiffFile;
  lineNumber: number;
}) => {
  const currentHunk = diffFile.getSplitHunkLine(index);

  const expandEnabled = diffFile.getExpandEnabled();

  const couldExpand = expandEnabled && currentHunk && currentHunk.splitInfo;

  const isExpandAll =
    currentHunk &&
    currentHunk.splitInfo &&
    currentHunk.splitInfo.endHiddenIndex - currentHunk.splitInfo.startHiddenIndex < composeLen;

  const currentIsShow =
    currentHunk &&
    currentHunk.splitInfo &&
    currentHunk.splitInfo.startHiddenIndex < currentHunk.splitInfo.endHiddenIndex;

  const currentIsPureHunk = currentHunk && diffFile._getIsPureDiffRender() && !currentHunk.splitInfo;

  const isFirstLine = currentHunk && currentHunk.isFirst;

  const isLastLine = currentHunk && currentHunk.isLast;

  if (!currentIsShow && !currentIsPureHunk) return null;

  return (
    <div data-line={`${lineNumber}-hunk`} data-state="hunk" className="diff-line diff-line-hunk flex">
      <div
        className="diff-line-hunk-action flex w-[1%] min-w-[40px] select-none flex-col items-center justify-center p-[1px]"
        style={{
          backgroundColor: `var(${hunkLineNumberBGName})`,
          color: `var(${plainLineNumberColorName})`,
          width: `var(${diffAsideWidthName})`,
          minWidth: `var(${diffAsideWidthName})`,
          maxWidth: `var(${diffAsideWidthName})`,
        }}
      >
        {couldExpand ? (
          isFirstLine ? (
            <button
              className="diff-widget-tooltip flex h-full w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px] hover:bg-blue-300"
              title="Expand Up"
              data-title="Expand Up"
              onClick={() => diffFile.onSplitHunkExpand("up", index)}
            >
              <ExpandUp className="fill-current" />
            </button>
          ) : isLastLine ? (
            <button
              className="diff-widget-tooltip flex h-full w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px] hover:bg-blue-300"
              title="Expand Down"
              data-title="Expand Down"
              onClick={() => diffFile.onSplitHunkExpand("down", index)}
            >
              <ExpandDown className="fill-current" />
            </button>
          ) : isExpandAll ? (
            <button
              className="diff-widget-tooltip flex h-full w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px] hover:bg-blue-300"
              title="Expand All"
              data-title="Expand All"
              onClick={() => diffFile.onSplitHunkExpand("all", index)}
            >
              <ExpandAll className="fill-current" />
            </button>
          ) : (
            <>
              <button
                className="diff-widget-tooltip flex h-[50%] w-full cursor-pointer items-center justify-center rounded-[2px] py-[2px] hover:bg-blue-300"
                title="Expand Down"
                data-title="Expand Down"
                onClick={() => diffFile.onSplitHunkExpand("down", index)}
              >
                <ExpandDown className="fill-current" />
              </button>
              <button
                className="diff-widget-tooltip flex h-[50%] w-full cursor-pointer items-center justify-center rounded-[2px] py-[2px] hover:bg-blue-300"
                title="Expand Up"
                data-title="Expand Up"
                onClick={() => diffFile.onSplitHunkExpand("up", index)}
              >
                <ExpandUp className="fill-current" />
              </button>
            </>
          )
        ) : (
          <div className="min-h-[28px]">&ensp;</div>
        )}
      </div>
      <div
        className="diff-line-hunk-content flex w-full items-center px-[10px]"
        style={{ backgroundColor: `var(${hunkContentBGName})`, color: `var(${hunkContentColorName})` }}
      >
        {currentHunk.splitInfo?.plainText || currentHunk.text}
      </div>
      <div className="diff-split-line w-[1px] flex-shrink-0 bg-[rgb(222,222,222)]" />
      <div
        className="diff-line-hunk-action flex w-[1%] min-w-[40px] select-none flex-col items-center justify-center p-[1px]"
        style={{
          backgroundColor: `var(${hunkLineNumberBGName})`,
          color: `var(${plainLineNumberColorName})`,
          width: `var(${diffAsideWidthName})`,
          minWidth: `var(${diffAsideWidthName})`,
          maxWidth: `var(${diffAsideWidthName})`,
        }}
      >
        {couldExpand ? (
          isFirstLine ? (
            <button
              className="diff-widget-tooltip flex h-full w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px] hover:bg-blue-300"
              title="Expand Up"
              data-title="Expand Up"
              onClick={() => diffFile.onSplitHunkExpand("up", index)}
            >
              <ExpandUp className="fill-current" />
            </button>
          ) : isLastLine ? (
            <button
              className="diff-widget-tooltip flex h-full w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px] hover:bg-blue-300"
              title="Expand Down"
              data-title="Expand Down"
              onClick={() => diffFile.onSplitHunkExpand("down", index)}
            >
              <ExpandDown className="fill-current" />
            </button>
          ) : isExpandAll ? (
            <button
              className="diff-widget-tooltip flex h-full w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px] hover:bg-blue-300"
              title="Expand All"
              data-title="Expand All"
              onClick={() => diffFile.onSplitHunkExpand("all", index)}
            >
              <ExpandAll className="fill-current" />
            </button>
          ) : (
            <>
              <button
                className="diff-widget-tooltip flex h-[50%] w-full cursor-pointer items-center justify-center rounded-[2px] py-[2px] hover:bg-blue-300"
                title="Expand Down"
                data-title="Expand Down"
                onClick={() => diffFile.onSplitHunkExpand("down", index)}
              >
                <ExpandDown className="fill-current" />
              </button>
              <button
                className="diff-widget-tooltip flex h-[50%] w-full cursor-pointer items-center justify-center rounded-[2px] py-[2px] hover:bg-blue-300"
                title="Expand Up"
                data-title="Expand Up"
                onClick={() => diffFile.onSplitHunkExpand("up", index)}
              >
                <ExpandUp className="fill-current" />
              </button>
            </>
          )
        ) : (
          <div className="min-h-[28px]">&ensp;</div>
        )}
      </div>
      <div
        className="diff-line-hunk-content flex w-full items-center px-[10px]"
        style={{ backgroundColor: `var(${hunkContentBGName})`, color: `var(${hunkContentColorName})` }}
      >
        {currentHunk.splitInfo?.plainText || currentHunk.text}
      </div>
    </div>
  );
};

export const DiffSplitHunkLine = ({
  index,
  diffFile,
  lineNumber,
}: {
  index: number;
  diffFile: DiffFile;
  lineNumber: number;
}) => {
  const { useDiffContext } = useDiffViewContext();

  const diffViewMode = useDiffContext(React.useCallback((s) => s.mode, []));

  if (
    diffViewMode === DiffModeEnum.SplitGitHub ||
    diffViewMode === DiffModeEnum.Split ||
    diffViewMode === DiffModeEnum.Unified
  ) {
    return <DiffSplitHunkLineGitHub index={index} diffFile={diffFile} lineNumber={lineNumber} />;
  } else {
    return <DiffSplitHunkLineGitLab index={index} diffFile={diffFile} lineNumber={lineNumber} />;
  }
};