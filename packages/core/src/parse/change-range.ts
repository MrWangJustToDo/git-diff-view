import fastDiff from "fast-diff";

import type { DiffLine } from "./diff-line";

export enum NewLineSymbol {
  CRLF = 1,
  CR = 2,
  LF = 3,
  NEWLINE = 4,
  NORMAL = 5,
}

export interface IRange {
  /** The starting location for the range. */
  readonly location: number;

  /** The length of the range. */
  readonly length: number;

  readonly newLineSymbol?: NewLineSymbol;
}

export interface DiffRange {
  readonly range: ReturnType<typeof fastDiff>;

  readonly newLineSymbol?: NewLineSymbol;
}

const maxLength = 1000;

/** Get the maximum position in the range. */
function rangeMax(range: IRange): number {
  return range.location + range.length;
}

/** Get the length of the common substring between the two strings. */
function commonLength(stringA: string, rangeA: IRange, stringB: string, rangeB: IRange, reverse: boolean): number {
  const max = Math.min(rangeA.length, rangeB.length);
  const startA = reverse ? rangeMax(rangeA) - 1 : rangeA.location;
  const startB = reverse ? rangeMax(rangeB) - 1 : rangeB.location;
  const stride = reverse ? -1 : 1;

  let length = 0;
  while (Math.abs(length) < max) {
    if (stringA[startA + length] !== stringB[startB + length]) {
      break;
    }

    length += stride;
  }

  return Math.abs(length);
}

function isInValidString(s: string) {
  return s.trim().length === 0 || s.length >= maxLength;
}

function checkNewLineSymbolChange(
  addition: DiffLine,
  deletion: DiffLine
): { addSymbol: NewLineSymbol; delSymbol: NewLineSymbol } {
  const stringA = addition.text;

  const stringB = deletion.text;

  const aEndStr = stringA.slice(-2);

  const bEndStr = stringB.slice(-2);

  const aSymbol =
    aEndStr === "\r\n" ? NewLineSymbol.CRLF : aEndStr.endsWith("\r") ? NewLineSymbol.CR : NewLineSymbol.LF;

  const bSymbol =
    bEndStr === "\r\n" ? NewLineSymbol.CRLF : bEndStr.endsWith("\r") ? NewLineSymbol.CR : NewLineSymbol.LF;

  const hasNewLineChanged = addition.noTrailingNewLine !== deletion.noTrailingNewLine;

  if (hasNewLineChanged) {
    return {
      addSymbol: addition.noTrailingNewLine ? NewLineSymbol.NEWLINE : NewLineSymbol.NORMAL,
      delSymbol: deletion.noTrailingNewLine ? NewLineSymbol.NEWLINE : NewLineSymbol.NORMAL,
    };
  }

  if (aSymbol === bSymbol) {
    return { addSymbol: undefined, delSymbol: undefined };
  }

  return { addSymbol: aSymbol, delSymbol: bSymbol };
}

// TODO maybe could use the original content line
/** Get the changed ranges in the strings, relative to each other. */
export function relativeChanges(
  addition: DiffLine,
  deletion: DiffLine
): { stringARange: IRange; stringBRange: IRange } {
  const stringA = addition.text;

  const stringB = deletion.text;

  let bRange = { location: 0, length: stringB.length };
  let aRange = { location: 0, length: stringA.length };

  const _stringA = stringA.trimEnd();

  const _stringB = stringB.trimEnd();

  const aEndStr = stringA.slice(-2);

  const bEndStr = stringB.slice(-2);

  const hasNewLineChanged = addition.noTrailingNewLine !== deletion.noTrailingNewLine;

  const aSymbol =
    aEndStr === "\r\n" ? NewLineSymbol.CRLF : aEndStr.endsWith("\r") ? NewLineSymbol.CR : NewLineSymbol.LF;

  const bSymbol =
    bEndStr === "\r\n" ? NewLineSymbol.CRLF : bEndStr.endsWith("\r") ? NewLineSymbol.CR : NewLineSymbol.LF;

  if (_stringA === _stringB && (hasNewLineChanged || aSymbol !== bSymbol)) {
    return {
      stringARange: {
        location: _stringA.length,
        length: stringA.length - _stringA.length,
        newLineSymbol: hasNewLineChanged ? NewLineSymbol.NEWLINE : aSymbol,
      },
      stringBRange: {
        location: _stringB.length,
        length: stringB.length - _stringB.length,
        newLineSymbol: hasNewLineChanged ? NewLineSymbol.NEWLINE : bSymbol,
      },
    };
  }

  if (isInValidString(stringA) || isInValidString(stringB)) {
    aRange.length = 0;
    bRange.length = 0;

    return { stringARange: aRange, stringBRange: bRange };
  }

  const prefixLength = commonLength(stringB, bRange, stringA, aRange, false);
  bRange = {
    location: bRange.location + prefixLength,
    length: bRange.length - prefixLength,
  };
  aRange = {
    location: aRange.location + prefixLength,
    length: aRange.length - prefixLength,
  };

  const suffixLength = commonLength(stringB, bRange, stringA, aRange, true);
  bRange.length -= suffixLength;
  aRange.length -= suffixLength;

  return { stringARange: aRange, stringBRange: bRange };
}

/** Check two string have a diff range */
export function hasRelativeChange(addition: DiffLine, deletion: DiffLine): boolean {
  const stringA = addition.text;

  const stringB = deletion.text;

  const _stringA = addition.text.trim();

  const _stringB = deletion.text.trim();

  const aEndStr = stringA.slice(-2);

  const bEndStr = stringB.slice(-2);

  const aSymbol =
    aEndStr === "\r\n" ? NewLineSymbol.CRLF : aEndStr.endsWith("\r") ? NewLineSymbol.CR : NewLineSymbol.LF;

  const bSymbol =
    bEndStr === "\r\n" ? NewLineSymbol.CRLF : bEndStr.endsWith("\r") ? NewLineSymbol.CR : NewLineSymbol.LF;

  if (_stringA === _stringB) {
    return true;
  }

  if (
    _stringA[0] === _stringB[0] ||
    (_stringA[_stringA.length - 1] === _stringB[_stringB.length - 1] && aSymbol === bSymbol)
  ) {
    return true;
  }

  return false;
}

export function diffChanges(
  addition: DiffLine,
  deletion: DiffLine
): { stringARange: DiffRange; stringBRange: DiffRange } {
  const stringA = addition.text;

  const stringB = deletion.text;

  const _stringA = stringA.trimEnd();

  const _stringB = stringB.trimEnd();

  const res = checkNewLineSymbolChange(addition, deletion);

  if (isInValidString(stringA) || isInValidString(stringB)) {
    return {
      stringARange: { range: [], newLineSymbol: res.addSymbol },
      stringBRange: { range: [], newLineSymbol: res.delSymbol },
    };
  }

  const diffRange = fastDiff(_stringA, _stringB, 0, true);

  const aRange = diffRange.filter((i) => i[0] === 1);

  const bRange = diffRange.filter((i) => i[0] === -1);

  return {
    stringARange: { range: aRange, newLineSymbol: res.addSymbol },
    stringBRange: { range: bRange, newLineSymbol: res.delSymbol },
  };
}
