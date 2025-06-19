export enum NewLineSymbol {
  CRLF = 1,
  CR = 2,
  LF = 3,
  NEWLINE = 4,
  NORMAL = 5,
  NULL = 6,
}

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

export enum DiffModeEnum {
  // github like
  SplitGitHub = 1,
  // gitlab like
  SplitGitLab = 2,
  Split = 1 | 2,
  Unified = 4,
}
