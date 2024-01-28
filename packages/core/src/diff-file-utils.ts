import { numIterator } from ".";

import type { DiffHunkItem, SplitLineItem, UnifiedLineItem, DiffFile } from ".";

export enum DiffFileLineType {
  hunk = 1,
  content = 2,
  widget = 3,
  extend = 4,
  lastHunk = 5,
}

export type DiffSplitLineItem = {
  type: DiffFileLineType;
  index: number;
  lineNumber: number;
  splitLine?: { left: SplitLineItem; right: SplitLineItem };
  widgetLine?: { side: "left" | "right" };
  extendLine?: { side: "left" | "right"; data?: any };
  hunkLine?: DiffHunkItem;
};

export type DiffUnifiedLineItem = {
  type: DiffFileLineType;
  index: number;
  lineNumber: number;
  unifiedLine?: UnifiedLineItem;
  widgetLine?: { side: "left" | "right" };
  extendLine?: { side: "left" | "right"; data?: any };
  hunkLine?: DiffHunkItem;
};

type Options = {
  hasRenderWidget?: boolean;
  hasRenderExtend?: boolean;
  widgetData?: { [lineNumber: number]: { side: "left" | "right" } };
  extendData?: { [lineNumber: number]: { side: "left" | "right"; data: any } };
};

export const getSplitLines = (diffFile: DiffFile, options: Options): DiffSplitLineItem[] => {
  const splitLineLength = diffFile.splitLineLength;

  const splitLines: DiffSplitLineItem[] = [];

  numIterator(splitLineLength, (index) => {
    const hunkLine = diffFile.getSplitHunkLine(index);
    const splitLeftLine = diffFile.getSplitLeftLine(index);
    const splitRightLine = diffFile.getSplitRightLine(index);
    const widgetLine = options?.hasRenderWidget && options.widgetData?.[index + 1];
    const extendLine = options?.hasRenderExtend && options.extendData?.[index + 1];

    hunkLine &&
      hunkLine.splitInfo &&
      hunkLine.splitInfo.startHiddenIndex < hunkLine.splitInfo.endHiddenIndex &&
      splitLines.push({ type: DiffFileLineType.hunk, index, lineNumber: index + 1, hunkLine: hunkLine });

    !splitLeftLine?.isHidden &&
      !splitRightLine?.isHidden &&
      splitLines.push({
        type: DiffFileLineType.content,
        index,
        lineNumber: index + 1,
        splitLine: { left: splitLeftLine, right: splitRightLine },
      });

    widgetLine &&
      splitLines.push({ type: DiffFileLineType.widget, index, lineNumber: index + 1, widgetLine: widgetLine });
    extendLine &&
      splitLines.push({ type: DiffFileLineType.extend, index, lineNumber: index + 1, extendLine: extendLine });
  });

  const lastHunkLine = diffFile.getNeedShowExpandAll("split");

  const expandEnabled = diffFile.getExpandEnabled();

  if (lastHunkLine && expandEnabled) {
    splitLines.push({
      type: DiffFileLineType.lastHunk,
      index: splitLineLength,
      lineNumber: splitLineLength + 1,
    });
  }

  return splitLines;
};

export const getUnifiedLines = (diffFile: DiffFile, options: Options): DiffUnifiedLineItem[] => {
  const unifiedLineLength = diffFile.unifiedLineLength;

  const unifiedLines: DiffUnifiedLineItem[] = [];

  numIterator(unifiedLineLength, (index) => {
    const hunkLine = diffFile.getUnifiedHunkLine(index);
    const unifiedLine = diffFile.getUnifiedLine(index);
    const widgetLine = options?.hasRenderWidget && options.widgetData?.[index + 1];
    const extendLine = options?.hasRenderExtend && options.extendData?.[index + 1];

    hunkLine &&
      hunkLine.unifiedInfo &&
      hunkLine.unifiedInfo.startHiddenIndex < hunkLine.unifiedInfo.endHiddenIndex &&
      unifiedLines.push({ type: DiffFileLineType.hunk, index, lineNumber: index + 1, hunkLine: hunkLine });

    !unifiedLine.isHidden &&
      unifiedLines.push({ type: DiffFileLineType.content, index, lineNumber: index + 1, unifiedLine: unifiedLine });

    widgetLine &&
      unifiedLines.push({ type: DiffFileLineType.widget, index, lineNumber: index + 1, widgetLine: widgetLine });
    extendLine &&
      unifiedLines.push({ type: DiffFileLineType.extend, index, lineNumber: index + 1, extendLine: extendLine });
  });

  const lastHunkLine = diffFile.getNeedShowExpandAll('unified');

  const expandEnabled = diffFile.getExpandEnabled();

  if (lastHunkLine && expandEnabled) {
    unifiedLines.push({
      type: DiffFileLineType.lastHunk,
      index: unifiedLineLength,
      lineNumber: unifiedLineLength + 1,
    });
  }

  return unifiedLines;
};
