import { composeLen, type DiffFile } from "@git-diff-view/core";

import { ExpandAll, ExpandDown, ExpandUp } from "./DiffExpand";
import { useDiffViewContext } from "./DiffViewContext";
import { estimateLineNumberWidth, HUNK_MIN_HEIGHT } from "./styleUtils";
import { joinClass, surfaceClass } from "../theme";

type ReactNode = any;
/** GitHub wrap-style hunk: full-width row (action + content). */
export const DiffSplitHunkLine = ({
  index,
  diffFile,
  lineNumber,
}: {
  index: number;
  diffFile: DiffFile;
  lineNumber: number;
}) => {
  const currentHunk = diffFile.getSplitHunkLine(index);

  const currentIsShow =
    currentHunk &&
    currentHunk.splitInfo &&
    currentHunk.splitInfo.startHiddenIndex < currentHunk.splitInfo.endHiddenIndex;

  const currentIsPureHunk = currentHunk && diffFile._getIsPureDiffRender() && !currentHunk.splitInfo;

  if (!currentIsShow && !currentIsPureHunk) return <view />;

  const { useDiffContext } = useDiffViewContext();
  const fontSize = useDiffContext.useShallowStableSelector((s) => s.fontSize) || 13;
  const asideWidth = estimateLineNumberWidth(Math.max(diffFile.splitLineLength, diffFile.fileLineLength), fontSize);

  const expandEnabled = diffFile.getExpandEnabled();
  const couldExpand = expandEnabled && currentHunk && currentHunk.splitInfo;
  const isExpandAll =
    currentHunk &&
    currentHunk.splitInfo &&
    currentHunk.splitInfo.endHiddenIndex - currentHunk.splitInfo.startHiddenIndex < composeLen;
  const isFirstLine = currentHunk && currentHunk.isFirst;
  const isLastLine = currentHunk && currentHunk.isLast;

  let action: ReactNode = null;
  if (couldExpand) {
    if (isFirstLine) {
      action = (
        <view
          className="diff-hunk-action flex w-full items-center justify-center rounded-[2px] py-[6px]"
          bindtap={() => diffFile.onSplitHunkExpand("up", index)}
        >
          <ExpandUp />
        </view>
      );
    } else if (isLastLine) {
      action = (
        <view
          className="diff-hunk-action flex w-full items-center justify-center rounded-[2px] py-[6px]"
          bindtap={() => diffFile.onSplitHunkExpand("down", index)}
        >
          <ExpandDown />
        </view>
      );
    } else if (isExpandAll) {
      action = (
        <view
          className="diff-hunk-action flex w-full items-center justify-center rounded-[2px] py-[6px]"
          bindtap={() => diffFile.onSplitHunkExpand("all", index)}
        >
          <ExpandAll />
        </view>
      );
    } else {
      action = (
        <view className="flex w-full flex-col">
          <view
            className="diff-hunk-action flex w-full items-center justify-center rounded-[2px] py-[2px]"
            bindtap={() => diffFile.onSplitHunkExpand("down", index)}
          >
            <ExpandDown />
          </view>
          <view
            className="diff-hunk-action flex w-full items-center justify-center rounded-[2px] py-[2px]"
            bindtap={() => diffFile.onSplitHunkExpand("up", index)}
          >
            <ExpandUp />
          </view>
        </view>
      );
    }
  }

  return (
    <view className="diff-line diff-line-hunk flex w-full flex-row items-stretch" flatten={false}>
      <view
        className={joinClass(
          "diff-line-hunk-action flex flex-shrink-0 flex-col items-center justify-center p-[1px]",
          surfaceClass("hunk-num")
        )}
        style={{
          width: `${asideWidth}px`,
          minWidth: `${asideWidth}px`,
          maxWidth: `${asideWidth}px`,
          minHeight: `${HUNK_MIN_HEIGHT}px`,
        }}
      >
        {action || <view style={{ minHeight: `${HUNK_MIN_HEIGHT}px` }} />}
      </view>
      <view
        className={joinClass("diff-line-hunk-content flex min-w-0 flex-1 items-center px-[10px]", surfaceClass("hunk"))}
        style={{ flexBasis: "0%", minHeight: `${HUNK_MIN_HEIGHT}px` }}
      >
        <text className="diff-fg-hunk w-full">{currentHunk.splitInfo?.plainText || currentHunk.text}</text>
      </view>
    </view>
  );
};
