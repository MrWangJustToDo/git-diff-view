import { getSelectedLinesFromDiffFile_Split } from "..";

import { normalizeRange } from "./dom";
import { DEFAULT_SELECTED_CLASS } from "./types";

import type { DiffFile } from "../diff-file";
import type { LineRange } from "./types";

type PreselectedLineType = {
  old?: number[];
  new?: number[];
};

const changePreselectedLinesToLineRange = (line: PreselectedLineType) => {
  const ranges: LineRange[] = [];

  if (line.new && line.new.length) {
    ranges.push({
      side: "new",
      startLineNumber: Math.min(...line.new),
      endLineNumber: Math.max(...line.new),
    });
  }
  if (line.old && line.old.length) {
    ranges.push({
      side: "old",
      startLineNumber: Math.min(...line.old),
      endLineNumber: Math.max(...line.old),
    });
  }

  return ranges;
};

const addClassForSplitRange = (allTrs: HTMLElement[], diffFile: DiffFile, range: LineRange, className: string) => {
  const rangeLines = getSelectedLinesFromDiffFile_Split(diffFile, range);

  rangeLines.forEach((item) => {
    if (!item.isHide && item.index) {
      const currentTrs = allTrs.filter((node) => node.getAttribute("data-line") === item.index.toString());
      // no warp
      if (currentTrs.length === 2) {
        if (item.isContext) {
          currentTrs.forEach((tr) => tr.querySelectorAll("td").forEach((td) => td.classList.add(className)));
        } else {
          const tr = currentTrs.find((tr) => tr.getAttribute("data-side") === range.side);
          tr?.querySelectorAll("td").forEach((td) => td.classList.add(className));
        }
      } else {
        // wrap
        if (item.isContext) {
          currentTrs[0]?.querySelectorAll("td").forEach((td) => td.classList.add(className));
        } else {
          currentTrs[0]?.querySelectorAll(`td[data-side="${range.side}"]`).forEach((td) => td.classList.add(className));
        }
      }
    }
  });
};

/**
 * Update visual selection state for split mode
 */
export function updateSelectionVisual_Split(
  container: HTMLElement | null,
  selectedRange: LineRange | null,
  diffFile: DiffFile | null,
  preselectedLines: PreselectedLineType = { old: [], new: [] },
  className: string = DEFAULT_SELECTED_CLASS
): void {
  if (!container) return;

  const rootId = `diff-root${diffFile?.getId()}`;

  const allTr = Array.from(container.querySelectorAll<HTMLElement>("tr[data-line]"));

  const allValidTr = allTr.filter((node) => node.closest(".diff-view-wrapper")?.getAttribute("id") === rootId);

  const preselectedRanges = changePreselectedLinesToLineRange(preselectedLines);

  const _allRanges = selectedRange ? preselectedRanges.concat(selectedRange) : preselectedRanges;

  const allRanges = _allRanges.map(normalizeRange);

  allValidTr.forEach((tr) => {
    const tds = tr.querySelectorAll("td");
    tds.forEach((td) => td.classList.remove(className));
  });

  allRanges.forEach((range) => {
    if (range && diffFile) {
      addClassForSplitRange(allValidTr, diffFile, range, className);
    }
  });
}

/**
 * Update visual selection state for unified mode
 */
export function updateSelectionVisual_Unified(
  container: HTMLElement | null,
  selectedRange: LineRange | null,
  diffFile: DiffFile | null,
  preselectedLines: PreselectedLineType = { old: [], new: [] },
  className: string = DEFAULT_SELECTED_CLASS
): void {
  if (!container) return;

  const rootId = `diff-root${diffFile?.getId()}`;

  const allRows = Array.from(container.querySelectorAll<HTMLElement>("tr[data-line]"));

  const allValidTr = allRows.filter((node) => node.closest(".diff-view-wrapper")?.getAttribute("id") === rootId);

  const preselectedRanges = changePreselectedLinesToLineRange(preselectedLines);

  const _allRanges = selectedRange ? preselectedRanges.concat(selectedRange) : preselectedRanges;

  const allRanges = _allRanges.map(normalizeRange);

  allValidTr.forEach((row) => {
    const lineNumbersEl = row.querySelector(".diff-line-num");
    const lineContentEl = row.querySelector(".diff-line-content");

    if (!lineNumbersEl || !lineContentEl) return;

    lineNumbersEl.classList.remove(className);
    lineContentEl.classList.remove(className);

    const lineNumberOld = lineNumbersEl.querySelector("span[data-line-old-num]");
    const lineNumberNew = lineNumbersEl.querySelector("span[data-line-new-num]");

    const lineOldStr = lineNumberOld?.getAttribute("data-line-old-num");
    const lineNewStr = lineNumberNew?.getAttribute("data-line-new-num");

    const rowLineOld = lineOldStr ? parseInt(lineOldStr, 10) : undefined;
    const rowLineNew = lineNewStr ? parseInt(lineNewStr, 10) : undefined;

    if (
      allRanges.some(
        (range) =>
          (range.side === "old" &&
            rowLineOld &&
            rowLineOld >= range.startLineNumber &&
            rowLineOld <= range.endLineNumber) ||
          (range.side === "new" &&
            rowLineNew &&
            rowLineNew >= range.startLineNumber &&
            rowLineNew <= range.endLineNumber)
      )
    ) {
      lineNumbersEl.classList.add(className);
      lineContentEl.classList.add(className);
    }
  });
}
