import { getSplitContentLines, getUnifiedContentLine, type DiffFile } from "@git-diff-view/core";
import { DiffModeEnum, NewLineSymbol } from "@git-diff-view/utils";

import { getCurrentLineRow } from "./tools";

import type { ScrollLayout, ScrollSlice } from "./scroll";

export type DiffScrollEntryKind = "hunk" | "content" | "extend";

export type DiffDisplayEntryDescriptor = {
  kind: DiffScrollEntryKind;
  diffIndex: number;
  displayLineNumber: number;
};

export type DiffScrollLine = {
  lineNumber: number;
  startRow: number;
  endRow: number;
  kind: DiffScrollEntryKind;
  diffIndex: number;
};

export type DiffViewScrollLayout = ScrollLayout & {
  lines: DiffScrollLine[];
};

export const EMPTY_DIFF_VIEW_SCROLL_LAYOUT: DiffViewScrollLayout = {
  rows: [],
  lines: [],
  totalRows: 0,
  totalLines: 0,
};

export type VisibleDiffScrollLine = DiffScrollLine & {
  clip?: ScrollSlice;
};

export type DiffDisplayIterateOptions = {
  diffFile: DiffFile;
  mode: DiffModeEnum;
  extendData?: {
    oldFile?: Record<string, { data: unknown }>;
    newFile?: Record<string, { data: unknown }>;
  };
  hasRenderExtendLine?: boolean;
};

export type BuildDiffViewScrollLayoutOptions = DiffDisplayIterateOptions & {
  columns: number;
  extendLineHeight?: number;
};

const noNewlineText = "\\ No newline at end of file";

function pushScrollEntry(
  rows: string[],
  lines: DiffScrollLine[],
  kind: DiffScrollEntryKind,
  diffIndex: number,
  rowCount: number
) {
  if (rowCount <= 0) return;

  const startRow = rows.length;
  for (let i = 0; i < rowCount; i++) {
    rows.push("");
  }

  lines.push({
    lineNumber: lines.length + 1,
    startRow,
    endRow: rows.length,
    kind,
    diffIndex,
  });
}

export function shouldShowUnifiedHunk(diffFile: DiffFile, index: number): boolean {
  const currentHunk = diffFile.getUnifiedHunkLine(index);
  const currentIsShow =
    !!currentHunk &&
    !!currentHunk.unifiedInfo &&
    currentHunk.unifiedInfo.startHiddenIndex < currentHunk.unifiedInfo.endHiddenIndex;
  const currentIsPureHunk = !!currentHunk && diffFile._getIsPureDiffRender() && !currentHunk.unifiedInfo;
  return currentIsShow || currentIsPureHunk;
}

export function shouldShowSplitHunk(diffFile: DiffFile, index: number): boolean {
  const currentHunk = diffFile.getSplitHunkLine(index);
  const currentIsShow =
    !!currentHunk &&
    !!currentHunk.splitInfo &&
    currentHunk.splitInfo.startHiddenIndex < currentHunk.splitInfo.endHiddenIndex;
  const currentIsPureHunk = !!currentHunk && diffFile._getIsPureDiffRender() && !currentHunk.splitInfo;
  return currentIsShow || currentIsPureHunk;
}

export function shouldShowUnifiedExtend(
  diffFile: DiffFile,
  index: number,
  extendData: DiffDisplayIterateOptions["extendData"],
  hasRenderExtendLine?: boolean
): boolean {
  if (!hasRenderExtendLine) return false;

  const unifiedItem = diffFile.getUnifiedLine(index);
  if (!unifiedItem || unifiedItem.isHidden) return false;

  const oldLineExtend = extendData?.oldFile?.[unifiedItem.oldLineNumber ?? -1];
  const newLineExtend = extendData?.newFile?.[unifiedItem.newLineNumber ?? -1];

  return !!(oldLineExtend?.data || newLineExtend?.data);
}

export function shouldShowSplitExtend(
  diffFile: DiffFile,
  index: number,
  extendData: DiffDisplayIterateOptions["extendData"],
  hasRenderExtendLine?: boolean
): boolean {
  if (!hasRenderExtendLine) return false;

  const oldLine = diffFile.getSplitLeftLine(index);
  const newLine = diffFile.getSplitRightLine(index);
  const oldLineExtend = extendData?.oldFile?.[oldLine?.lineNumber ?? -1];
  const newLineExtend = extendData?.newFile?.[newLine?.lineNumber ?? -1];
  const hasExtend = !!(oldLineExtend?.data || newLineExtend?.data);
  const enableExpand = diffFile.getExpandEnabled();

  return hasExtend && ((!oldLine?.isHidden && !newLine?.isHidden) || !enableExpand);
}

function shouldShowHunk(diffFile: DiffFile, index: number, mode: DiffModeEnum): boolean {
  return isSplitDiffMode(mode) ? shouldShowSplitHunk(diffFile, index) : shouldShowUnifiedHunk(diffFile, index);
}

function shouldShowExtend(diffFile: DiffFile, index: number, options: DiffDisplayIterateOptions): boolean {
  return isSplitDiffMode(options.mode)
    ? shouldShowSplitExtend(diffFile, index, options.extendData, options.hasRenderExtendLine)
    : shouldShowUnifiedExtend(diffFile, index, options.extendData, options.hasRenderExtendLine);
}

/**
 * Walk the flattened DiffView display sequence (hunk → content → extend per content block).
 * Shared by scroll layout building and rendering.
 */
export function iterateDiffDisplayEntries(options: DiffDisplayIterateOptions): DiffDisplayEntryDescriptor[] {
  const { diffFile, mode } = options;
  const contentLines = isSplitDiffMode(mode) ? getSplitContentLines(diffFile) : getUnifiedContentLine(diffFile);
  const entries: DiffDisplayEntryDescriptor[] = [];

  contentLines.forEach((item, mapIndex) => {
    if (mapIndex !== 0 && shouldShowHunk(diffFile, item.index, mode)) {
      entries.push({ kind: "hunk", diffIndex: item.index, displayLineNumber: item.lineNumber });
    }

    entries.push({ kind: "content", diffIndex: item.index, displayLineNumber: item.lineNumber });

    if (shouldShowExtend(diffFile, item.index, options)) {
      entries.push({ kind: "extend", diffIndex: item.index, displayLineNumber: item.lineNumber });
    }
  });

  return entries;
}

export function getDiffLineNumWidth(diffFile: DiffFile, mode: DiffModeEnum): number {
  const lineLength = isSplitDiffMode(mode)
    ? Math.max(diffFile.splitLineLength, diffFile.fileLineLength)
    : Math.max(diffFile.unifiedLineLength, diffFile.fileLineLength);

  return lineLength.toString().length;
}

export function getUnifiedContentRowCount(
  diffFile: DiffFile,
  index: number,
  columns: number,
  lineNumWidth: number
): number {
  const unifiedLine = diffFile.getUnifiedLine(index);
  if (unifiedLine?.isHidden) return 0;

  const rawLine = unifiedLine.value || "";
  const diffLine = unifiedLine.diff;
  const contentWidth = columns - (lineNumWidth + 1) * 2 - 1;
  const contentWithSymbol =
    diffLine?.changes?.hasLineChange && diffLine.changes.newLineSymbol === NewLineSymbol.NEWLINE
      ? rawLine + noNewlineText
      : rawLine;

  return getCurrentLineRow({ content: contentWithSymbol, width: contentWidth - 2 });
}

export function getSplitContentRowCount(
  diffFile: DiffFile,
  index: number,
  columns: number,
  lineNumWidth: number
): number {
  const oldLine = diffFile.getSplitLeftLine(index);
  const newLine = diffFile.getSplitRightLine(index);

  if (oldLine?.isHidden && newLine?.isHidden) return 0;

  const contentWidth = columns / 2 - lineNumWidth - 2;

  const oldContent =
    oldLine?.diff?.changes?.hasLineChange && oldLine?.diff?.changes.newLineSymbol === NewLineSymbol.NEWLINE
      ? (oldLine?.value || "") + noNewlineText
      : oldLine?.value || "";

  const newContent =
    newLine?.diff?.changes?.hasLineChange && newLine?.diff?.changes.newLineSymbol === NewLineSymbol.NEWLINE
      ? (newLine?.value || "") + noNewlineText
      : newLine?.value || "";

  const oldRow = getCurrentLineRow({ content: oldContent, width: contentWidth - 2 });
  const newRow = getCurrentLineRow({ content: newContent, width: contentWidth - 2 });

  return Math.max(oldRow, newRow);
}

export function getDiffDisplayEntryRowCount(
  entry: DiffDisplayEntryDescriptor,
  options: {
    diffFile: DiffFile;
    mode: DiffModeEnum;
    columns: number;
    lineNumWidth: number;
    extendLineHeight?: number;
  }
): number {
  const { diffFile, mode, columns, lineNumWidth, extendLineHeight = 1 } = options;

  switch (entry.kind) {
    case "hunk":
      return 1;
    case "content":
      return isSplitDiffMode(mode)
        ? getSplitContentRowCount(diffFile, entry.diffIndex, columns, lineNumWidth)
        : getUnifiedContentRowCount(diffFile, entry.diffIndex, columns, lineNumWidth);
    case "extend":
      return extendLineHeight;
  }
}

export function buildDiffViewScrollLayout(options: BuildDiffViewScrollLayoutOptions): DiffViewScrollLayout {
  if (options.columns <= 0) {
    return { rows: [], lines: [], totalRows: 0, totalLines: 0 };
  }

  const { diffFile, mode, columns, extendLineHeight = 1 } = options;
  const lineNumWidth = getDiffLineNumWidth(diffFile, mode);
  const rows: string[] = [];
  const lines: DiffScrollLine[] = [];

  for (const entry of iterateDiffDisplayEntries(options)) {
    const rowCount = getDiffDisplayEntryRowCount(entry, { diffFile, mode, columns, lineNumWidth, extendLineHeight });
    pushScrollEntry(rows, lines, entry.kind, entry.diffIndex, rowCount);
  }

  return {
    rows,
    lines,
    totalRows: rows.length,
    totalLines: lines.length,
  };
}

export function getVisibleDiffScrollLines(
  layout: DiffViewScrollLayout,
  scrollOffset: number,
  viewportHeight: number
): VisibleDiffScrollLine[] {
  if (layout.totalRows <= 0) return [];

  const viewStart = scrollOffset;
  const viewEnd = scrollOffset + viewportHeight - 1;
  const visible: VisibleDiffScrollLine[] = [];

  for (const entry of layout.lines) {
    if (entry.endRow - 1 < viewStart) continue;
    if (entry.startRow > viewEnd) break;

    const entryStart = entry.startRow;
    const entryEnd = entry.endRow;
    const visibleStart = Math.max(entryStart, viewStart);
    const visibleEnd = Math.min(entryEnd, viewEnd + 1);
    const rowOffset = visibleStart - entryStart;
    const rowCount = visibleEnd - visibleStart;
    const fullRowCount = entryEnd - entryStart;

    visible.push({
      ...entry,
      clip: rowOffset > 0 || rowCount < fullRowCount ? { rowOffset, rowCount } : undefined,
    });
  }

  return visible;
}

export function isSplitDiffMode(mode: DiffModeEnum): boolean {
  return !!(mode & DiffModeEnum.Split);
}

/** @deprecated use isSplitDiffMode */
export function getUnifiedLineDisplayNumber(diffFile: DiffFile, diffIndex: number): number {
  const items = getUnifiedContentLine(diffFile);
  const item = items.find((line) => line.index === diffIndex);
  return item?.lineNumber ?? diffIndex + 1;
}

export function getSplitLineDisplayNumber(diffFile: DiffFile, diffIndex: number): number {
  const items = getSplitContentLines(diffFile);
  const item = items.find((line) => line.index === diffIndex);
  return item?.lineNumber ?? diffIndex + 1;
}

export function getDiffContentLineNumber(diffFile: DiffFile, diffIndex: number, mode: DiffModeEnum): number {
  return isSplitDiffMode(mode)
    ? getSplitLineDisplayNumber(diffFile, diffIndex)
    : getUnifiedLineDisplayNumber(diffFile, diffIndex);
}
