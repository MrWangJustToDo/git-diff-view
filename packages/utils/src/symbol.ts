import { NewLineSymbol } from "@git-diff-view/core";

export const getSymbol = (symbol: NewLineSymbol | string | null | undefined) => {
  switch (symbol) {
    case NewLineSymbol.LF:
      return "␊";
    case NewLineSymbol.CR:
      return "␍";
    case NewLineSymbol.CRLF:
      return "␍␊";
    default:
      return "";
  }
};
