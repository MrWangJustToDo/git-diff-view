import { DiffFileLineType, type DiffFile, type DiffUnifiedLineItem } from "@git-diff-view/core";
import { diffAsideWidthName } from "@git-diff-view/utils";
import { memo } from "@lynx-js/react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useSyncExternalStore } from "use-sync-external-store/shim/index.js";

import { DiffUnifiedContentLine } from "./DiffUnifiedContentLine";
import { DiffUnifiedExtendLine } from "./DiffUnifiedExtendLine";
import { DiffUnifiedHunkLine } from "./DiffUnifiedHunkLine";
import { useDiffViewContext } from "./DiffViewContext";
import {
  estimateListItemHeight,
  estimateUnifiedLineNumberWidth,
  estimateUnifiedNowrapTableWidth,
  listItemKey,
} from "./styleUtils";
import { getVisibleUnifiedLines } from "./visibleLines";

import type { UnifiedNowrapPane } from "./styleUtils";

const DiffUnifiedViewLine = ({
  line,
  diffFile,
  tableWidth,
  pane,
}: {
  line: DiffUnifiedLineItem;
  diffFile: DiffFile;
  tableWidth?: number;
  pane?: UnifiedNowrapPane;
}) => {
  switch (line.type) {
    case DiffFileLineType.hunk:
      return (
        <DiffUnifiedHunkLine
          index={line.index}
          lineNumber={line.lineNumber}
          diffFile={diffFile}
          tableWidth={tableWidth}
          pane={pane}
        />
      );
    case DiffFileLineType.content:
      return (
        <DiffUnifiedContentLine
          index={line.index}
          lineNumber={line.lineNumber}
          diffFile={diffFile}
          tableWidth={tableWidth}
          pane={pane}
        />
      );
    case DiffFileLineType.extend:
      return (
        <DiffUnifiedExtendLine
          index={line.index}
          lineNumber={line.lineNumber}
          diffFile={diffFile}
          tableWidth={tableWidth}
          pane={pane}
        />
      );
    default:
      return <view />;
  }
};

/** Longest visible content string — drives nowrap table width (react auto-table). */
const maxUnifiedContentLength = (diffFile: DiffFile, lines: DiffUnifiedLineItem[]) => {
  let max = 0;
  for (const line of lines) {
    if (line.type === DiffFileLineType.content) {
      const u = diffFile.getUnifiedLine(line.index);
      const len = (u?.value || "").length;
      if (len > max) max = len;
    } else if (line.type === DiffFileLineType.hunk) {
      const h = diffFile.getUnifiedHunkLine(line.index);
      const text = h?.unifiedInfo?.plainText || h?.text || "";
      if (text.length > max) max = text.length;
    }
  }
  return max;
};

const InternalDiffUnifiedView = ({ diffFile }: { diffFile: DiffFile }) => {
  const { useDiffContext } = useDiffViewContext();
  const { fontSize, enableWrap, extendData, renderExtendLine } = useDiffContext.useShallowStableSelector((s) => ({
    fontSize: s.fontSize || 13,
    enableWrap: s.enableWrap ?? true,
    extendData: s.extendData,
    renderExtendLine: s.renderExtendLine,
  }));

  useSyncExternalStore(diffFile.subscribe, diffFile.getUpdateCount, diffFile.getUpdateCount);

  const unifiedLineLength = Math.max(diffFile.unifiedLineLength, diffFile.fileLineLength);
  const numColWidth = estimateUnifiedLineNumberWidth(unifiedLineLength, fontSize);
  const lines = getVisibleUnifiedLines(diffFile);

  const rootStyle = {
    [diffAsideWidthName]: `${numColWidth}px`,
    fontFamily: "Menlo, Consolas, monospace",
    fontSize: `${fontSize}px`,
  } as Record<string, string>;

  const listItems = (tableWidth?: number) =>
    lines.map((line) => {
      const key = listItemKey(line.type, line.index);
      return (
        <list-item key={key} item-key={key} estimated-main-axis-size-px={estimateListItemHeight(line.type, fontSize)}>
          <DiffUnifiedViewLine line={line} diffFile={diffFile} tableWidth={tableWidth} />
        </list-item>
      );
    });

  if (enableWrap) {
    return (
      <list
        className="unified-diff-view unified-diff-view-wrap w-full"
        list-type="single"
        scroll-orientation="vertical"
        style={{ height: "100%", width: "100%", ...rootStyle }}
      >
        {listItems()}
      </list>
    );
  }

  /**
   * Lynx cannot 2D-scroll (`scroll-x` + `scroll-y` paints empty).
   * `sticky` only applies to *direct* children of `<scroll-view>`, and the docs
   * pin to the start of the scroll axis (typically top). Nested-list CSS sticky
   * does not attach to an ancestor H scroller.
   *
   * Official "one child, complex layout inside":
   * V `scroll-view` → one flex row [gutter | H `scroll-view` → content].
   * Gutter never enters the H scroller, so line nums stay put. No Y-sync.
   */
  const nowrapLines = lines.filter((line) => {
    if (line.type !== DiffFileLineType.extend) return true;
    if (!renderExtendLine) return false;
    const u = diffFile.getUnifiedLine(line.index);
    const old = extendData?.oldFile?.[u?.oldLineNumber ?? -1];
    const neu = extendData?.newFile?.[u?.newLineNumber ?? -1];
    return !!(old?.data || neu?.data);
  });

  const tableWidth = estimateUnifiedNowrapTableWidth(
    maxUnifiedContentLength(diffFile, nowrapLines),
    unifiedLineLength,
    fontSize
  );
  const contentColWidth = Math.max(0, tableWidth - numColWidth);
  const totalHeight = nowrapLines.reduce((sum, line) => sum + estimateListItemHeight(line.type, fontSize), 0);

  const nowrapColumn = (pane: UnifiedNowrapPane) =>
    nowrapLines.map((line) => (
      <DiffUnifiedViewLine
        key={`${pane}-${listItemKey(line.type, line.index)}`}
        line={line}
        diffFile={diffFile}
        tableWidth={tableWidth}
        pane={pane}
      />
    ));

  return (
    <scroll-view
      scroll-y
      className="unified-diff-view unified-diff-view-normal w-full"
      style={{ height: "100%", width: "100%", ...rootStyle }}
    >
      <view
        flatten={false}
        className="unified-diff-table"
        style={
          {
            width: "100%",
            height: `${totalHeight}px`,
            minHeight: `${totalHeight}px`,
            display: "linear",
            linearDirection: "row",
          } as Record<string, string>
        }
      >
        <view
          flatten={false}
          className="diff-line-num-col flex flex-col"
          style={{
            width: `${numColWidth}px`,
            minWidth: `${numColWidth}px`,
            maxWidth: `${numColWidth}px`,
            height: `${totalHeight}px`,
            zIndex: 1,
          }}
        >
          {nowrapColumn("gutter")}
        </view>
        <view
          flatten={false}
          className="min-w-0"
          style={
            {
              height: `${totalHeight}px`,
              linearWeight: 1,
              flexGrow: 1,
              flexShrink: 1,
              flexBasis: "0%",
              minWidth: "0px",
            } as Record<string, string | number>
          }
        >
          <scroll-view
            scroll-x
            className="unified-diff-table-wrapper"
            enable-nested-scroll
            style={{ width: "100%", height: `${totalHeight}px` }}
          >
            <view
              flatten={false}
              className="flex flex-col"
              style={{
                width: "100%",
                minWidth: `${contentColWidth}px`,
                height: `${totalHeight}px`,
              }}
            >
              {nowrapColumn("content")}
            </view>
          </scroll-view>
        </view>
      </view>
    </scroll-view>
  );
};

InternalDiffUnifiedView.displayName = "DiffUnifiedView";

export const DiffUnifiedView = memo(InternalDiffUnifiedView) as typeof InternalDiffUnifiedView;
