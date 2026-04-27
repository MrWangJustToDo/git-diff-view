import type { MultiSelectSide } from "./types";

/**
 * Get line number from a split mode line number cell element
 */
export function getLineNumberFromElement_Split(el: HTMLElement | null): number | null {
  if (!el) return null;

  const targetEl = el.querySelector("span[data-line-num]");
  if (!targetEl) return null;

  const lineAttr = targetEl.getAttribute("data-line-num");
  const line = parseInt(lineAttr ?? "", 10);

  if (lineAttr !== line.toString()) return null;

  return !isNaN(line) ? line : null;
}

/**
 * Get side (old/new) from a split mode element
 */
export function getSideFromElement_Split(el: HTMLElement | null): MultiSelectSide | null {
  if (!el) return null;

  const targetEl = el.closest("[data-side]");
  if (!targetEl) return null;

  return targetEl.getAttribute("data-side") as MultiSelectSide;
}

/**
 * Get line numbers from a unified mode element
 */
export function getLineNumbersFromElement_Unified(el: HTMLElement | null): { old?: number; new?: number } | null {
  if (!el) return null;

  const lineNumbersEl = el.closest(".diff-line-num");
  if (!lineNumbersEl) return null;

  const lineNumberOld = lineNumbersEl.querySelector("span[data-line-old-num]");
  const lineNumberNew = lineNumbersEl.querySelector("span[data-line-new-num]");

  const lineOldStr = lineNumberOld?.getAttribute("data-line-old-num");
  const lineNewStr = lineNumberNew?.getAttribute("data-line-new-num");

  const rowLineOld = lineOldStr ? parseInt(lineOldStr, 10) : undefined;
  const rowLineNew = lineNewStr ? parseInt(lineNewStr, 10) : undefined;

  if (rowLineOld === undefined && rowLineNew === undefined) return null;

  return { old: rowLineOld, new: rowLineNew };
}

/**
 * Find the number holder element from a target element in split mode
 */
export function getNumberHolderElement_Split(el: HTMLElement | null, inMouseDown = false): HTMLElement | null {
  if (!el) return null;

  let numberHolder: HTMLElement | null = null;

  if (!inMouseDown || el.closest(".diff-add-widget-wrapper")) {
    const newContentEl = el.closest(".diff-line-new-content");
    const oldContentEl = el.closest(".diff-line-old-content");

    if (newContentEl) {
      numberHolder = newContentEl.parentElement?.querySelector(".diff-line-new-num") ?? null;
    }
    if (oldContentEl) {
      numberHolder = oldContentEl.parentElement?.querySelector(".diff-line-old-num") ?? null;
    }
  }

  if (!numberHolder) {
    numberHolder = el.closest(".diff-line-new-num") || el.closest(".diff-line-old-num");
  }

  return numberHolder;
}

/**
 * Ensure start <= end in a range
 */
export function normalizeRange<T extends { startLineNumber: number; endLineNumber: number }>(range: T): T {
  const start = Math.min(range.startLineNumber, range.endLineNumber);
  const end = Math.max(range.startLineNumber, range.endLineNumber);
  return { ...range, startLineNumber: start, endLineNumber: end };
}
