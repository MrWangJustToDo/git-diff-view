import findLastIndex from "lodash/findLastIndex";
import sortBy from "lodash/sortBy";

import type { DiffViewProps } from "@git-diff-view/react";

type HunkItem = {
  oldStartLine: number;
  oldLineCount: number;
  newStartLine: number;
  newLineCount: number;
  patchContent: string;
};

const checkHasExpand = (hunks: HunkItem[], line: number, side: "L" | "R") => {
  return hunks.some((hunk) => {
    if (side === "L") {
      return hunk.oldStartLine <= line && line <= hunk.oldStartLine + hunk.oldLineCount - 1;
    }
    if (side === "R") {
      return hunk.newStartLine <= line && line <= hunk.newStartLine + hunk.newLineCount - 1;
    }
    return false;
  });
};

const getHunk = (hunks: HunkItem[], line: number, side: "L" | "R") => {
  // 1 表示取后一个hunk，2表示取前一个hunk
  let type: 1 | 2 = 1;
  // 默认取后一个hunk，计算更简单
  let hunkIndex = hunks.findIndex((hunk) => {
    if (side === "L") {
      return hunk.oldStartLine > line;
    }
    if (side === "R") {
      return hunk.newStartLine > line;
    }
    return false;
  });
  // 如果后一个不存在，取前一个hunk
  if (hunkIndex === -1) {
    type = 2;

    hunkIndex = findLastIndex(hunks, (hunk) => {
      if (side === "L") {
        return hunk.oldStartLine + hunk.oldLineCount < line;
      }
      if (side === "R") {
        return hunk.newStartLine + hunk.newLineCount < line;
      }
      return false;
    });
  }

  return { hunkIndex, type };
};

const insertHunk = (hunks: HunkItem[], line: number, side: "L" | "R", hunkIndex: number, type: 1 | 2) => {
  if (hunkIndex === -1) return { newHunks: hunks, hunk: null };

  const existHunk = hunks[hunkIndex];

  let hunk: HunkItem | null = null;

  // 根据旧行号得出新行号
  if (side === "L") {
    const newLineNumber =
      type === 1
        ? existHunk.newStartLine - (existHunk.oldStartLine - line)
        : existHunk.newStartLine + existHunk.newLineCount + (line - existHunk.oldStartLine - existHunk.oldLineCount);
    hunk = {
      oldStartLine: line,
      oldLineCount: 1,
      newStartLine: newLineNumber,
      newLineCount: 1,
      patchContent: "",
    };
  } else {
    const oldLineNumber =
      type === 1
        ? existHunk.oldStartLine - (existHunk.newStartLine - line)
        : existHunk.oldStartLine + existHunk.oldLineCount + (line - existHunk.newStartLine - existHunk.newLineCount);
    hunk = {
      oldStartLine: oldLineNumber,
      oldLineCount: 1,
      newStartLine: line,
      newLineCount: 1,
      patchContent: "",
    };
  }

  let newHunks = Array.from(hunks);

  if (hunk) {
    if (type === 1) {
      // 插入到后面
      newHunks.splice(hunkIndex + 1, 0, hunk);
    } else {
      // 插入到前面
      newHunks.splice(hunkIndex, 0, hunk);
    }
  }

  newHunks = sortBy(newHunks, (hunk) => hunk.oldStartLine);

  return { newHunks, hunk };
};

const generatePatchContent = (hunk: HunkItem, oldFile?: string, newFile?: string) => {
  const oldLine = hunk.oldStartLine;
  const newLine = hunk.newStartLine;
  const oldLineContent = (oldFile || "")
    .split("\n")
    .slice(oldLine - 1, oldLine + hunk.oldLineCount - 1)
    .join("\n");
  const newLineContent = (newFile || "")
    .split("\n")
    .slice(newLine - 1, newLine + hunk.newLineCount - 1)
    .join("\n");
  // 动态生成的hunk有误
  // TODO 给出提示
  if (oldLineContent !== newLineContent) {
    return false;
  }
  // 确保是正确的hunk格式
  const patchContent = `--- a.txt
+++ b.txt
@@ -${oldLine},${hunk.oldLineCount} +${newLine},${hunk.newLineCount} @@
 ${oldLineContent}
`;
  hunk.patchContent = patchContent;
  return true;
};

export const parseHunk = (patchContent: string) => {
  const res: HunkItem[] = [];
  const lines = patchContent.split("\n");
  let str = "";
  let header = "";
  let headerLine = "";
  lines.forEach((line, index) => {
    if (line.startsWith("@@")) {
      if (str) {
        const headerMatch = headerLine.match(/@@ -(\d+),(\d+) \+(\d+),(\d+) @@/);
        res.push({
          oldStartLine: headerMatch ? Number(headerMatch[1]) : 0,
          oldLineCount: headerMatch ? Number(headerMatch[2]) : 0,
          newStartLine: headerMatch ? Number(headerMatch[3]) : 0,
          newLineCount: headerMatch ? Number(headerMatch[4]) : 0,
          patchContent: header + str,
        });
      }
      headerLine = line;
      str = "";
    }
    if (index < lines.length - 1) {
      str += `${line}\n`;
    } else {
      str += line;
    }
    if (line.startsWith("+++")) {
      header = str;
      str = "";
    }
  });
  if (str) {
    const headerMatch = headerLine.match(/@@ -(\d+),(\d+) \+(\d+),(\d+) @@/);
    res.push({
      oldStartLine: headerMatch ? Number(headerMatch[1]) : 0,
      oldLineCount: headerMatch ? Number(headerMatch[2]) : 0,
      newStartLine: headerMatch ? Number(headerMatch[3]) : 0,
      newLineCount: headerMatch ? Number(headerMatch[4]) : 0,
      patchContent: header + str,
    });
  }
  return res;
};

export const generateDynamicHunks = ({
  hunks,
  comments,
  oldFile,
  newFile,
}: {
  hunks: HunkItem[];
  comments: DiffViewProps<string[]>["extendData"];
  oldFile?: string;
  newFile?: string;
}) => {
  const allNeedExpandLineNumbers: { old: number[]; new: number[] } = { old: [], new: [] };

  Object.keys(comments?.oldFile || {}).forEach((lineNumber) => {
    if (comments?.oldFile?.[lineNumber]?.data?.length) {
      allNeedExpandLineNumbers.old.push(Number(lineNumber));
    }
  });

  Object.keys(comments?.newFile || {}).forEach((lineNumber) => {
    if (comments?.newFile?.[lineNumber]?.data?.length) {
      allNeedExpandLineNumbers.new.push(Number(lineNumber));
    }
  });

  allNeedExpandLineNumbers.new.forEach((line) => {
    // check current line has expand
    if (!checkHasExpand(hunks, line, "R")) {
      const { type, hunkIndex } = getHunk(hunks, line, "R");
      const { newHunks, hunk } = insertHunk(hunks, line, "R", hunkIndex, type);
      if (hunk && generatePatchContent(hunk, oldFile, newFile)) {
        hunks = newHunks;
      }
    }
  });

  allNeedExpandLineNumbers.old.forEach((line) => {
    // check current line has expand
    if (!checkHasExpand(hunks, line, "L")) {
      const { type, hunkIndex } = getHunk(hunks, line, "L");
      const { newHunks, hunk } = insertHunk(hunks, line, "L", hunkIndex, type);
      if (hunk && generatePatchContent(hunk, oldFile, newFile)) {
        hunks = newHunks;
      }
    }
  });

  return sortBy(hunks, (hunk) => hunk.oldStartLine);
};
