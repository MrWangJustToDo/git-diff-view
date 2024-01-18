/* eslint-disable max-lines */
import { relativeChanges } from "./change-range";
import { DiffLineType } from "./diff-line";
import { parseInstance } from "./diff-parse";
import { File } from "./file";
import { numIterator } from "./tool";

import type { DiffLine } from "./diff-line";
import type { IRawDiff } from "./raw-diff";

export const composeLen = 20;

interface DiffLineItem extends DiffLine {
  index: number;
}

interface DiffHunkItem extends DiffLineItem {
  isAppendLast: boolean;
  hunkInfo: {
    oldStartIndex: number;
    newStartIndex: number;
    oldLength: number;
    newLength: number;
  };
  splitInfo: {
    startHiddenIndex: number;
    endHiddenIndex: number;
    plainText: string;
    oldStartIndex: number;
    newStartIndex: number;
    oldLength: number;
    newLength: number;
  };
  unifiedInfo: {
    startHiddenIndex: number;
    endHiddenIndex: number;
    plainText: string;
    oldStartIndex: number;
    newStartIndex: number;
    oldLength: number;
    newLength: number;
  };
}


const getLang = (fileName: string) => {
  const dotIndex = fileName.lastIndexOf(".");
  const extension = fileName.slice(dotIndex + 1);
  return extension;
};

export class DiffFile {
  #oldFileResult?: File;

  #newFileResult?: File;

  #diffListResults?: IRawDiff[];

  #diffLines?: DiffLineItem[];

  #oldFileDiffLines?: Record<string, DiffLineItem>;

  #newFileDiffLines?: Record<string, DiffLineItem>;

  #oldFileLines?: File["rawFile"];

  #newFileLines?: File["rawFile"];

  #oldSyntaxLines?: File["syntaxFile"];

  #newSyntaxLines?: File["syntaxFile"];

  #splitLeftLines: {
    lineNumber?: number;
    value?: string;
    diff?: DiffLineItem;
    isHidden?: boolean;
  }[] = [];

  #splitRightLines: {
    lineNumber?: number;
    value?: string;
    diff?: DiffLineItem;
    isHidden?: boolean;
  }[] = [];

  #splitHunksLines?: Record<string, DiffHunkItem>;

  splitLastStartIndex?: number;

  #unifiedLines: {
    oldLineNumber?: number;
    newLineNumber?: number;
    value?: string;
    diff?: DiffLineItem;
    isHidden?: boolean;
  }[] = [];

  #unifiedHunksLines?: Record<string, DiffHunkItem>;

  unifiedLastStartIndex?: number;

  #listeners: (() => void)[] = [];

  hasHighlighted: boolean = false;

  #_hasInitRaw: boolean = false;

  #_hasInitSyntax: boolean = false;

  #_updateCount: number = 0;

  _oldFileContent: string = "";

  _newFileContent: string = "";

  lineLength: number = 0;

  unifiedLineLength: number = 0;

  constructor(
    readonly _oldFileName: string,
    _oldFileContent: string,
    readonly _newFileName: string,
    _newFileContent: string,
    readonly _diffList: string[]
  ) {
    let oldContent = _oldFileContent;
    let newContent = _newFileContent;
    Object.defineProperties(this, {
      _oldFileName: { get: () => _oldFileName },
      _newFileName: { get: () => _newFileName },
      _oldFileContent: {
        get: () => oldContent,
        set: (v: string) => (oldContent = v),
      },
      _newFileContent: {
        get: () => newContent,
        set: (v: string) => (newContent = v),
      },
      _diffList: { get: () => _diffList },
    });
    if (new Set(_diffList).size !== _diffList.length) {
      throw new Error("there are some duplicate diff string");
    }
    if (!oldContent && !newContent) {
      console.error('should pass "oldFileContent" or "newFileContent" to make the diff work!');
    }
  }

  #doDiff() {
    if (!this._diffList) return;

    this.#diffListResults = this._diffList.map((s) => parseInstance.parse(s));
  }

  #doFile() {
    if (!this._oldFileContent && !this._newFileContent) return;

    if (this._oldFileContent) {
      this.#oldFileResult = new File(this._oldFileContent);
    }

    if (this._newFileContent) {
      this.#newFileResult = new File(this._newFileContent);
    }
  }

  #composeRaw() {
    this.#oldFileResult?.doRaw();

    this.#oldFileLines = this.#oldFileResult?.rawFile;

    this.#newFileResult?.doRaw();

    this.#newFileLines = this.#newFileResult?.rawFile;
  }

  #composeFile() {
    if (!this._oldFileContent && !this._newFileContent) return;
    if (this._oldFileContent && this._newFileContent) return;

    if (this.#oldFileResult) {
      let newLineNumber = 1;
      let oldLineNumber = 1;
      let newFileContent = "";
      while (oldLineNumber < this.#oldFileResult.maxLineNumber) {
        const newDiffLine = this.#getNewDiffLine(newLineNumber++);
        if (newDiffLine) {
          newFileContent += newDiffLine.text;
          oldLineNumber = newDiffLine.oldLineNumber ? newDiffLine.oldLineNumber + 1 : oldLineNumber;
        } else {
          newFileContent += this.#getOldRawLine(oldLineNumber++);
        }
      }
      if (newFileContent === this._oldFileContent) return;
      this._newFileContent = newFileContent;
      this.#newFileResult = new File(this._newFileContent);
      this.#newFileResult?.doRaw();
      this.#newFileLines = this.#newFileResult?.rawFile;
      return;
    }
    if (this.#newFileResult) {
      let oldLineNumber = 1;
      let newLineNumber = 1;
      let oldFileContent = "";
      while (newLineNumber < this.#newFileResult.maxLineNumber) {
        const oldDiffLine = this.#getOldDiffLine(oldLineNumber++);
        if (oldDiffLine) {
          oldFileContent += oldDiffLine.text;
          newLineNumber = oldDiffLine.newLineNumber ? oldDiffLine.newLineNumber + 1 : newLineNumber;
        } else {
          oldFileContent += this.#getNewRawLine(newLineNumber++);
        }
      }
      if (oldFileContent === this._newFileContent) return;
      this._oldFileContent = oldFileContent;
      this.#oldFileResult = new File(this._oldFileContent);
      this.#oldFileResult?.doRaw();
      this.#oldFileLines = this.#oldFileResult?.rawFile;
      return;
    }
  }

  #composeDiff() {
    if (!this.#diffListResults?.length) return;

    this.#diffListResults.forEach((item) => {
      const hunks = item.hunks;
      hunks.forEach((hunk) => {
        let additions: DiffLine[] = [];
        let deletions: DiffLine[] = [];
        hunk.lines.forEach((line) => {
          if (line.type === DiffLineType.Add) {
            additions.push(line);
          } else if (line.type === DiffLineType.Delete) {
            deletions.push(line);
          } else {
            if (additions.length === deletions.length) {
              const len = additions.length;
              for (let i = 0; i < len; i++) {
                const addition = additions[i];
                const deletion = deletions[i];
                const { stringARange, stringBRange } = relativeChanges(addition.text, deletion.text);
                addition.needRematch = true;
                addition.range = stringARange;
                deletion.needRematch = true;
                deletion.range = stringBRange;
              }
            }
            additions = [];
            deletions = [];
          }
        });
      });
    });

    this.#diffLines = this.#diffListResults
      .reduce<DiffLine[]>((p, c) => p.concat(...c.hunks.reduce<DiffLine[]>((_p, _c) => _p.concat(..._c.lines), [])), [])
      .map<DiffLineItem>((i, index) => {
        const typedI = i as DiffLineItem;
        typedI.index = index;
        if (typedI.type === DiffLineType.Hunk) {
          const numInfo = typedI.text.split("@@")?.[1].split(" ").filter(Boolean);
          const oldNumInfo = numInfo?.[0] || "";
          const newNumInfo = numInfo?.[1] || "";
          const [oldNumStartIndex, oldNumLength] = oldNumInfo.split(",");
          const [newNumStartIndex, newNumLength] = newNumInfo.split(",");
          const typedTypeI = typedI as DiffHunkItem;
          typedTypeI.hunkInfo = {
            oldStartIndex: -Number(oldNumStartIndex),
            oldLength: Number(oldNumLength),
            newStartIndex: +Number(newNumStartIndex),
            newLength: Number(newNumLength),
          };
        }
        return typedI;
      });

    this.#oldFileDiffLines = this.#diffLines.reduce((p, c) => {
      if (c.oldLineNumber) {
        return { ...p, [c.oldLineNumber]: c };
      } else {
        return p;
      }
    }, {});

    this.#newFileDiffLines = this.#diffLines.reduce((p, c) => {
      if (c.newLineNumber) {
        return { ...p, [c.newLineNumber]: c };
      } else {
        return p;
      }
    }, {});
  }

  #composeSyntax(oldLang: string, newLang: string) {
    this.#oldFileResult?.doSyntax(oldLang);

    this.#oldSyntaxLines = this.#oldFileResult?.syntaxFile;

    this.#newFileResult?.doSyntax(newLang);

    this.#newSyntaxLines = this.#newFileResult?.syntaxFile;
  }

  #getOldDiffLine(lineNumber: number | null) {
    if (!lineNumber) return;
    return this.#oldFileDiffLines?.[lineNumber];
  }

  #getNewDiffLine(lineNumber: number | null) {
    if (!lineNumber) return;
    return this.#newFileDiffLines?.[lineNumber];
  }

  #getOldRawLine(lineNumber: number) {
    return this.#oldFileLines?.[lineNumber];
  }

  #getNewRawLine(lineNumber: number) {
    return this.#newFileLines?.[lineNumber];
  }

  initRaw() {
    if (this.#_hasInitRaw) return;
    this.#doDiff();
    this.#composeDiff();
    this.#doFile();
    this.#composeRaw();
    this.#composeFile();
    this.#_hasInitRaw = true;
  }

  initSyntax() {
    if (this.#_hasInitSyntax) return;
    const oldFileLang = getLang(this._oldFileName);
    const newFileLang = getLang(this._newFileName);
    const lang = oldFileLang || newFileLang || "txt";
    this.#composeSyntax(oldFileLang || lang, newFileLang || lang);
    this.#_hasInitSyntax = true;
    this.hasHighlighted = true;
  }

  init() {
    this.initRaw();
    this.initSyntax();
  }

  buildSplitDiffLines = () => {
    this.lineLength = Math.max(this.lineLength, this.#oldFileResult?.rawLength || 0, this.#newFileResult?.rawLength || 0);
    let oldFileLineNumber = 1;
    let newFileLineNumber = 1;
    let prevIsHidden = false;
    let hideStart = Infinity;
    numIterator(this.lineLength, () => {
      const oldRawLine = this.#getOldRawLine(oldFileLineNumber);
      const oldDiffLine = this.#getOldDiffLine(oldFileLineNumber);
      const newRawLine = this.#getNewRawLine(newFileLineNumber);
      const newDiffLine = this.#getNewDiffLine(newFileLineNumber);
      const oldLineHasChange = oldDiffLine?.isIncludeableLine();
      const newLineHasChange = newDiffLine?.isIncludeableLine();
      const len = this.#splitRightLines.length;
      const isHidden = !oldDiffLine && !newDiffLine;
      if (!oldDiffLine && !newRawLine && !oldDiffLine && !newDiffLine) return;
      if ((oldLineHasChange && newLineHasChange) || (!oldLineHasChange && !newLineHasChange)) {
        this.#splitLeftLines.push({
          lineNumber: oldFileLineNumber++,
          value: oldRawLine,
          diff: oldDiffLine,
          isHidden,
        });
        this.#splitRightLines.push({
          lineNumber: newFileLineNumber++,
          value: newRawLine,
          diff: newDiffLine,
          isHidden,
        });
      } else if (oldLineHasChange) {
        this.#splitLeftLines.push({
          lineNumber: oldFileLineNumber++,
          value: oldRawLine,
          diff: oldDiffLine,
        });
        this.#splitRightLines.push({});
      } else if (newLineHasChange) {
        this.#splitLeftLines.push({});
        this.#splitRightLines.push({
          lineNumber: newFileLineNumber++,
          value: newRawLine,
          diff: newDiffLine,
        });
      }

      if (!prevIsHidden && isHidden) {
        hideStart = len;
      }

      prevIsHidden = isHidden;

      if (oldDiffLine && newDiffLine && !oldLineHasChange && !newLineHasChange) {
        const current = newDiffLine as DiffLineItem;
        const previous = newDiffLine.index ? this.#diffLines?.[current.index - 1] : undefined;
        if (previous && previous.type === DiffLineType.Hunk) {
          const typedPrevious = previous as DiffHunkItem;
          if (Number.isFinite(hideStart)) {
            typedPrevious.splitInfo = {
              ...typedPrevious.hunkInfo,
              startHiddenIndex: hideStart,
              endHiddenIndex: len,
              plainText: typedPrevious.text,
            };
            hideStart = Infinity;
          }
          this.#splitHunksLines = {
            ...this.#splitHunksLines,
            [len]: previous,
          };
        }
      }
    });

    this.splitLastStartIndex = hideStart;

    this.notifyAll();
  };

  buildUnifiedDiffLines = () => {
    if (!this.lineLength) return;
    let oldFileLineNumber = 1;
    let newFileLineNumber = 1;
    let prevIsHidden = false;
    let hideStart = Infinity;
    const maxOldFileLineNumber = this.#oldFileResult?.maxLineNumber || 0;
    const maxNewFileLineNumber = this.#newFileResult?.maxLineNumber || 0;
    while (oldFileLineNumber < maxOldFileLineNumber || newFileLineNumber < maxNewFileLineNumber) {
      const oldRawLine = this.#getOldRawLine(oldFileLineNumber);
      const oldDiffLine = this.#getOldDiffLine(oldFileLineNumber);
      const newRawLine = this.#getNewRawLine(newFileLineNumber);
      const newDiffLine = this.#getNewDiffLine(newFileLineNumber);
      const oldLineHasChange = oldDiffLine?.isIncludeableLine();
      const newLineHasChange = newDiffLine?.isIncludeableLine();
      const len = this.#unifiedLines.length;
      const isHidden = !oldDiffLine && !newDiffLine;
      if (!oldRawLine && !newRawLine && !newDiffLine && !oldDiffLine) break;
      if (!oldLineHasChange && !newLineHasChange) {
        this.#unifiedLines.push({
          oldLineNumber: oldFileLineNumber++,
          newLineNumber: newFileLineNumber++,
          value: newRawLine,
          diff: newDiffLine,
          isHidden,
        });
      } else if (oldLineHasChange) {
        this.#unifiedLines.push({
          oldLineNumber: oldFileLineNumber++,
          value: oldRawLine,
          diff: oldDiffLine,
        });
      } else if (newLineHasChange) {
        this.#unifiedLines.push({
          newLineNumber: newFileLineNumber++,
          value: newRawLine,
          diff: newDiffLine,
        });
      }

      if (!prevIsHidden && isHidden) {
        hideStart = len;
      }

      prevIsHidden = isHidden;

      if (oldDiffLine && newDiffLine && !oldLineHasChange && !newLineHasChange) {
        const current = newDiffLine as DiffLineItem;
        const previous = current.index ? this.#diffLines?.[current.index - 1] : undefined;
        if (previous && previous.type === DiffLineType.Hunk) {
          const typedPrevious = previous as DiffHunkItem;
          if (Number.isFinite(hideStart)) {
            typedPrevious.unifiedInfo = {
              ...typedPrevious.hunkInfo,
              startHiddenIndex: hideStart,
              endHiddenIndex: len,
              plainText: typedPrevious.text,
            };
            hideStart = Infinity;
          }
          this.#unifiedHunksLines = {
            ...this.#unifiedHunksLines,
            [len]: previous,
          };
        }
      }
    }
    this.unifiedLineLength = this.#unifiedLines.length;

    this.unifiedLastStartIndex = hideStart;

    this.notifyAll();
  };

  getSplitLeftLine = (index: number) => {
    return this.#splitLeftLines[index];
  };

  getSplitRightLine = (index: number) => {
    return this.#splitRightLines[index];
  };

  getSplitHunkLine = (index: number) => {
    return this.#splitHunksLines?.[index];
  };

  onSplitHunkExpand = (dir: "up" | "down" | "all", index: number) => {
    const current = this.#splitHunksLines?.[index];
    if (!current) return;

    if (dir === "all") {
      for (let i = current.splitInfo.startHiddenIndex; i < current.splitInfo.endHiddenIndex; i++) {
        const leftLine = this.#splitLeftLines[i];
        const rightLine = this.#splitRightLines[i];
        if (leftLine?.isHidden) leftLine.isHidden = false;
        if (rightLine?.isHidden) rightLine.isHidden = false;
      }
      current.splitInfo.plainText = current.text;
      current.splitInfo = {
        ...current.splitInfo,
        ...current.hunkInfo,
        plainText: current.text,
        startHiddenIndex: current.splitInfo.endHiddenIndex,
      };
    } else if (dir === "down") {
      for (let i = current.splitInfo.startHiddenIndex; i < current.splitInfo.startHiddenIndex + composeLen; i++) {
        const leftLine = this.#splitLeftLines[i];
        const rightLine = this.#splitRightLines[i];
        if (leftLine?.isHidden) leftLine.isHidden = false;
        if (rightLine?.isHidden) rightLine.isHidden = false;
      }
      current.splitInfo = {
        ...current.splitInfo,
        startHiddenIndex: current.splitInfo.startHiddenIndex + composeLen,
        plainText: `@@ -${current.splitInfo.oldStartIndex},${current.splitInfo.oldLength} +${current.splitInfo.newStartIndex},${current.splitInfo.newLength}`,
      };
    } else {
      for (let i = current.splitInfo.endHiddenIndex - composeLen; i < current.splitInfo.endHiddenIndex; i++) {
        const leftLine = this.#splitLeftLines[i];
        const rightLine = this.#splitRightLines[i];
        if (leftLine?.isHidden) leftLine.isHidden = false;
        if (rightLine?.isHidden) rightLine.isHidden = false;
      }
      const oldStartIndex = current.splitInfo.oldStartIndex - composeLen;
      const oldLength = current.splitInfo.oldLength + composeLen;
      const newStartIndex = current.splitInfo.newStartIndex - composeLen;
      const newLength = current.splitInfo.newLength + composeLen;
      current.splitInfo = {
        ...current.splitInfo,
        endHiddenIndex: current.splitInfo.endHiddenIndex - composeLen,
        oldStartIndex,
        oldLength,
        newStartIndex,
        newLength,
        plainText: `@@ -${oldStartIndex},${oldLength} +${newStartIndex},${newLength}`,
      };

      delete this.#splitHunksLines?.[index];

      this.#splitHunksLines![current.splitInfo.endHiddenIndex] = current;
    }

    this.notifyAll();
  };

  onSplitLastExpand = () => {
    if (!this.splitLastStartIndex || !Number.isFinite(this.splitLastStartIndex)) return;

    for (let i = this.splitLastStartIndex; i < this.splitLastStartIndex + composeLen; i++) {
      const leftLine = this.#splitLeftLines[i];
      const rightLine = this.#splitRightLines[i];
      if (leftLine?.isHidden) leftLine.isHidden = false;
      if (rightLine?.isHidden) rightLine.isHidden = false;
    }

    this.splitLastStartIndex += composeLen;

    this.splitLastStartIndex = this.splitLastStartIndex >= this.lineLength ? Infinity : this.splitLastStartIndex;

    this.notifyAll();
  };

  getUnifiedLine = (index: number) => {
    return this.#unifiedLines[index];
  };

  getUnifiedHunkLine = (index: number) => {
    return this.#unifiedHunksLines?.[index];
  };

  onUnifiedHunkExpand = (dir: "up" | "down" | "all", index: number) => {
    const current = this.#unifiedHunksLines?.[index];
    if (!current) return;

    if (dir === "all") {
      for (let i = current.unifiedInfo.startHiddenIndex; i < current.unifiedInfo.endHiddenIndex; i++) {
        const unifiedLine = this.#unifiedLines?.[i];
        if (unifiedLine?.isHidden) {
          unifiedLine.isHidden = false;
        }
      }
      current.unifiedInfo.plainText = current.text;
      current.unifiedInfo = {
        ...current.unifiedInfo,
        ...current.hunkInfo,
        plainText: current.text,
        startHiddenIndex: current.unifiedInfo.endHiddenIndex,
      };
    } else if (dir === "down") {
      for (let i = current.unifiedInfo.startHiddenIndex; i < current.unifiedInfo.startHiddenIndex + composeLen; i++) {
        const unifiedLine = this.#unifiedLines[i];
        if (unifiedLine?.isHidden) unifiedLine.isHidden = false;
      }
      current.unifiedInfo = {
        ...current.unifiedInfo,
        startHiddenIndex: current.unifiedInfo.startHiddenIndex + composeLen,
        plainText: `@@ -${current.unifiedInfo.oldStartIndex},${current.unifiedInfo.oldLength} +${current.unifiedInfo.newStartIndex},${current.unifiedInfo.newLength}`,
      };
    } else {
      for (let i = current.unifiedInfo.endHiddenIndex - composeLen; i < current.unifiedInfo.endHiddenIndex; i++) {
        const unifiedLine = this.#unifiedLines[i];
        if (unifiedLine?.isHidden) unifiedLine.isHidden = false;
      }
      const oldStartIndex = current.unifiedInfo.oldStartIndex - composeLen;
      const oldLength = current.unifiedInfo.oldLength + composeLen;
      const newStartIndex = current.unifiedInfo.newStartIndex - composeLen;
      const newLength = current.unifiedInfo.newLength + composeLen;
      current.unifiedInfo = {
        ...current.unifiedInfo,
        endHiddenIndex: current.unifiedInfo.endHiddenIndex - composeLen,
        oldStartIndex,
        oldLength,
        newStartIndex,
        newLength,
        plainText: `@@ -${oldStartIndex},${oldLength} +${newStartIndex},${newLength}`,
      };

      delete this.#unifiedHunksLines?.[index];

      this.#unifiedHunksLines![current.unifiedInfo.endHiddenIndex] = current;
    }

    this.notifyAll();
  };

  onUnifiedLastExpand = () => {
    if (!this.unifiedLastStartIndex || !Number.isFinite(this.unifiedLastStartIndex)) return;

    for (let i = this.unifiedLastStartIndex; i < this.unifiedLastStartIndex + composeLen; i++) {
      const unifiedLine = this.#unifiedLines[i];
      if (unifiedLine?.isHidden) unifiedLine.isHidden = false;
    }

    this.unifiedLastStartIndex += composeLen;

    this.unifiedLastStartIndex = this.unifiedLastStartIndex >= this.unifiedLineLength ? Infinity : this.unifiedLastStartIndex;

    this.notifyAll();
  };

  getOldSyntaxLine = (lineNumber: number) => {
    return this.#oldSyntaxLines?.[lineNumber];
  };

  getNewSyntaxLine = (lineNumber: number) => {
    return this.#newSyntaxLines?.[lineNumber];
  };

  subscribe = (listener: () => void) => {
    this.#listeners.push(listener);

    return () => {
      this.#listeners.filter((i) => i !== listener);
    };
  };

  notifyAll = () => {
    this.#_updateCount++;
    this.#listeners.forEach((f) => f());
  };

  getUpdateCount = () => this.#_updateCount;
}
