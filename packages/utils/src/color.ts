export const addContentBGName = "--diff-add-content--";

export const delContentBGName = "--diff-del-content--";

export const borderColorName = "--diff-border--";

export const addLineNumberBGName = "--diff-add-lineNumber--";

export const delLineNumberBGName = "--diff-del-lineNumber--";

export const plainContentBGName = "--diff-plain-content--";

export const expandContentBGName = "--diff-expand-content--";

export const plainLineNumberColorName = "--diff-plain-lineNumber-color--";

export const expandLineNumberColorName = "--diff-expand-lineNumber-color--";

export const plainLineNumberBGName = "--diff-plain-lineNumber--";

export const expandLineNumberBGName = "--diff-expand-lineNumber--";

export const hunkContentBGName = "--diff-hunk-content--";

export const hunkContentColorName = "--diff-hunk-content-color--";

export const hunkLineNumberBGName = "--diff-hunk-lineNumber--";

export const hunkLineNumberBGHoverName = "--diff-hunk-lineNumber-hover--";

export const addContentHighlightBGName = "--diff-add-content-highlight--";

export const delContentHighlightBGName = "--diff-del-content-highlight--";

export const addWidgetBGName = "--diff-add-widget--";

export const addWidgetColorName = "--diff-add-widget-color--";

export const emptyBGName = "--diff-empty-content--";

export const getContentBG = (isAdded: boolean, isDelete: boolean, hasDiff: boolean) => {
  return isAdded
    ? `var(${addContentBGName})`
    : isDelete
      ? `var(${delContentBGName})`
      : hasDiff
        ? `var(${plainContentBGName})`
        : `var(${expandContentBGName})`;
};

export const getLineNumberBG = (isAdded: boolean, isDelete: boolean, hasDiff: boolean) => {
  return isAdded
    ? `var(${addLineNumberBGName})`
    : isDelete
      ? `var(${delLineNumberBGName})`
      : hasDiff
        ? `var(${plainLineNumberBGName})`
        : `var(${expandLineNumberBGName})`;
};
