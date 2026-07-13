import { getSplitContentLines, getUnifiedContentLine, type DiffFile } from "@git-diff-view/core";
import { DiffModeEnum, NewLineSymbol } from "@git-diff-view/utils";

import { getCurrentLineRow } from "./tools";

import type { ScrollLayout, ScrollSlice } from "./scroll";

export type DiffScrollEntryKind = "hunk" | "content" | "extend";

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

export type BuildDiffViewScrollLayoutOptions = {
  diffFile: DiffFile;
  columns: number;
  mode: DiffModeEnum;
  extendData?: {
    oldFile?: Record<string, { data: unknown }>;
    newFile?: Record<string, { data: unknown }>;
  };
  extendLineHeight?: number;
  hasRenderExtendLine?: boolean;
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

function shouldShowUnifiedExtend(
  diffFile: DiffFile,
  index: number,
  extendData: BuildDiffViewScrollLayoutOptions["extendData"],
  hasRenderExtendLine?: boolean
): boolean {
  if (!hasRenderExtendLine) return false;

  const unifiedItem = diffFile.getUnifiedLine(index);
  if (!unifiedItem || unifiedItem.isHidden) return false;

  const oldLineExtend = extendData?.oldFile?.[unifiedItem.oldLineNumber ?? -1];
  const newLineExtend = extendData?.newFile?.[unifiedItem.newLineNumber ?? -1];

  return !!(oldLineExtend?.data || newLineExtend?.data);
}

function shouldShowSplitExtend(
  diffFile: DiffFile,
  index: number,
  extendData: BuildDiffViewScrollLayoutOptions["extendData"],
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

function buildUnifiedScrollLayout(options: BuildDiffViewScrollLayoutOptions): DiffViewScrollLayout {
  const { diffFile, columns, extendData, extendLineHeight = 1, hasRenderExtendLine } = options;
  const rows: string[] = [];
  const lines: DiffScrollLine[] = [];

  const unifiedLineLength = Math.max(diffFile.unifiedLineLength, diffFile.fileLineLength);
  const lineNumWidth = unifiedLineLength.toString().length;
  const contentLines = getUnifiedContentLine(diffFile);

  contentLines.forEach((item, mapIndex) => {
    if (mapIndex !== 0 && shouldShowUnifiedHunk(diffFile, item.index)) {
      pushScrollEntry(rows, lines, "hunk", item.index, 1);
    }

    const contentRows = getUnifiedContentRowCount(diffFile, item.index, columns, lineNumWidth);
    pushScrollEntry(rows, lines, "content", item.index, contentRows);

    if (shouldShowUnifiedExtend(diffFile, item.index, extendData, hasRenderExtendLine)) {
      pushScrollEntry(rows, lines, "extend", item.index, extendLineHeight);
    }
  });

  return {
    rows,
    lines,
    totalRows: rows.length,
    totalLines: lines.length,
  };
}

function buildSplitScrollLayout(options: BuildDiffViewScrollLayoutOptions): DiffViewScrollLayout {
  const { diffFile, columns, extendData, extendLineHeight = 1, hasRenderExtendLine } = options;
  const rows: string[] = [];
  const lines: DiffScrollLine[] = [];

  const splitLineLength = Math.max(diffFile.splitLineLength, diffFile.fileLineLength);
  const lineNumWidth = splitLineLength.toString().length;
  const contentLines = getSplitContentLines(diffFile);

  contentLines.forEach((item, mapIndex) => {
    if (mapIndex !== 0 && shouldShowSplitHunk(diffFile, item.index)) {
      pushScrollEntry(rows, lines, "hunk", item.index, 1);
    }

    const contentRows = getSplitContentRowCount(diffFile, item.index, columns, lineNumWidth);
    pushScrollEntry(rows, lines, "content", item.index, contentRows);

    if (shouldShowSplitExtend(diffFile, item.index, extendData, hasRenderExtendLine)) {
      pushScrollEntry(rows, lines, "extend", item.index, extendLineHeight);
    }
  });

  return {
    rows,
    lines,
    totalRows: rows.length,
    totalLines: lines.length,
  };
}

export function buildDiffViewScrollLayout(options: BuildDiffViewScrollLayoutOptions): DiffViewScrollLayout {
  if (options.columns <= 0) {
    return { rows: [], lines: [], totalRows: 0, totalLines: 0 };
  }

  if (options.mode & DiffModeEnum.Split) {
    return buildSplitScrollLayout(options);
  }

  return buildUnifiedScrollLayout(options);
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
