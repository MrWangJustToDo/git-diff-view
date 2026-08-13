export const diffFontSizeName = "--diff-font-size--";

export const diffAsideWidthName = "--diff-aside-width--";

/** Split gutter: pad + digits + pad */
export const SPLIT_NUM_PAD_START = 10;
export const SPLIT_NUM_PAD_END = 10;
export const SPLIT_NUM_PAD_TOTAL = SPLIT_NUM_PAD_START + SPLIT_NUM_PAD_END;

/** Unified gutter: edge + digits + mid + digits + edge */
export const UNIFIED_NUM_PAD_EDGE = 5;
export const UNIFIED_NUM_PAD_MID = 8;

/** Split `--diff-aside-width--` from measured digit column width. */
export const getSplitAsideWidth = (digitWidth: number, min = 40) => Math.max(min, digitWidth + SPLIT_NUM_PAD_TOTAL);

/**
 * Unified half aside (one digit column + edge pad).
 * Full dual column = `aside * 2 + UNIFIED_NUM_PAD_MID`.
 * Floor is intentionally low so 2–3 digit files stay compact.
 */
export const getUnifiedAsideHalfWidth = (digitWidth: number, min = 20) =>
  Math.max(min, digitWidth + UNIFIED_NUM_PAD_EDGE);

/** CSS width for the unified dual line-number column. */
export const unifiedAsideColumnWidthCss = `calc(var(${diffAsideWidthName}) * 2 + ${UNIFIED_NUM_PAD_MID}px)`;
