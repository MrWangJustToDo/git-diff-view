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
  readonly range: {
    /** The starting location for the range. */
    readonly location: number;

    /** The length of the range. */
    readonly length: number;
  };

  readonly hasLineChange?: boolean;

  readonly newLineSymbol?: NewLineSymbol;
}

export interface DiffRange {
  readonly range: { type: 1 | -1 | 0; str: string; location: number; length: number }[];

  readonly hasLineChange?: boolean;

  readonly newLineSymbol?: NewLineSymbol;
}

const maxLength = 1000;

/** Get the maximum position in the range. */
function rangeMax(range: IRange["range"]): number {
  return range.location + range.length;
}

/** Get the length of the common substring between the two strings. */
function commonLength(
  stringA: string,
  rangeA: IRange["range"],
  stringB: string,
  rangeB: IRange["range"],
  reverse: boolean
): number {
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
): { addSymbol: NewLineSymbol; addString: string; delSymbol: NewLineSymbol; delString: string } {
  const stringA = addition.text;

  const stringB = deletion.text;

  const aEndStr = stringA.slice(-2);

  const bEndStr = stringB.slice(-2);

  const aSymbol =
    aEndStr === "\r\n" ? NewLineSymbol.CRLF : aEndStr.endsWith("\r") ? NewLineSymbol.CR : NewLineSymbol.LF;

  const bSymbol =
    bEndStr === "\r\n" ? NewLineSymbol.CRLF : bEndStr.endsWith("\r") ? NewLineSymbol.CR : NewLineSymbol.LF;

  const hasNewLineChanged = addition.noTrailingNewLine !== deletion.noTrailingNewLine;

  // if (hasNewLineChanged) {
  //   return {
  //     addSymbol: addition.noTrailingNewLine ? NewLineSymbol.NEWLINE : NewLineSymbol.NORMAL,
  //     addString: addition.noTrailingNewLine ? stringA : stringA.slice(0, -1),
  //     delSymbol: deletion.noTrailingNewLine ? NewLineSymbol.NEWLINE : NewLineSymbol.NORMAL,
  //     delString: deletion.noTrailingNewLine ? stringB : stringB.slice(0, -1),
  //   };
  // }

  if (aSymbol === bSymbol) {
    return { addSymbol: undefined, addString: stringA, delSymbol: undefined, delString: stringB };
  }

  return {
    addSymbol: hasNewLineChanged
      ? addition.noTrailingNewLine
        ? NewLineSymbol.NEWLINE
        : NewLineSymbol.NORMAL
      : aSymbol,
    addString: aSymbol === NewLineSymbol.CRLF ? stringA.slice(0, -2) : stringA.slice(0, -1),
    delSymbol: hasNewLineChanged
      ? deletion.noTrailingNewLine
        ? NewLineSymbol.NEWLINE
        : NewLineSymbol.NORMAL
      : bSymbol,
    delString: bSymbol === NewLineSymbol.CRLF ? stringB.slice(0, -2) : stringB.slice(0, -1),
  };
}

// TODO maybe could use the original content line
/** Get the changed ranges in the strings, relative to each other. */
export function relativeChanges(addition: DiffLine, deletion: DiffLine): { addRange: IRange; delRange: IRange } {
  const stringA = addition.text;

  const stringB = deletion.text;

  const { addString, delString, addSymbol, delSymbol } = checkNewLineSymbolChange(addition, deletion);

  if (addString === delString && addSymbol && delSymbol) {
    return {
      addRange: {
        range: {
          location: addString.length,
          length: stringA.length - addString.length,
        },
        hasLineChange: true,
        newLineSymbol: addSymbol,
      },
      delRange: {
        range: {
          location: delString.length,
          length: stringB.length - delString.length,
        },
        hasLineChange: true,
        newLineSymbol: delSymbol,
      },
    };
  }

  let delRange = { location: 0, length: delString.length };
  let addRange = { location: 0, length: addString.length };

  if (isInValidString(stringA) || isInValidString(stringB)) {
    addRange.length = 0;
    delRange.length = 0;

    return {
      addRange: { range: addRange },
      delRange: { range: delRange },
    };
  }

  const prefixLength = commonLength(delString, delRange, addString, addRange, false);

  delRange = {
    location: delRange.location + prefixLength,
    length: delRange.length - prefixLength,
  };
  addRange = {
    location: addRange.location + prefixLength,
    length: addRange.length - prefixLength,
  };

  const suffixLength = commonLength(delString, delRange, addString, addRange, true);

  delRange.length -= suffixLength;

  addRange.length -= suffixLength;

  return {
    addRange: {
      range: addRange,
      hasLineChange: addRange.length < addString.trim().length,
    },
    delRange: {
      range: delRange,
      hasLineChange: delRange.length < delString.trim().length,
    },
  };
}

export function diffChanges(addition: DiffLine, deletion: DiffLine): { addRange: DiffRange; delRange: DiffRange } {
  const { addString, addSymbol, delString, delSymbol } = checkNewLineSymbolChange(addition, deletion);

  if (isInValidString(addString) || isInValidString(delString)) {
    return {
      addRange: { range: [], hasLineChange: !!addSymbol, newLineSymbol: addSymbol },
      delRange: { range: [], hasLineChange: !!delSymbol, newLineSymbol: delSymbol },
    };
  }

  const diffRange = fastDiff(delString, addString, 0, true);

  let aStart = 0;
  let bStart = 0;

  const aRange = diffRange
    .filter((i) => i[0] === 1)
    .map((i) => ({ type: i[0], str: i[1], location: aStart, length: (aStart += i[1].length) }));

  const bRange = diffRange
    .filter((i) => i[0] === -1)
    .map((i) => ({ type: i[0], str: i[1], location: bStart, length: (bStart += i[1].length) }));

  return {
    addRange: { range: aRange, hasLineChange: aRange.length > 1 || !!addSymbol, newLineSymbol: addSymbol },
    delRange: { range: bRange, hasLineChange: bRange.length > 1 || !!delSymbol, newLineSymbol: delSymbol },
  };
}
