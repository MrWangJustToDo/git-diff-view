export interface IRange {
  /** The starting location for the range. */
  readonly location: number;

  /** The length of the range. */
  readonly length: number;
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

/** Get the changed ranges in the strings, relative to each other. */
export function relativeChanges(stringA: string, stringB: string): { stringARange: IRange; stringBRange: IRange } {
  let bRange = { location: 0, length: stringB.length };
  let aRange = { location: 0, length: stringA.length };

  const _stringA = stringA.trimEnd();

  const _stringB = stringB.trimEnd();

  if (_stringA === _stringB) {
    return {
      stringARange: { location: _stringA.length, length: stringA.length - _stringA.length },
      stringBRange: { location: _stringB.length, length: stringB.length - _stringB.length },
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
