/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable max-lines */
import { DiffLineType, DiffLine } from "./diff-line";
import { parseInstance } from "./diff-parse";
import { getFile } from "./file";
import { getDiffRange, getLang } from "./tool";

import type { File } from "./file";
import type { highlighter } from "./highlighter";
import type { IRawDiff } from "./raw-diff";

export const composeLen = 40;

const idSet = new Set<string>();

export interface SplitLineItem {
  lineNumber?: number;
  value?: string;
  diff?: DiffLineItem;
  isHidden?: boolean;
  _isHidden?: boolean;
}

export interface UnifiedLineItem {
  oldLineNumber?: number;
  newLineNumber?: number;
  value?: string;
  diff?: DiffLineItem;
  isHidden?: boolean;
  _isHidden?: boolean;
}

type HunkInfo = {
  oldStartIndex: number;
  newStartIndex: number;
  oldLength: number;
  newLength: number;
  _oldStartIndex: number;
  _newStartIndex: number;
  _oldLength: number;
  _newLength: number;
};

type HunkLineInfo = {
  startHiddenIndex: number;
  endHiddenIndex: number;
  plainText: string;
  _startHiddenIndex: number;
  _endHiddenIndex: number;
  _plainText: string;
};

export interface DiffLineItem extends DiffLine {
  index: number;
}

export interface DiffHunkItem extends DiffLineItem {
  isLast: boolean;
  hunkInfo: HunkInfo;
  splitInfo?: HunkLineInfo & HunkInfo;
  unifiedInfo?: HunkLineInfo & HunkInfo;
}

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

  #unifiedLines: UnifiedLineItem[] = [];

  #unifiedHunksLines?: Record<string, DiffHunkItem>;

  #listeners: ((() => void) & { isSyncExternal?: boolean })[] = [];

  #hasInitRaw: boolean = false;

  #hasInitSyntax: boolean = false;

  #hasBuildSplit: boolean = false;

  #hasBuildUnified: boolean = false;

  #updateCount: number = 0;

  #composeByDiff: boolean = false;

  _version_ = __VERSION__;

  _oldFileContent: string = "";

  _oldFileLang: string = "";

  _newFileContent: string = "";

  _newFileLang: string = "";

  diffLineLength: number = 0;

  splitLineLength: number = 0;

  unifiedLineLength: number = 0;

  #id: string = "";

  #clonedInstance = new Map<DiffFile, () => void>();

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
      this.#oldFileResult = getFile(this._oldFileContent, this._oldFileLang, this._oldFileName);
    }

    if (this._newFileContent) {
      this.#newFileResult = getFile(this._newFileContent, this._newFileLang, this._newFileName);
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
      this.#oldFileResult = getFile(this._oldFileContent, this._oldFileLang, this._oldFileName);
      this.#newFileResult = getFile(this._newFileContent, this._newFileLang, this._newFileName);
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
      this.#newFileResult = getFile(this._newFileContent, this._newFileLang, this._newFileName);
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
      this.#oldFileResult = getFile(this._oldFileContent, this._oldFileLang, this._oldFileName);
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
            getDiffRange(additions, deletions);
            additions = [];
            deletions = [];
          }
        });
        getDiffRange(additions, deletions);
      });
    });

    this.#diffLines = [];

    const tmp: DiffLine[] = [];

    this.#diffListResults.forEach((item) => {
      item.hunks.forEach((_item) => {
        tmp.push(..._item.lines);
      });
    });

    this.#diffLines = tmp.map<DiffLineItem>((i, index) => {
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

          _oldStartIndex: -Number(oldNumStartIndex),
          _oldLength: Number(oldNumLength),
          _newStartIndex: +Number(newNumStartIndex),
          _newLength: Number(newNumLength),
        };
      }
      return typedI;
    });

    // this.#diffLines = this.#diffListResults
    //   .reduce<DiffLine[]>((p, c) => p.concat(...c.hunks.reduce<DiffLine[]>((_p, _c) => _p.concat(..._c.lines), [])), [])
    //   .map<DiffLineItem>((i, index) => {
    //     const typedI = i as DiffLineItem;
    //     typedI.index = index;
    //     if (typedI.type === DiffLineType.Hunk) {
    //       const numInfo = typedI.text.split("@@")?.[1].split(" ").filter(Boolean);
    //       const oldNumInfo = numInfo?.[0] || "";
    //       const newNumInfo = numInfo?.[1] || "";
    //       const [oldNumStartIndex, oldNumLength] = oldNumInfo.split(",");
    //       const [newNumStartIndex, newNumLength] = newNumInfo.split(",");
    //       const typedTypeI = typedI as DiffHunkItem;
    //       typedTypeI.hunkInfo = {
    //         oldStartIndex: -Number(oldNumStartIndex),
    //         oldLength: Number(oldNumLength),
    //         newStartIndex: +Number(newNumStartIndex),
    //         newLength: Number(newNumLength),
    //       };
    //     }
    //     return typedI;
    //   });

    this.#oldFileDiffLines = {};

    this.#diffLines.forEach((item) => {
      if (item.oldLineNumber) {
        this.diffLineLength = Math.max(this.diffLineLength, item.oldLineNumber);

        this.#oldFileDiffLines[item.oldLineNumber] = item;
      }
    });

    this.#newFileDiffLines = {};

    this.#diffLines.forEach((item) => {
      if (item.newLineNumber) {
        this.diffLineLength = Math.max(this.diffLineLength, item.newLineNumber);

        this.#newFileDiffLines[item.newLineNumber] = item;
      }
    });
  }

  #composeSyntax({
    autoDetectLang,
    registerHighlighter,
  }: {
    autoDetectLang?: boolean;
    registerHighlighter?: typeof highlighter;
  }) {
    this.#oldFileResult?.doSyntax({ autoDetectLang, registerHighlighter });

    this.#oldFileSyntaxLines = this.#oldFileResult?.syntaxFile;

    this.#newFileResult?.doSyntax({ autoDetectLang, registerHighlighter });

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

  initSyntax({
    autoDetectLang,
    registerHighlighter,
  }: { autoDetectLang?: boolean; registerHighlighter?: typeof highlighter } = {}) {
    if (this.#hasInitSyntax) return;
    this.#composeSyntax({ registerHighlighter, autoDetectLang });
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
      const oldDiffLine = this.#getOldDiffLine(oldFileLineNumber);
      const newDiffLine = this.#getNewDiffLine(newFileLineNumber);
      const oldRawLine = this.#getOldRawLine(oldFileLineNumber);
      const newRawLine = this.#getNewRawLine(newFileLineNumber);
      const oldLineHasChange = oldDiffLine?.isIncludeableLine();
      const newLineHasChange = newDiffLine?.isIncludeableLine();
      const len = this.#splitRightLines.length;
      const isHidden = !oldDiffLine && !newDiffLine;
      if (
        (oldDiffLine && !newDiffLine && oldDiffLine.newLineNumber && oldDiffLine.newLineNumber > newFileLineNumber) ||
        (!oldDiffLine && newDiffLine && newDiffLine.oldLineNumber && newDiffLine.oldLineNumber > oldFileLineNumber)
      ) {
        if (this.#composeByDiff) {
          oldDiffLine && newFileLineNumber++;
          newDiffLine && oldFileLineNumber++;
          continue;
        } else {
          if (__DEV__) {
            console.error("some error happen for generate diff line!");
          }
        }
      }
      if (!oldDiffLine && !newRawLine && !oldDiffLine && !newDiffLine) break;
      if ((oldLineHasChange && newLineHasChange) || (!oldLineHasChange && !newLineHasChange)) {
        this.#splitLeftLines.push({
          lineNumber: oldFileLineNumber++,
          value: oldRawLine,
          diff: oldDiffLine,
          isHidden,
          _isHidden: isHidden,
        });
        this.#splitRightLines.push({
          lineNumber: newFileLineNumber++,
          value: newRawLine,
          diff: newDiffLine,
          isHidden,
          _isHidden: isHidden,
        });
      } else if (oldLineHasChange) {
        this.#splitLeftLines.push({
          lineNumber: oldFileLineNumber++,
          value: oldRawLine,
          diff: oldDiffLine,
          isHidden,
          _isHidden: isHidden,
        });
        this.#splitRightLines.push({});
      } else if (newLineHasChange) {
        this.#splitLeftLines.push({});
        this.#splitRightLines.push({
          lineNumber: newFileLineNumber++,
          value: newRawLine,
          diff: newDiffLine,
          isHidden,
          _isHidden: isHidden,
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

              _startHiddenIndex: hideStart,
              _endHiddenIndex: len,
              _plainText: typedPrevious.text,
            };
            hideStart = Infinity;
          }
          this.#splitHunksLines = {
            ...this.#splitHunksLines,
            [len]: typedPrevious,
          };
        }
      }
    }

    // have last hunk
    if (Number.isFinite(hideStart)) {
      const lastDiff = new DiffLine("", DiffLineType.Hunk, null, null, null);
      const lastHunk = lastDiff as DiffHunkItem;
      lastHunk.isLast = true;
      lastHunk.splitInfo = {
        startHiddenIndex: hideStart,
        endHiddenIndex: this.#splitRightLines.length,

        _startHiddenIndex: hideStart,
        _endHiddenIndex: this.#splitRightLines.length,

        // just for placeholder
        plainText: "",
        oldStartIndex: 0,
        newStartIndex: 0,
        oldLength: 0,
        newLength: 0,

        _plainText: "",
        _oldStartIndex: 0,
        _newStartIndex: 0,
        _oldLength: 0,
        _newLength: 0,
      };
      this.#splitHunksLines = {
        ...this.#splitHunksLines,
        [this.#splitRightLines.length]: lastHunk,
      };
      hideStart = Infinity;
    }

    this.splitLineLength = this.#splitRightLines.length;

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
      if (
        (oldDiffLine && !newDiffLine && oldDiffLine.newLineNumber && oldDiffLine.newLineNumber > newFileLineNumber) ||
        (!oldDiffLine && newDiffLine && newDiffLine.oldLineNumber && newDiffLine.oldLineNumber > oldFileLineNumber)
      ) {
        if (this.#composeByDiff) {
          oldDiffLine && newFileLineNumber++;
          newDiffLine && oldFileLineNumber++;
          continue;
        } else {
          if (__DEV__) {
            console.error("some error happen for generate diff line!");
          }
        }
      }
      if (!oldRawLine && !newRawLine && !newDiffLine && !oldDiffLine) break;
      if (!oldLineHasChange && !newLineHasChange) {
        this.#unifiedLines.push({
          oldLineNumber: oldFileLineNumber++,
          newLineNumber: newFileLineNumber++,
          value: newRawLine,
          diff: newDiffLine,
          isHidden,
          _isHidden: isHidden,
        });
      } else if (oldLineHasChange) {
        this.#unifiedLines.push({
          oldLineNumber: oldFileLineNumber++,
          value: oldRawLine,
          diff: oldDiffLine,
          isHidden,
          _isHidden: isHidden,
        });
      } else if (newLineHasChange) {
        this.#unifiedLines.push({
          newLineNumber: newFileLineNumber++,
          value: newRawLine,
          diff: newDiffLine,
          isHidden,
          _isHidden: isHidden,
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

              _startHiddenIndex: hideStart,
              _endHiddenIndex: len,
              _plainText: typedPrevious.text,
            };
            hideStart = Infinity;
          }
          this.#unifiedHunksLines = {
            ...this.#unifiedHunksLines,
            [len]: typedPrevious,
          };
        }
      }
    }

    // have last hunk
    if (Number.isFinite(hideStart)) {
      const lastDiff = new DiffLine("", DiffLineType.Hunk, null, null, null);
      const lastHunk = lastDiff as DiffHunkItem;
      lastHunk.isLast = true;
      lastHunk.unifiedInfo = {
        startHiddenIndex: hideStart,
        endHiddenIndex: this.#unifiedLines.length,

        _startHiddenIndex: hideStart,
        _endHiddenIndex: this.#unifiedLines.length,
        // just for placeholder

        plainText: "",
        oldStartIndex: 0,
        newStartIndex: 0,
        oldLength: 0,
        newLength: 0,

        _plainText: "",
        _oldStartIndex: 0,
        _newStartIndex: 0,
        _oldLength: 0,
        _newLength: 0,
      };
      this.#unifiedHunksLines = {
        ...this.#unifiedHunksLines,
        [this.#unifiedLines.length]: lastHunk,
      };
      hideStart = Infinity;
    }

    this.unifiedLineLength = this.#unifiedLines.length;

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

  onSplitHunkExpand = (dir: "up" | "down" | "all", index: number, needTrigger = true) => {
    const current = this.#splitHunksLines?.[index];
    if (!current || !current.splitInfo) return;

    if (dir === "all") {
      for (let i = current.splitInfo.startHiddenIndex; i < current.splitInfo.endHiddenIndex; i++) {
        const leftLine = this.#splitLeftLines[i];
        const rightLine = this.#splitRightLines[i];
        if (leftLine?.isHidden) leftLine.isHidden = false;
        if (rightLine?.isHidden) rightLine.isHidden = false;
      }
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
      if (current.isLast) {
        current.splitInfo = {
          ...current.splitInfo,
          startHiddenIndex: current.splitInfo.startHiddenIndex + composeLen,
        };
      } else {
        current.splitInfo = {
          ...current.splitInfo,
          startHiddenIndex: current.splitInfo.startHiddenIndex + composeLen,
          plainText: `@@ -${current.splitInfo.oldStartIndex},${current.splitInfo.oldLength} +${current.splitInfo.newStartIndex},${current.splitInfo.newLength}`,
        };
      }
    } else {
      if (current.isLast) {
        __DEV__ && console.error("the last hunk can not expand up!");
        return;
      }
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

    needTrigger && this.notifyAll();
  };

  getUnifiedLine = (index: number) => {
    return this.#unifiedLines[index];
  };

  getUnifiedHunkLine = (index: number) => {
    return this.#unifiedHunksLines?.[index];
  };

  onUnifiedHunkExpand = (dir: "up" | "down" | "all", index: number, needTrigger = true) => {
    const current = this.#unifiedHunksLines?.[index];
    if (!current || !current.unifiedInfo) return;

    if (dir === "all") {
      for (let i = current.unifiedInfo.startHiddenIndex; i < current.unifiedInfo.endHiddenIndex; i++) {
        const unifiedLine = this.#unifiedLines?.[i];
        if (unifiedLine?.isHidden) {
          unifiedLine.isHidden = false;
        }
      }
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
      if (current.isLast) {
        current.unifiedInfo = {
          ...current.unifiedInfo,
          startHiddenIndex: current.unifiedInfo.startHiddenIndex + composeLen,
        };
      } else {
        current.unifiedInfo = {
          ...current.unifiedInfo,
          startHiddenIndex: current.unifiedInfo.startHiddenIndex + composeLen,
          plainText: `@@ -${current.unifiedInfo.oldStartIndex},${current.unifiedInfo.oldLength} +${current.unifiedInfo.newStartIndex},${current.unifiedInfo.newLength}`,
        };
      }
    } else {
      if (current.isLast) {
        __DEV__ && console.error("the last hunk can not expand up!");
        return;
      }
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

    needTrigger && this.notifyAll();
  };

  onAllExpand = (mode: "split" | "unified") => {
    if (mode === "split") {
      Object.keys(this.#splitHunksLines || {}).forEach((key) => {
        this.onSplitHunkExpand("all", +key, false);
      });
    } else {
      Object.keys(this.#unifiedHunksLines || {}).forEach((key) => {
        this.onUnifiedHunkExpand("all", +key, false);
      });
    }

    this.notifyAll();
  };

  onAllCollapse = (mode: "split" | "unified") => {
    if (mode === "split") {
      Object.values(this.#splitLeftLines || {}).forEach((item) => {
        if (!item.isHidden && item._isHidden) {
          item.isHidden = item._isHidden;
        }
      });
      Object.values(this.#splitRightLines || {}).forEach((item) => {
        if (!item.isHidden && item._isHidden) {
          item.isHidden = item._isHidden;
        }
      });
      Object.values(this.#splitHunksLines || {}).forEach((item) => {
        if (!item.splitInfo) return;
        item.splitInfo = {
          ...item.splitInfo,
          oldStartIndex: item.splitInfo._oldStartIndex,
          oldLength: item.splitInfo._oldLength,
          newStartIndex: item.splitInfo._newStartIndex,
          newLength: item.splitInfo._newLength,
          startHiddenIndex: item.splitInfo._startHiddenIndex,
          endHiddenIndex: item.splitInfo._endHiddenIndex,
          plainText: item.splitInfo._plainText,
        };
      });
      Object.keys(this.#splitHunksLines || {}).forEach((key) => {
        const item = this.#splitHunksLines![key];
        if (!item.splitInfo) return;
        if (item.splitInfo.endHiddenIndex !== +key) {
          delete this.#splitHunksLines![key];

          this.#splitHunksLines![item.splitInfo.endHiddenIndex] = item;
        }
      });
    } else {
      Object.values(this.#unifiedLines || {}).forEach((item) => {
        if (!item.isHidden && item._isHidden) {
          item.isHidden = item._isHidden;
        }
      });
      Object.values(this.#unifiedHunksLines || {}).forEach((item) => {
        if (!item.unifiedInfo) return;
        item.unifiedInfo = {
          ...item.unifiedInfo,
          oldStartIndex: item.unifiedInfo._oldStartIndex,
          oldLength: item.unifiedInfo._oldLength,
          newStartIndex: item.unifiedInfo._newStartIndex,
          newLength: item.unifiedInfo._newLength,
          startHiddenIndex: item.unifiedInfo._startHiddenIndex,
          endHiddenIndex: item.unifiedInfo._endHiddenIndex,
          plainText: item.unifiedInfo._plainText,
        };
      });
      Object.keys(this.#unifiedHunksLines || {}).forEach((key) => {
        const item = this.#unifiedHunksLines![key];
        if (!item.unifiedInfo) return;
        if (item.unifiedInfo.endHiddenIndex !== +key) {
          delete this.#unifiedHunksLines![key];

          this.#unifiedHunksLines![item.unifiedInfo.endHiddenIndex] = item;
        }
      })
    }

    this.notifyAll();
  };

  getOldSyntaxLine = (lineNumber: number) => {
    return this.#oldFileSyntaxLines?.[lineNumber];
  };

  getNewSyntaxLine = (lineNumber: number) => {
    return this.#newFileSyntaxLines?.[lineNumber];
  };

  subscribe = (listener: (() => void) & { isSyncExternal?: boolean }) => {
    this.#listeners.push(listener);

    return () => {
      this.#listeners.filter((i) => i !== listener);
    };
  };

  notifyAll = (skipSyncExternal?: boolean) => {
    this.#updateCount++;
    this.#listeners.forEach((f) => {
      if (skipSyncExternal && f.isSyncExternal) {
        return;
      }
      f();
    });
  };

  getUpdateCount = () => this.#updateCount;

  getExpandEnabled = () => !this.#composeByDiff;

  getBundle = () => {
    // common
    const hasInitRaw = this.#hasInitRaw;
    const hasInitSyntax = this.#hasInitSyntax;
    const hasBuildSplit = this.#hasBuildSplit;
    const hasBuildUnified = this.#hasBuildUnified;
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

    // unified
    const unifiedLines = this.#unifiedLines;
    const unifiedHunkLines = this.#unifiedHunksLines;

    const version = this._version_;

    return {
      hasInitRaw,
      hasInitSyntax,
      hasBuildSplit,
      hasBuildUnified,
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
      unifiedLines,
      unifiedHunkLines,

      composeByDiff,

      version
    };
  };

  mergeBundle = (data: ReturnType<DiffFile["getBundle"]>) => {
    this.#hasInitRaw = data.hasInitRaw;
    this.#hasInitSyntax = data.hasInitSyntax;
    this.#hasBuildSplit = data.hasBuildSplit;
    this.#hasBuildUnified = data.hasBuildUnified;
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

    this.#unifiedLines = data.unifiedLines;
    this.#unifiedHunksLines = data.unifiedHunkLines;

    if (__DEV__ && this._version_ !== data.version) {
      console.error('the version of the `diffInstance` is not match, some error may happen!');
    }

    this.notifyAll();
  };

  _addClonedInstance = (instance: DiffFile) => {
    const updateFunc = () => {
      this._notifyOthers(instance);
    };

    updateFunc.isSyncExternal = true;

    const unsubscribe = instance.subscribe(updateFunc);

    this.#clonedInstance.set(instance, unsubscribe);
  };

  _notifyOthers = (instance: DiffFile) => {
    this.#clonedInstance.forEach((_, i) => {
      if (i !== instance) {
        i.notifyAll(true);
      }
    });
  };

  _delClonedInstance = (instance: DiffFile) => {
    const unsubscribe = this.#clonedInstance.get(instance);

    unsubscribe && unsubscribe();

    this.#clonedInstance.delete(instance);
  };

  _getFullBundle = () => {
    const bundle = this.getBundle();
    const oldFileResult = this.#oldFileResult;
    const newFileResult = this.#newFileResult;
    const diffLines = this.#diffLines;
    const diffListResults = this.#diffListResults;

    return {
      ...bundle,
      oldFileResult,
      newFileResult,
      diffLines,
      diffListResults,
    };
  };

  _mergeFullBundle = (data: ReturnType<DiffFile["_getFullBundle"]>) => {
    this.mergeBundle(data);
    this.#oldFileResult = data.oldFileResult;
    this.#newFileResult = data.newFileResult;
    this.#diffLines = data.diffLines;
    this.#diffListResults = data.diffListResults;
  };

  _destroy = () => {
    this.clearId();
    this.#listeners.splice(0, this.#listeners.length);
    this.#clonedInstance.forEach((v) => v());
    this.#clonedInstance.clear();
  };

  clear = () => {
    this._destroy();
    this.#oldFileResult = null;
    this.#newFileResult = null;
    this.#diffLines = null;
    this.#diffListResults = null;
    this.#newFileDiffLines = null;
    this.#oldFileDiffLines = null;
    this.#newFileLines = null;
    this.#oldFileLines = null;
    this.#newFileSyntaxLines = null;
    this.#oldFileSyntaxLines = null;
    this.#splitHunksLines = null;
    this.#splitLeftLines = null;
    this.#splitRightLines = null;
    this.#unifiedHunksLines = null;
    this.#unifiedLines = null;
  };
}
