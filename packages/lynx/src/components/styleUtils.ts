import { DiffFileLineType } from "@git-diff-view/core";
import { memoFunc } from "@git-diff-view/utils";

import { GitHubDark, GitHubLight } from "../highlightColor";

import type { CSSProperties } from "@lynx-js/types";

export const getStyleObjectFromString = memoFunc((str: string) => {
  const re: { light: Record<string, string>; dark: Record<string, string> } = { light: {}, dark: {} };
  if (!str) return re;
  str.split(";").forEach((el) => {
    const [property, value] = el.split(":");
    if (!property) return;
    if (property.trim()?.endsWith("light")) {
      re["light"]["color"] = value.trim();
      return;
    }
    if (property.trim()?.endsWith("dark")) {
      re["dark"]["color"] = value.trim();
      return;
    }
  });
  return re;
});

export const getStyleFromClassName = memoFunc((className: string) => {
  const re: { light: Record<string, string>; dark: Record<string, string> } = { light: {}, dark: {} };
  if (!className) return re;
  className.split(" ").forEach((name) => {
    const dark = (GitHubDark as Record<string, Record<string, string>>)[name] || {};
    const light = (GitHubLight as Record<string, Record<string, string>>)[name] || {};
    Object.assign(re.dark, dark);
    Object.assign(re.light, light);
  });
  return re;
});

/** ~monospace digit advance (Menlo/Consolas), no canvas on Lynx. */
const DIGIT_EM = 0.62;

/** Split: 大空白 + 行号 + 小空白 */
export const SPLIT_NUM_PAD_START = 10;
export const SPLIT_NUM_PAD_END = 4;

/** Unified: 小空白 + 行号 + 中空白 + 行号 + 小空白 */
export const UNIFIED_NUM_PAD_EDGE = 4;
export const UNIFIED_NUM_PAD_MID = 10;

export const estimateDigitWidth = (lineCount: number, fontSize: number) => {
  const digits = Math.max(1, String(Math.max(1, lineCount)).length);
  return Math.round(digits * fontSize * DIGIT_EM);
};

/** Split gutter total width. */
export const estimateLineNumberWidth = (lineCount: number, fontSize: number) => {
  return estimateDigitWidth(lineCount, fontSize) + SPLIT_NUM_PAD_START + SPLIT_NUM_PAD_END;
};

/** Unified dual gutter total width. */
export const estimateUnifiedLineNumberWidth = (lineCount: number, fontSize: number) => {
  const digit = estimateDigitWidth(lineCount, fontSize);
  return UNIFIED_NUM_PAD_EDGE + digit + UNIFIED_NUM_PAD_MID + digit + UNIFIED_NUM_PAD_EDGE;
};

/** Content line-height aligned with typical DOM monospace rendering. */
export const estimateLineHeight = (fontSize: number) => Math.round(fontSize * 1.5);

/** Hunk row min height (matches react `min-h-[28px]`). */
export const HUNK_MIN_HEIGHT = 28;

/**
 * Placeholder height for `<list-item estimated-main-axis-size-px>`.
 * Lynx measures real height after layout; this only reduces first-pass jump.
 */
export const estimateListItemHeight = (type: DiffFileLineType, fontSize: number) => {
  if (type === DiffFileLineType.hunk) return HUNK_MIN_HEIGHT;
  if (type === DiffFileLineType.extend) return Math.max(HUNK_MIN_HEIGHT, estimateLineHeight(fontSize) + 12);
  return estimateLineHeight(fontSize);
};

/** Stable `<list-item item-key>` — must stay unique across expand/collapse. */
export const listItemKey = (type: DiffFileLineType | number, index: number) => `${type}-${index}`;

/**
 * Lynx CSSProperties only types `whiteSpace` as `normal` | `nowrap`,
 * but runtime accepts `pre-wrap` (needed for diff spaces/tabs).
 */
export type DiffViewStyle = Omit<CSSProperties, "whiteSpace"> & {
  whiteSpace?: CSSProperties["whiteSpace"] | "pre-wrap" | "pre" | "pre-line";
};

export const asDiffStyle = (style: DiffViewStyle): CSSProperties => style as CSSProperties;
