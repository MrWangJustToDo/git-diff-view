/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable max-lines */
import { relativeChanges } from "./change-range";
import { DiffLineType } from "./diff-line";
import { parseInstance } from "./diff-parse";
import { getFile } from "./file";

import type { DiffLine } from "./diff-line";
import type { File } from "./file";
import type { IRawDiff } from "./raw-diff";

export const composeLen = 20;

const idSet = new Set<string>();

export interface SplitLineItem {
  lineNumber?: number;
  value?: string;
  diff?: DiffLineItem;
  isHidden?: boolean;
}

export interface UnifiedLineItem {
  oldLineNumber?: number;
  newLineNumber?: number;
  value?: string;
  diff?: DiffLineItem;
  isHidden?: boolean;
}

export interface DiffLineItem extends DiffLine {
  index: number;
}

export interface DiffHunkItem extends DiffLineItem {
  isAppendLast: boolean;
  hunkInfo: {
    oldStartIndex: number;
    newStartIndex: number;
    oldLength: number;
    newLength: number;
  };
  splitInfo?: {
    startHiddenIndex: number;
    endHiddenIndex: number;
    plainText: string;
    oldStartIndex: number;
    newStartIndex: number;
    oldLength: number;
    newLength: number;
  };
  unifiedInfo?: {
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

  #oldFileSyntaxLines?: File["syntaxFile"];

  #newFileSyntaxLines?: File["syntaxFile"];

  #splitLeftLines: SplitLineItem[] = [];

  #splitRightLines: SplitLineItem[] = [];

  #splitHunksLines?: Record<string, DiffHunkItem>;

  #splitLastStartIndex?: number;

  #unifiedLines: UnifiedLineItem[] = [];

  #unifiedHunksLines?: Record<string, DiffHunkItem>;

  #unifiedLastStartIndex?: number;

  #listeners: (() => void)[] = [];

  #hasInitRaw: boolean = false;

  #hasInitSyntax: boolean = false;

  #hasBuildSplit: boolean = false;

  #hasBuildUnified: boolean = false;

  #updateCount: number = 0;

  #composeByDiff: boolean = false;

  _oldFileContent: string = "";

  _oldFileLang: string = "";

  _newFileContent: string = "";

  _newFileLang: string = "";

  diffLineLength: number = 0;

  splitLineLength: number = 0;

  unifiedLineLength: number = 0;

  #id: string = "";

  static createInstance(
    data: {
      oldFile?: { fileName?: string | null; fileLang?: string | null; content?: string | null };
      newFile?: { fileName?: string | null; fileLang?: string | null; content?: string | null };
      hunks?: string[];
    },
    bundle?: ReturnType<DiffFile["getBundle"]>
  ) {
    const instance = new DiffFile(
      data?.oldFile?.fileName || "",
      data?.oldFile?.content || "",
      data?.newFile?.fileName || "",
      data?.newFile?.content || "",
      data?.hunks || [],
      data?.oldFile?.fileLang || "",
      data?.newFile?.fileLang || ""
    );
    if (bundle) {
      instance.mergeBundle(bundle);
    }

    return instance;
  }

  constructor(
    readonly _oldFileName: string,
    _oldFileContent: string,
    readonly _newFileName: string,
    _newFileContent: string,
    readonly _diffList: string[],
    _oldFileLang?: string,
    _newFileLang?: string
  ) {
    Object.defineProperty(this, "__v_skip", { value: true });
    let oldContent = _oldFileContent;
    let newContent = _newFileContent;
    const diffList = Array.from(new Set(_diffList));
    Object.defineProperties(this, {
      _oldFileName: { get: () => _oldFileName },
      _newFileName: { get: () => _newFileName },
      _oldFileLang: { get: () => getLang(_oldFileLang || _oldFileName || _newFileLang || _newFileName) || "txt" },
      _newFileLang: { get: () => getLang(_newFileLang || _newFileName || _oldFileLang || _oldFileName) || "txt" },
      _oldFileContent: {
        get: () => oldContent,
        set: (v: string) => (oldContent = v),
      },
      _newFileContent: {
        get: () => newContent,
        set: (v: string) => (newContent = v),
      },
      _diffList: { get: () => diffList },
    });

    this.initId();
  }

  #doDiff() {
    if (!this._diffList) return;

    this.#diffListResults = this._diffList.map((s) => parseInstance.parse(s));
  }

  #doFile() {
    if (!this._oldFileContent && !this._newFileContent) return;

    if (this._oldFileContent) {
      this.#oldFileResult = getFile(this._oldFileContent, this._oldFileLang);
    }

    if (this._newFileContent) {
      this.#newFileResult = getFile(this._newFileContent, this._newFileLang);
    }
  }

  #composeRaw() {
    this.#oldFileResult?.doRaw();

    this.#oldFileLines = this.#oldFileResult?.rawFile;

    this.#newFileResult?.doRaw();

    this.#newFileLines = this.#newFileResult?.rawFile;
  }

  #composeFile() {
    if (this._oldFileContent && this._newFileContent) return;

    // all of the file content not exist, try to use diff result to compose
    if (!this._oldFileContent && !this._newFileContent) {
      let newLineNumber = 1;
      let oldLineNumber = 1;
      let oldFileContent = "";
      let newFileContent = "";
      while (oldLineNumber <= this.diffLineLength) {
        const diffLine = this.#getOldDiffLine(oldLineNumber++);
        if (diffLine) {
          oldFileContent += diffLine.text;
        } else {
          // empty line for placeholder
          oldFileContent += "\n";
        }
      }
      while (newLineNumber <= this.diffLineLength) {
        const diffLine = this.#getNewDiffLine(newLineNumber++);
        if (diffLine) {
          newFileContent += diffLine.text;
        } else {
          // empty line for placeholder
          newFileContent += "\n";
        }
      }
      if (oldFileContent === newFileContent) return;
      this._oldFileContent = oldFileContent;
      this._newFileContent = newFileContent;
      this.#oldFileResult = getFile(this._oldFileContent, this._oldFileLang);
      this.#newFileResult = getFile(this._newFileContent, this._newFileLang);
      // all of the file just compose by diff, so we can not do the expand action
      this.#composeByDiff = true;
    } else if (this.#oldFileResult) {
      let newLineNumber = 1;
      let oldLineNumber = 1;
      let newFileContent = "";
      while (oldLineNumber <= this.#oldFileResult.maxLineNumber) {
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
      this.#newFileResult = getFile(this._newFileContent, this._newFileLang);
    } else if (this.#newFileResult) {
      let oldLineNumber = 1;
      let newLineNumber = 1;
      let oldFileContent = "";
      while (newLineNumber <= this.#newFileResult.maxLineNumber) {
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
      this.#oldFileResult = getFile(this._oldFileContent, this._oldFileLang);
    }

    this.#composeRaw();
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
        this.diffLineLength = Math.max(this.diffLineLength, c.oldLineNumber);
        return { ...p, [c.oldLineNumber]: c };
      } else {
        return p;
      }
    }, {});

    this.#newFileDiffLines = this.#diffLines.reduce((p, c) => {
      if (c.newLineNumber) {
        this.diffLineLength = Math.max(this.diffLineLength, c.newLineNumber);
        return { ...p, [c.newLineNumber]: c };
      } else {
        return p;
      }
    }, {});
  }

  #composeSyntax() {
    this.#oldFileResult?.doSyntax();

    this.#oldFileSyntaxLines = this.#oldFileResult?.syntaxFile;

    this.#newFileResult?.doSyntax();

    this.#newFileSyntaxLines = this.#newFileResult?.syntaxFile;
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

  initId() {
    let id = "--" + Math.random().toString().slice(2);

    while (idSet.has(id)) {
      id = "--" + Math.random().toString().slice(2);
    }

    idSet.add(id);

    this.#id = id;
  }

  getId() {
    return this.#id;
  }

  clearId() {
    idSet.delete(this.#id);
  }

  initRaw() {
    if (this.#hasInitRaw) return;
    this.#doDiff();
    this.#composeDiff();
    this.#doFile();
    this.#composeRaw();
    this.#composeFile();
    this.#hasInitRaw = true;
  }

  initSyntax() {
    if (this.#hasInitSyntax) return;
    this.#composeSyntax();
    this.#hasInitSyntax = true;
  }

  init() {
    this.initRaw();
    this.initSyntax();
  }

  buildSplitDiffLines() {
    if (this.#hasBuildSplit) return;
    let oldFileLineNumber = 1;
    let newFileLineNumber = 1;
    let prevIsHidden = false;
    let hideStart = Infinity;
    const maxOldFileLineNumber = this.#oldFileResult?.maxLineNumber || 0;
    const maxNewFileLineNumber = this.#newFileResult?.maxLineNumber || 0;

    while (oldFileLineNumber <= maxOldFileLineNumber || newFileLineNumber <= maxNewFileLineNumber) {
      const oldRawLine = this.#getOldRawLine(oldFileLineNumber);
      const oldDiffLine = this.#getOldDiffLine(oldFileLineNumber);
      const newRawLine = this.#getNewRawLine(newFileLineNumber);
      const newDiffLine = this.#getNewDiffLine(newFileLineNumber);
      const oldLineHasChange = oldDiffLine?.isIncludeableLine();
      const newLineHasChange = newDiffLine?.isIncludeableLine();
      const len = this.#splitRightLines.length;
      const isHidden = !oldDiffLine && !newDiffLine;
      if (!oldDiffLine && !newRawLine && !oldDiffLine && !newDiffLine) break;
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
    }

    this.splitLineLength = this.#splitRightLines.length;

    this.#splitLastStartIndex = hideStart;

    this.#hasBuildSplit = true;

    this.notifyAll();
  }

  buildUnifiedDiffLines() {
    if (this.#hasBuildUnified) return;
    let oldFileLineNumber = 1;
    let newFileLineNumber = 1;
    let prevIsHidden = false;
    let hideStart = Infinity;
    const maxOldFileLineNumber = this.#oldFileResult?.maxLineNumber || 0;
    const maxNewFileLineNumber = this.#newFileResult?.maxLineNumber || 0;

    while (oldFileLineNumber <= maxOldFileLineNumber || newFileLineNumber <= maxNewFileLineNumber) {
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

    this.#unifiedLastStartIndex = hideStart;

    this.#hasBuildUnified = true;

    this.notifyAll();
  }

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

  onSplitLastExpand = (expandAll?: boolean) => {
    if (!this.#splitLastStartIndex || !Number.isFinite(this.#splitLastStartIndex)) return;

    const start = this.#splitLastStartIndex;

    const end = expandAll ? this.splitLineLength : this.#splitLastStartIndex + composeLen;

    for (let i = start; i < end; i++) {
      const leftLine = this.#splitLeftLines[i];
      const rightLine = this.#splitRightLines[i];
      if (leftLine?.isHidden) leftLine.isHidden = false;
      if (rightLine?.isHidden) rightLine.isHidden = false;
    }

    this.#splitLastStartIndex = end;

    this.#splitLastStartIndex = this.#splitLastStartIndex >= this.splitLineLength ? Infinity : this.#splitLastStartIndex;

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

  onUnifiedLastExpand = (expandAll?: boolean) => {
    if (!this.#unifiedLastStartIndex || !Number.isFinite(this.#unifiedLastStartIndex)) return;

    const start = this.#unifiedLastStartIndex;

    const end = expandAll ? this.unifiedLineLength : this.#unifiedLastStartIndex + composeLen;

    for (let i = start; i < end; i++) {
      const unifiedLine = this.#unifiedLines[i];
      if (unifiedLine?.isHidden) unifiedLine.isHidden = false;
    }

    this.#unifiedLastStartIndex = end;

    this.#unifiedLastStartIndex =
      this.#unifiedLastStartIndex >= this.unifiedLineLength ? Infinity : this.#unifiedLastStartIndex;

    this.notifyAll();
  };

  getOldSyntaxLine = (lineNumber: number) => {
    return this.#oldFileSyntaxLines?.[lineNumber];
  };

  getNewSyntaxLine = (lineNumber: number) => {
    return this.#newFileSyntaxLines?.[lineNumber];
  };

  subscribe = (listener: () => void) => {
    this.#listeners.push(listener);

    return () => {
      this.#listeners.filter((i) => i !== listener);
    };
  };

  notifyAll = () => {
    this.#updateCount++;
    this.#listeners.forEach((f) => f());
  };

  getUpdateCount = () => this.#updateCount;

  getNeedShowExpandAll = (mode: "split" | "unified") => {
    if (mode === "split") {
      return this.#splitLastStartIndex && Number.isFinite(this.#splitLastStartIndex);
    } else {
      return this.#unifiedLastStartIndex && Number.isFinite(this.#unifiedLastStartIndex);
    }
  };

  getExpandEnabled = () => !this.#composeByDiff;

  getBundle = () => {
    // common
    const oldFileLines = this.#oldFileLines;
    const oldFileDiffLines = this.#oldFileDiffLines;
    const oldFileSyntaxLines = this.#oldFileSyntaxLines;
    const newFileLines = this.#newFileLines;
    const newFileDiffLines = this.#newFileDiffLines;
    const newFileSyntaxLines = this.#newFileSyntaxLines;
    const splitLineLength = this.splitLineLength;
    const unifiedLineLength = this.unifiedLineLength;
    const composeByDiff = this.#composeByDiff;

    // split
    const splitLeftLines = this.#splitLeftLines;
    const splitRightLines = this.#splitRightLines;
    const splitHunkLines = this.#splitHunksLines;
    const splitLastStartIndex = this.#splitLastStartIndex;

    // unified
    const unifiedLines = this.#unifiedLines;
    const unifiedHunkLines = this.#unifiedHunksLines;
    const unifiedLastStartIndex = this.#unifiedLastStartIndex;

    return {
      oldFileLines,
      oldFileDiffLines,
      oldFileSyntaxLines,
      newFileLines,
      newFileDiffLines,
      newFileSyntaxLines,
      splitLineLength,
      unifiedLineLength,
      splitLeftLines,
      splitRightLines,
      splitHunkLines,
      splitLastStartIndex,
      unifiedLines,
      unifiedHunkLines,
      unifiedLastStartIndex,

      composeByDiff,
    };
  };

  mergeBundle = (data: ReturnType<DiffFile["getBundle"]>) => {
    this.#hasInitRaw = true;
    this.#hasInitSyntax = true;
    this.#hasBuildSplit = true;
    this.#hasBuildUnified = true;
    this.#composeByDiff = data.composeByDiff;

    this.#oldFileLines = data.oldFileLines;
    this.#oldFileDiffLines = data.oldFileDiffLines;
    this.#oldFileSyntaxLines = data.oldFileSyntaxLines;
    this.#newFileLines = data.newFileLines;
    this.#newFileDiffLines = data.newFileDiffLines;
    this.#newFileSyntaxLines = data.newFileSyntaxLines;
    this.splitLineLength = data.splitLineLength;
    this.unifiedLineLength = data.unifiedLineLength;

    this.#splitLeftLines = data.splitLeftLines;
    this.#splitRightLines = data.splitRightLines;
    this.#splitHunksLines = data.splitHunkLines;
    this.#splitLastStartIndex = data.splitLastStartIndex;

    this.#unifiedLines = data.unifiedLines;
    this.#unifiedHunksLines = data.unifiedHunkLines;
    this.#unifiedLastStartIndex = data.unifiedLastStartIndex;

    this.notifyAll();
  };
}
