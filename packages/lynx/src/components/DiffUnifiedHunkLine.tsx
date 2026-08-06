import { composeLen, type DiffFile } from "@git-diff-view/core";

import { ExpandAll, ExpandDown, ExpandUp } from "./DiffExpand";
import { useDiffViewContext } from "./DiffViewContext";
import { estimateUnifiedLineNumberWidth, HUNK_MIN_HEIGHT } from "./styleUtils";
import { joinClass, surfaceClass } from "../theme";

type ReactNode = any;

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

  const currentIsPureHunk = currentHunk && diffFile._getIsPureDiffRender() && !currentHunk.unifiedInfo;

  if (!currentIsShow && !currentIsPureHunk) return <view />;

  const { useDiffContext } = useDiffViewContext();
  const fontSize = useDiffContext.useShallowStableSelector((s) => s.fontSize) || 13;
  const numColWidth = estimateUnifiedLineNumberWidth(
    Math.max(diffFile.unifiedLineLength, diffFile.fileLineLength),
    fontSize
  );

  const expandEnabled = diffFile.getExpandEnabled();
  const couldExpand = expandEnabled && currentHunk && currentHunk.unifiedInfo;
  const isExpandAll =
    currentHunk &&
    currentHunk.unifiedInfo &&
    currentHunk.unifiedInfo.endHiddenIndex - currentHunk.unifiedInfo.startHiddenIndex < composeLen;
  const isFirstLine = currentHunk && currentHunk.isFirst;
  const isLastLine = currentHunk && currentHunk.isLast;

  let action: ReactNode = null;
  if (couldExpand) {
    if (isFirstLine) {
      action = (
        <view
          className="diff-hunk-action flex w-full items-center justify-center rounded-[2px] py-[6px]"
          bindtap={() => diffFile.onUnifiedHunkExpand("up", index)}
        >
          <ExpandUp />
        </view>
      );
    } else if (isLastLine) {
      action = (
        <view
          className="diff-hunk-action flex w-full items-center justify-center rounded-[2px] py-[6px]"
          bindtap={() => diffFile.onUnifiedHunkExpand("down", index)}
        >
          <ExpandDown />
        </view>
      );
    } else if (isExpandAll) {
      action = (
        <view
          className="diff-hunk-action flex w-full items-center justify-center rounded-[2px] py-[6px]"
          bindtap={() => diffFile.onUnifiedHunkExpand("all", index)}
        >
          <ExpandAll />
        </view>
      );
    } else {
      action = (
        <view className="flex w-full flex-col">
          <view
            className="diff-hunk-action flex w-full items-center justify-center rounded-[2px] py-[2px]"
            bindtap={() => diffFile.onUnifiedHunkExpand("down", index)}
          >
            <ExpandDown />
          </view>
          <view
            className="diff-hunk-action flex w-full items-center justify-center rounded-[2px] py-[2px]"
            bindtap={() => diffFile.onUnifiedHunkExpand("up", index)}
          >
            <ExpandUp />
          </view>
        </view>
      );
    }
  }

  return (
    <view className="diff-line flex w-full flex-row" flatten={false}>
      <view
        className={joinClass(
          "diff-line-num flex flex-shrink-0 flex-col items-center justify-center p-[1px]",
          surfaceClass("hunk-num")
        )}
        style={{
          width: `${numColWidth}px`,
          minWidth: `${numColWidth}px`,
          maxWidth: `${numColWidth}px`,
          minHeight: `${HUNK_MIN_HEIGHT}px`,
        }}
      >
        {action || <view style={{ minHeight: `${HUNK_MIN_HEIGHT}px` }} />}
      </view>
      <view
        className={joinClass("diff-line-content flex min-w-0 flex-1 items-center px-[10px]", surfaceClass("hunk"))}
        style={{ flexBasis: "0%", minHeight: `${HUNK_MIN_HEIGHT}px` }}
      >
        <text className="diff-fg-hunk w-full">{currentHunk.unifiedInfo?.plainText || currentHunk.text}</text>
      </view>
    </view>
  );
};
