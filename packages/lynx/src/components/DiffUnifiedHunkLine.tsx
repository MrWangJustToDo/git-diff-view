import { composeLen, type DiffFile } from "@git-diff-view/core";

import { ExpandAll, ExpandDown, ExpandUp } from "./DiffExpand";
import { useDiffViewContext } from "./DiffViewContext";
import { asDiffStyle, estimateUnifiedLineNumberWidth, HUNK_MIN_HEIGHT } from "./styleUtils";
import { joinClass, surfaceClass } from "../theme";

import type { UnifiedNowrapPane } from "./styleUtils";

type ReactNode = any;

export const DiffUnifiedHunkLine = ({
  index,
  diffFile,
  lineNumber: _lineNumber,
  tableWidth,
  pane,
}: {
  index: number;
  diffFile: DiffFile;
  lineNumber: number;
  tableWidth?: number;
  pane?: UnifiedNowrapPane;
}) => {
  const currentHunk = diffFile.getUnifiedHunkLine(index);

  const currentIsShow =
    currentHunk &&
    currentHunk.unifiedInfo &&
    currentHunk.unifiedInfo.startHiddenIndex < currentHunk.unifiedInfo.endHiddenIndex;

  const currentIsPureHunk = currentHunk && diffFile._getIsPureDiffRender() && !currentHunk.unifiedInfo;

  if (!currentIsShow && !currentIsPureHunk) return <view />;

  const { useDiffContext } = useDiffViewContext();
  const { fontSize, enableWrap } = useDiffContext.useShallowStableSelector((s) => ({
    fontSize: s.fontSize || 13,
    enableWrap: s.enableWrap ?? true,
  }));
  const numColWidth = estimateUnifiedLineNumberWidth(
    Math.max(diffFile.unifiedLineLength, diffFile.fileLineLength),
    fontSize
  );
  const nowrap = !enableWrap && (pane != null || tableWidth != null);
  const contentColWidth = nowrap && tableWidth != null ? Math.max(0, tableWidth - numColWidth) : undefined;
  const showGutter = pane !== "content";
  const showContent = pane !== "gutter";

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

  const hunkText = currentHunk.unifiedInfo?.plainText || currentHunk.text;

  const rowHeightStyle = nowrap
    ? { height: `${HUNK_MIN_HEIGHT}px`, minHeight: `${HUNK_MIN_HEIGHT}px`, maxHeight: `${HUNK_MIN_HEIGHT}px` }
    : undefined;

  return (
    <view
      className={pane ? "diff-line flex flex-col" : "diff-line flex flex-row"}
      flatten={false}
      style={
        pane === "gutter"
          ? { width: "100%", ...rowHeightStyle }
          : pane === "content"
            ? { width: "100%", ...rowHeightStyle }
            : nowrap
              ? { width: `${tableWidth}px`, ...rowHeightStyle }
              : { width: "100%" }
      }
    >
      {showGutter ? (
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
      ) : null}
      {showContent ? (
        <view
          className={joinClass(
            nowrap
              ? "diff-line-content flex flex-shrink-0 items-center px-[10px]"
              : "diff-line-content flex min-w-0 flex-1 items-center px-[10px]",
            surfaceClass("hunk")
          )}
          style={{
            minHeight: `${HUNK_MIN_HEIGHT}px`,
            ...(nowrap
              ? pane
                ? { width: "100%", minWidth: "100%" }
                : {
                    width: `${contentColWidth}px`,
                    minWidth: `${contentColWidth}px`,
                  }
              : { flexBasis: "0%" }),
          }}
        >
          <text
            className="diff-fg-hunk"
            style={asDiffStyle({
              whiteSpace: nowrap ? "pre" : "pre-wrap",
              wordBreak: nowrap ? "normal" : "break-all",
            })}
          >
            {hunkText}
          </text>
        </view>
      ) : null}
    </view>
  );
};
