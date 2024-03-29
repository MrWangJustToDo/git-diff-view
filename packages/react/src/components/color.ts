export const addContentBG = "#e6ffec";

export const addContentBGName = "--diff-add-content--";

export const delContentBG = "#ffebe9";

export const delContentBGName = "--diff-del-content--";

export const addLineNumberBG = "#ccffd8";

export const addLineNumberBGName = "--diff-add-lineNumber--";

export const delLineNumberBG = "#ffd7d5";

export const delLineNumberBGName = "--diff-del-lineNumber--";

export const plainContentBG = "initial";

export const plainContentBGName = "--diff-plain-content--";

export const expandContentBG = "#fafafa";

export const expandContentBGName = "--diff-expand-content--";

export const plainLineNumberBG = "#fafafa";

export const plainLineNumberColor = "#555555";

export const plainLineNumberColorName = "--diff-plain-lineNumber-color--";

export const plainLineNumberBGName = "--diff-plain-lineNumber--";

export const hunkContentBG = "#ddf4ff";

export const hunkContentBGName = "--diff-hunk-content--";

export const hunkContentColor = "#777777";

export const hunkContentColorName = "--diff-hunk-content-color--";

export const hunkLineNumberBG = "#c7ecff";

export const hunkLineNumberBGName = "--diff-hunk-lineNumber--";

export const addContentHighlightBG = "#abf2bc";

export const addContentHighlightBGName = "--diff-add-content-highlight--";

export const delContentHighlightBG = "#ffb3ad";

export const delContentHighlightBGName = "--diff-del-content-highlight--";

export const addWidgetBG = "#0969d2";

export const addWidgetBGName = "--diff-add-widget--";

export const addWidgetColor = "white";

export const addWidgetColorName = "--diff-add-widget-color--";

export const emptyBG = "#f0f0f0";

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
        : `var(${expandContentBGName})`;
};
