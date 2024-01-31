import { composeLen, type DiffFile } from "@git-diff-view/core";
import * as React from "react";

import { SplitSide } from "..";
import { useSyncHeight } from "../hooks/useSyncHeight";

import { hunkContentBGName, hunkContentColorName, hunkLineNumberBGName, plainLineNumberColorName } from "./color";
import { ExpandAll, ExpandDown, ExpandUp } from "./DiffExpand";

const _DiffSplitHunkLine = ({
  index,
  diffFile,
  side,
  lineNumber,
}: {
  index: number;
  side: SplitSide;
  diffFile: DiffFile;
  lineNumber: number;
}) => {
  const currentHunk = diffFile.getSplitHunkLine(index);

  const expandEnabled = diffFile.getExpandEnabled();

  useSyncHeight({
    selector: `tr[data-line="${lineNumber}-hunk"]`,
    side: SplitSide[SplitSide.old],
    enable: side === SplitSide.new,
  });

  const enableHunkAction = side === SplitSide.old;

  const isExpandAll =
    currentHunk &&
    currentHunk.splitInfo &&
    currentHunk.splitInfo.endHiddenIndex - currentHunk.splitInfo.startHiddenIndex < composeLen;

  return (
    <tr
      data-line={`${lineNumber}-hunk`}
      data-state="hunk"
      data-side={SplitSide[side]}
      className="diff-line diff-line-hunk"
    >
      {enableHunkAction ? (
        <>
          <td
            className="diff-line-hunk-action sticky left-0 p-[1px] w-[1%] min-w-[40px] select-none"
            style={{
              backgroundColor: `var(${hunkLineNumberBGName})`,
              color: `var(${plainLineNumberColorName})`,
            }}
          >
            {expandEnabled ? (
              isExpandAll ? (
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
              )
            ) : (
              <span>&ensp;</span>
            )}
          </td>
          <td
            className="diff-line-hunk-content pr-[10px] align-middle"
            style={{ backgroundColor: `var(${hunkContentBGName})` }}
          >
            <div
              className="pl-[1.5em]"
              style={{
                color: `var(${hunkContentColorName})`,
              }}
            >
              {currentHunk.splitInfo.plainText}
            </div>
          </td>
        </>
      ) : (
        <td className="diff-line-hunk-placeholder" colSpan={2} style={{ backgroundColor: `var(${hunkContentBGName})` }}>
          <span>&ensp;</span>
        </td>
      )}
    </tr>
  );
};

export const DiffSplitHunkLine = ({
  index,
  diffFile,
  side,
  lineNumber,
}: {
  index: number;
  side: SplitSide;
  diffFile: DiffFile;
  lineNumber: number;
}) => {
  const currentHunk = diffFile.getSplitHunkLine(index);

  const currentIsShow =
    currentHunk &&
    currentHunk.splitInfo &&
    currentHunk.splitInfo.startHiddenIndex < currentHunk.splitInfo.endHiddenIndex;

  if (!currentIsShow) return null;

  return <_DiffSplitHunkLine index={index} diffFile={diffFile} side={side} lineNumber={lineNumber} />;
};

const _DiffSplitLastHunkLine = ({ diffFile, side }: { side: SplitSide; diffFile: DiffFile }) => {
  const countRef = React.useRef(0);

  const enableHunkAction = side === SplitSide.old;

  useSyncHeight({
    selector: `tr[data-line="last-hunk"]`,
    side: SplitSide[SplitSide.old],
    enable: side === SplitSide.new,
  });

  return (
    <tr data-line="last-hunk" data-state="hunk" data-side={SplitSide[side]} className="diff-line diff-line-hunk">
      {enableHunkAction ? (
        <>
          <td
            className="diff-line-hunk-action sticky left-0 p-[1px] w-[1%] min-w-[40px] select-none"
            style={{
              backgroundColor: `var(${hunkLineNumberBGName})`,
              color: `var(${plainLineNumberColorName})`,
            }}
          >
            <button
              className="w-full hover:bg-blue-300 flex justify-center items-center py-[6px] cursor-pointer rounded-[2px] relative"
              title="Expand Down"
              onClick={() => {
                countRef.current++;
                diffFile.onSplitLastExpand(countRef.current >= 3);
              }}
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
        </>
      ) : (
        <td className="diff-line-hunk-placeholder" colSpan={2} style={{ backgroundColor: `var(${hunkContentBGName})` }}>
          <span>&ensp;</span>
        </td>
      )}
    </tr>
  );
};

export const DiffSplitLastHunkLine = ({ diffFile, side }: { side: SplitSide; diffFile: DiffFile }) => {
  const currentIsShow = diffFile.getNeedShowExpandAll("split");

  const expandEnabled = diffFile.getExpandEnabled();

  if (!currentIsShow || !expandEnabled) return null;

  return <_DiffSplitLastHunkLine diffFile={diffFile} side={side} />;
};
