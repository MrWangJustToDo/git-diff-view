import { DiffFileLineType, getSplitLines, getUnifiedLines, type DiffFile } from "@git-diff-view/core";

import type { DiffSplitLineItem, DiffUnifiedLineItem } from "@git-diff-view/core";

/** Drop widget slots (unsupported) and rows that would render empty — fewer Lynx snapshot children. */
export const getVisibleSplitLines = (diffFile: DiffFile): DiffSplitLineItem[] => {
  return getSplitLines(diffFile).filter((line) => {
    if (line.type === DiffFileLineType.widget) return false;

    if (line.type === DiffFileLineType.hunk) {
      const currentHunk = diffFile.getSplitHunkLine(line.index);
      const currentIsShow =
        currentHunk &&
        currentHunk.splitInfo &&
        currentHunk.splitInfo.startHiddenIndex < currentHunk.splitInfo.endHiddenIndex;
      const currentIsPureHunk = !!(currentHunk && diffFile._getIsPureDiffRender() && !currentHunk.splitInfo);
      return !!(currentIsShow || currentIsPureHunk);
    }

    if (line.type === DiffFileLineType.content) {
      const oldLine = diffFile.getSplitLeftLine(line.index);
      const newLine = diffFile.getSplitRightLine(line.index);
      return !(oldLine?.isHidden && newLine?.isHidden);
    }

    if (line.type === DiffFileLineType.extend) {
      // Kept; DiffSplitExtendLine returns empty <view /> when no extendData.
      return true;
    }

    return false;
  });
};

export const getVisibleUnifiedLines = (diffFile: DiffFile): DiffUnifiedLineItem[] => {
  return getUnifiedLines(diffFile).filter((line) => {
    if (line.type === DiffFileLineType.widget) return false;

    if (line.type === DiffFileLineType.hunk) {
      const currentHunk = diffFile.getUnifiedHunkLine(line.index);
      const currentIsShow =
        currentHunk &&
        currentHunk.unifiedInfo &&
        currentHunk.unifiedInfo.startHiddenIndex < currentHunk.unifiedInfo.endHiddenIndex;
      const currentIsPureHunk = !!(currentHunk && diffFile._getIsPureDiffRender() && !currentHunk.unifiedInfo);
      return !!(currentIsShow || currentIsPureHunk);
    }

    if (line.type === DiffFileLineType.content) {
      const unifiedLine = diffFile.getUnifiedLine(line.index);
      return !unifiedLine?.isHidden;
    }

    if (line.type === DiffFileLineType.extend) {
      return true;
    }

    return false;
  });
};
