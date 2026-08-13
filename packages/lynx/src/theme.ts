/**
 * Theme helpers for Lynx — colors live in CSS variables (`_theme.css`).
 * Prefer className + stylesheet `var(--*)` over inline `var()` / hex.
 */

export type LynxThemeName = "light" | "dark";

export type DiffSurface =
  | "add"
  | "del"
  | "plain"
  | "expand"
  | "empty"
  | "hunk"
  | "hunk-num"
  | "add-num"
  | "del-num"
  | "plain-num"
  | "expand-num";

export const themeClassName = (theme: LynxThemeName) => (theme === "dark" ? "theme-dark" : "theme-light");

export const surfaceClass = (surface: DiffSurface) => `diff-surface-${surface}`;

export const contentSurface = (isAdded: boolean, isDelete: boolean, hasDiff: boolean): DiffSurface => {
  if (isAdded) return "add";
  if (isDelete) return "del";
  return hasDiff ? "plain" : "expand";
};

export const lineNumberSurface = (isAdded: boolean, isDelete: boolean, hasDiff: boolean): DiffSurface => {
  if (isAdded) return "add-num";
  if (isDelete) return "del-num";
  return hasDiff ? "plain-num" : "expand-num";
};

export const joinClass = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");
