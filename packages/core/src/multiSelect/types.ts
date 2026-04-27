import type { DiffFile } from "../diff-file";

export type MultiSelectSide = "old" | "new";

/**
 * Type alias for DiffFile used by multi-select
 */
export type DiffFileForMultiSelect = DiffFile;

export interface LineRange {
  side: MultiSelectSide;
  startLineNumber: number;
  endLineNumber: number;
}

export interface SelectedLine {
  index: number;
  lineNumber: number;
  value?: string;
  isHide?: boolean;
  isDelete?: boolean;
  isAdd?: boolean;
  isContext?: boolean;
}

export interface MultiSelectResult {
  range: LineRange;
  lines: SelectedLine[];
}

export interface MultiSelectState {
  isSelecting: boolean;
  startInfo: { lineNumber: number; side: MultiSelectSide } | null;
  currentRange: LineRange | null;
}

export interface MultiSelectOptions {
  /**
   * Enable multi-select feature
   * @default true
   */
  enabled?: boolean;
  /**
   * Callback when selection changes (for visual updates)
   */
  onSelectionChange?: (range: LineRange | null, state: MultiSelectState) => void;
  /**
   * Callback when selection is complete (mouseup)
   * Provides the selected range and line data from DiffFile
   */
  onSelectionComplete?: (result: MultiSelectResult | null) => void;
  /**
   * Custom function to scope selection to one hunk
   * Return the scoped range or null to cancel selection
   */
  scopeToHunk?: (range: LineRange) => LineRange | null;
  /**
   * CSS class to add to selected cells
   * @default "diff-multi-select-active"
   */
  selectedClassName?: string;
  /**
   * Whether it's unified mode
   * @default false
   */
  isUnifiedMode?: boolean;
}

export const DEFAULT_SELECTED_CLASS = "diff-multi-select-active";

/**
 * CSS class names used for multi-select styling
 */
export const multiSelectClassNames = {
  selected: DEFAULT_SELECTED_CLASS,
  selecting: "diff-multi-selecting",
} as const;
