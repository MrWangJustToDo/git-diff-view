import { SplitSide } from "../diff-file-utils";

import type { DiffFileForMultiSelect, MultiSelectSide } from "./types";

/**
 * The selected line numbers of each side, usually the result of `extendDataToPreselectedLines`
 */
export interface MultiSelectLineNumbers {
  old?: number[];
  new?: number[];
}

/**
 * The resolved multi selection description of a single line
 */
export interface MultiSelectMatchedLine {
  /**
   * The side the widget / callback should be attached to
   */
  side: SplitSide;
  /**
   * The `MultiSelectLineNumbers` key of the matched side
   */
  sideKey: MultiSelectSide;
  /**
   * The selected line numbers of the matched side
   */
  lineNumbers: number[];
  /**
   * The last line number of the matched side
   */
  max: number;
}

export interface MatchMultiSelectLineOptions {
  /**
   * The current multi selection line numbers of each side
   */
  multiResult?: MultiSelectLineNumbers;
  /**
   * The clicked / rendering line number, in the side of `side`
   */
  lineNumber: number;
  /**
   * The line side reported by the add widget
   */
  side: SplitSide;
  /**
   * Whether the diff view is rendered in unified mode
   */
  isUnifiedMode?: boolean;
  diffFile?: DiffFileForMultiSelect | null;
}

/**
 * Resolve which side of the multi selection the clicked line belongs to.
 *
 * In unified mode an unchanged line always reports its add widget as `new` side,
 * so a selection which starts from deleted lines and ends on an unchanged line
 * would be attached to the wrong side. In that case we fall back to the other side
 * when it holds the selection and its max line number is the current line itself.
 *
 * Both the `onAddWidgetClick` callback and the widget line renderer must use this
 * helper, otherwise the emitted callback arguments and the rendered widget diverge.
 */
export function getMatchedMultiSelectLine({
  multiResult,
  lineNumber,
  side,
  isUnifiedMode,
  diffFile,
}: MatchMultiSelectLineOptions): MultiSelectMatchedLine | undefined {
  if (!multiResult) return undefined;

  const sideKey: MultiSelectSide = side === SplitSide.old ? "old" : "new";

  const currentLineNumbers = multiResult[sideKey];

  if (currentLineNumbers?.length) {
    const max = Math.max(...currentLineNumbers);

    if (max === lineNumber) {
      return { side, sideKey, lineNumbers: currentLineNumbers, max };
    }
  }

  const otherSideKey: MultiSelectSide = sideKey === "new" ? "old" : "new";

  const otherLineNumbers = multiResult[otherSideKey];

  if (!isUnifiedMode || !otherLineNumbers?.length || !diffFile) return undefined;

  const index = diffFile.getUnifiedLineIndexByLineNumber(lineNumber, side);

  const unifiedItem = index >= 0 ? diffFile.getUnifiedLine(index) : undefined;

  // an unchanged line is the only case where both sides hold a line number
  const otherSideLineNumber = side === SplitSide.old ? unifiedItem?.newLineNumber : unifiedItem?.oldLineNumber;

  const max = Math.max(...otherLineNumbers);

  if (otherSideLineNumber === undefined || max !== otherSideLineNumber) return undefined;

  return {
    side: otherSideKey === "old" ? SplitSide.old : SplitSide.new,
    sideKey: otherSideKey,
    lineNumbers: otherLineNumbers,
    max,
  };
}
