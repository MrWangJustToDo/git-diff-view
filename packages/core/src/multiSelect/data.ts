import { checkCurrentLineIsHidden, DiffLineType, SplitSide } from "..";

import { normalizeRange } from "./dom";

import type { SplitLineItem, UnifiedLineItem } from "../diff-file";
import type { DiffFileForMultiSelect, LineRange, SelectedLine } from "./types";

/**
 * Get selected lines data from DiffFile for split mode
 */
export function getSelectedLinesFromDiffFile_Split(diffFile: DiffFileForMultiSelect, range: LineRange): SelectedLine[] {
  const normalizedRange = normalizeRange(range);
  const lines: SelectedLine[] = [];
  const { side, startLineNumber, endLineNumber } = normalizedRange;

  const splitSide = side === "old" ? SplitSide.old : SplitSide.new; // SplitSide enum: old = 1, new = 2

  for (let lineNum = startLineNumber; lineNum <= endLineNumber; lineNum++) {
    const lineData = diffFile.getSplitLineByLineNumber(lineNum, splitSide) as SplitLineItem | undefined;
    const index = diffFile.getSplitLineIndexByLineNumber(lineNum, splitSide);

    if (lineData && lineData.lineNumber !== undefined) {
      const diffType = lineData.diff?.type;
      lines.push({
        index: index + 1,
        lineNumber: lineData.lineNumber,
        value: lineData.value,
        isHide: checkCurrentLineIsHidden(diffFile, lineNum, splitSide).split,
        isDelete: diffType === DiffLineType.Delete, // DiffLineType.Delete
        isAdd: diffType === DiffLineType.Add, // DiffLineType.Add
        isContext: diffType === DiffLineType.Context || diffType === undefined, // DiffLineType.Context or no diff
      });
    }
  }

  return lines;
}

/**
 * Get selected lines data from DiffFile for unified mode
 */
export function getSelectedLinesFromDiffFile_Unified(
  diffFile: DiffFileForMultiSelect,
  range: LineRange
): SelectedLine[] {
  const normalizedRange = normalizeRange(range);
  const lines: SelectedLine[] = [];
  const { side, startLineNumber, endLineNumber } = normalizedRange;

  const splitSide = side === "old" ? SplitSide.old : SplitSide.new; // SplitSide enum

  for (let lineNum = startLineNumber; lineNum <= endLineNumber; lineNum++) {
    const lineData = diffFile.getUnifiedLineByLineNumber(lineNum, splitSide) as UnifiedLineItem | undefined;
    const index = diffFile.getUnifiedLineIndexByLineNumber(lineNum, splitSide);

    if (lineData) {
      const lineNumber = side === "old" ? lineData.oldLineNumber : lineData.newLineNumber;
      if (lineNumber !== undefined) {
        const diffType = lineData.diff?.type;
        lines.push({
          index: index + 1,
          lineNumber: lineNumber,
          value: lineData.value,
          isHide: checkCurrentLineIsHidden(diffFile, lineNum, splitSide).unified,
          isDelete: diffType === DiffLineType.Delete,
          isAdd: diffType === DiffLineType.Add,
          isContext: diffType === DiffLineType.Context || diffType === undefined,
        });
      }
    }
  }

  return lines;
}

/**
 * Convert extendData to preselected lines format
 * Use this when you have existing comments/annotations on lines
 */
export function extendDataToPreselectedLines<T>(extendData?: {
  oldFile?: Record<string, { data: T; fromLine?: number }>;
  newFile?: Record<string, { data: T; fromLine?: number }>;
}): { old: number[] | undefined; new: number[] | undefined } {
  if (!extendData) return { old: [], new: [] };

  const populateLines = (data: Record<string, { fromLine?: number }> = {}): number[] => {
    const lines: number[] = [];
    Object.entries(data).forEach(([toLineStr, item]) => {
      const toLine = parseInt(toLineStr, 10);
      const fromLine = item.fromLine ?? toLine;
      for (let lineNo = fromLine; lineNo <= toLine; lineNo++) {
        lines.push(lineNo);
      }
    });
    return [...new Set(lines)];
  };

  return {
    old: populateLines(extendData.oldFile),
    new: populateLines(extendData.newFile),
  };
}
