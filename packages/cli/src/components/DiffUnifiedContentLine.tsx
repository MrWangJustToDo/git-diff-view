import { type DiffFile, type DiffLine, checkDiffLineIncludeChange, type File } from "@git-diff-view/core";
import { NewLineSymbol } from "@git-diff-view/utils";
import { Box } from "ink";
import * as React from "react";

import {
  diffAddLineNumber,
  diffDelLineNumber,
  diffExpandLineNumber,
  diffExpandLineNumberColor,
  diffPlainLineNumber,
  diffPlainLineNumberColor,
} from "./color";
import { DiffContent } from "./DiffContent";
import { DiffUnifiedLineNumberArea } from "./DiffLineNumber";
import { getCurrentLineRow } from "./tools";

/**
 * Unified view line component for deleted lines (old side only)
 */
const DiffUnifiedOldLine = ({
  index,
  theme,
  height,
  columns,
  rawLine,
  diffLine,
  plainLine,
  syntaxLine,
  lineNumber,
  lineNumWidth,
  diffFile,
  contentWidth,
  enableHighlight,
}: {
  index: number;
  height: number;
  theme: "light" | "dark";
  columns: number;
  rawLine: string;
  lineNumber: number;
  lineNumWidth: number;
  plainLine?: File["plainFile"][number];
  syntaxLine?: File["syntaxFile"][number];
  diffLine?: DiffLine;
  diffFile: DiffFile;
  contentWidth: number;
  enableHighlight: boolean;
}) => {
  const color = theme === "light" ? diffPlainLineNumberColor.light : diffPlainLineNumberColor.dark;

  const bg = theme === "light" ? diffDelLineNumber.light : diffDelLineNumber.dark;

  return (
    <Box data-line={index} data-state="diff" height={height} width={columns}>
      <DiffUnifiedLineNumberArea
        oldLineNumber={lineNumber}
        newLineNumber={undefined}
        lineNumWidth={lineNumWidth}
        height={height}
        backgroundColor={bg}
        color={color}
        dim={false}
      />
      <DiffContent
        theme={theme}
        height={height}
        width={contentWidth}
        rawLine={rawLine}
        diffLine={diffLine}
        diffFile={diffFile}
        plainLine={plainLine}
        syntaxLine={syntaxLine}
        enableHighlight={enableHighlight}
      />
    </Box>
  );
};

/**
 * Unified view line component for added lines (new side only)
 */
const DiffUnifiedNewLine = ({
  index,
  theme,
  height,
  columns,
  rawLine,
  diffLine,
  plainLine,
  syntaxLine,
  lineNumber,
  lineNumWidth,
  diffFile,
  contentWidth,
  enableHighlight,
}: {
  index: number;
  height: number;
  theme: "light" | "dark";
  columns: number;
  rawLine: string;
  lineNumber: number;
  lineNumWidth: number;
  plainLine?: File["plainFile"][number];
  syntaxLine?: File["syntaxFile"][number];
  diffLine?: DiffLine;
  diffFile: DiffFile;
  contentWidth: number;
  enableHighlight: boolean;
}) => {
  const color = theme === "light" ? diffPlainLineNumberColor.light : diffPlainLineNumberColor.dark;

  const bg = theme === "light" ? diffAddLineNumber.light : diffAddLineNumber.dark;

  return (
    <Box data-line={index} data-state="diff" height={height} width={columns}>
      <DiffUnifiedLineNumberArea
        oldLineNumber={undefined}
        newLineNumber={lineNumber}
        lineNumWidth={lineNumWidth}
        height={height}
        backgroundColor={bg}
        color={color}
        dim={false}
      />
      <DiffContent
        theme={theme}
        height={height}
        width={contentWidth}
        diffFile={diffFile}
        rawLine={rawLine}
        diffLine={diffLine}
        plainLine={plainLine}
        syntaxLine={syntaxLine}
        enableHighlight={enableHighlight}
      />
    </Box>
  );
};

const InternalDiffUnifiedLine = ({
  index,
  theme,
  columns,
  diffFile,
  lineNumber,
  lineNumWidth,
  enableHighlight,
}: {
  index: number;
  theme: "light" | "dark";
  columns: number;
  diffFile: DiffFile;
  lineNumber: number;
  lineNumWidth: number;
  enableHighlight: boolean;
}) => {
  const unifiedLine = diffFile.getUnifiedLine(index);

  const hasDiff = unifiedLine.diff;
  const hasChange = checkDiffLineIncludeChange(unifiedLine.diff);

  const rawLine = unifiedLine.value || "";
  const diffLine = unifiedLine.diff;

  const newLineNumber = unifiedLine.newLineNumber;
  const oldLinenumber = unifiedLine.oldLineNumber;

  const syntaxLine = newLineNumber
    ? diffFile.getNewSyntaxLine(newLineNumber)
    : oldLinenumber
      ? diffFile.getOldSyntaxLine(oldLinenumber)
      : undefined;

  const plainLine = newLineNumber
    ? diffFile.getNewPlainLine(newLineNumber)
    : oldLinenumber
      ? diffFile.getOldPlainLine(oldLinenumber)
      : undefined;

  const contentWidth = columns - (lineNumWidth + 1) * 2 - 1;

  // Use contentWidth - 1 to match the actual wrap width in DiffContent (operator column takes 1 char)
  let row = getCurrentLineRow({ content: rawLine, width: contentWidth - 1 });

  row = diffLine?.changes?.hasLineChange && diffLine.changes.newLineSymbol === NewLineSymbol.NEWLINE ? row + 1 : row;

  const color = hasDiff
    ? theme === "light"
      ? diffPlainLineNumberColor.light
      : diffPlainLineNumberColor.dark
    : theme === "light"
      ? diffExpandLineNumberColor.light
      : diffExpandLineNumberColor.dark;

  const bg = hasDiff
    ? theme === "light"
      ? diffPlainLineNumber.light
      : diffPlainLineNumber.dark
    : theme === "light"
      ? diffExpandLineNumber.light
      : diffExpandLineNumber.dark;

  // Handle changed lines (additions or deletions)
  if (hasChange) {
    if (unifiedLine.oldLineNumber) {
      return (
        <DiffUnifiedOldLine
          theme={theme}
          height={row}
          columns={columns}
          rawLine={rawLine}
          diffFile={diffFile}
          index={lineNumber}
          diffLine={diffLine}
          plainLine={plainLine}
          syntaxLine={syntaxLine}
          lineNumWidth={lineNumWidth}
          contentWidth={contentWidth}
          enableHighlight={enableHighlight}
          lineNumber={unifiedLine.oldLineNumber}
        />
      );
    } else {
      return (
        <DiffUnifiedNewLine
          theme={theme}
          height={row}
          columns={columns}
          rawLine={rawLine}
          index={lineNumber}
          diffLine={diffLine}
          diffFile={diffFile}
          plainLine={plainLine}
          syntaxLine={syntaxLine}
          lineNumWidth={lineNumWidth}
          contentWidth={contentWidth}
          enableHighlight={enableHighlight}
          lineNumber={unifiedLine.newLineNumber!}
        />
      );
    }
  }

  // Handle unchanged lines (context lines)
  return (
    <Box data-line={lineNumber} data-state={unifiedLine.diff ? "diff" : "plain"} height={row} width={columns}>
      <DiffUnifiedLineNumberArea
        oldLineNumber={unifiedLine.oldLineNumber}
        newLineNumber={unifiedLine.newLineNumber}
        lineNumWidth={lineNumWidth}
        height={row}
        backgroundColor={bg}
        color={color}
        dim={true}
      />
      <DiffContent
        theme={theme}
        height={row}
        rawLine={rawLine}
        diffFile={diffFile}
        diffLine={diffLine}
        width={contentWidth}
        plainLine={plainLine}
        syntaxLine={syntaxLine}
        enableHighlight={enableHighlight}
      />
    </Box>
  );
};

export const DiffUnifiedContentLine = ({
  index,
  theme,
  columns,
  diffFile,
  lineNumber,
  lineNumWidth,
  enableHighlight,
}: {
  index: number;
  columns: number;
  theme: "light" | "dark";
  diffFile: DiffFile;
  lineNumber: number;
  lineNumWidth: number;
  enableHighlight: boolean;
}) => {
  const unifiedLine = diffFile.getUnifiedLine(index);

  if (unifiedLine?.isHidden) return null;

  return (
    <InternalDiffUnifiedLine
      index={index}
      theme={theme}
      columns={columns}
      diffFile={diffFile}
      lineNumber={lineNumber}
      lineNumWidth={lineNumWidth}
      enableHighlight={enableHighlight}
    />
  );
};
