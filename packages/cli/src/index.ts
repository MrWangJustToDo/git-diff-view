export * from "./components/DiffView";

export * from "./components/CodeView";

export * from "./components/scroll";

export {
  buildDiffViewScrollLayout,
  getVisibleDiffScrollLines,
  getUnifiedContentRowCount,
  getSplitContentRowCount,
  iterateDiffDisplayEntries,
  getDiffDisplayEntryRowCount,
  getDiffLineNumWidth,
} from "./components/diffViewScroll";

export type {
  DiffViewScrollLayout,
  DiffScrollLine,
  VisibleDiffScrollLine,
  DiffScrollEntryKind,
  DiffDisplayEntryDescriptor,
  DiffDisplayIterateOptions,
} from "./components/diffViewScroll";

export { buildTheme } from "./components/color";

export type { ThemeColor, DiffViewColorTheme, ResolvedDiffViewColorTheme } from "./components/color";

export * from "@git-diff-view/core";
