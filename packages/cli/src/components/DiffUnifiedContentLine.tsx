import { type DiffFile, type DiffLine, checkDiffLineIncludeChange, type File } from "@git-diff-view/core";
import { NewLineSymbol } from "@git-diff-view/utils";
import { Box, Text } from "ink";
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
import { getCurrentLineRow } from "./tools";

const DiffUnifiedOldLine = ({
  index,
  width,
  theme,
  height,
  columns,
  rawLine,
  diffLine,
  plainLine,
  syntaxLine,
  lineNumber,
  diffFile,
  contentWidth,
  enableHighlight,
}: {
  index: number;
  width: number;
  height: number;
  theme: "light" | "dark";
  columns: number;
  rawLine: string;
  lineNumber: number;
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
      <Box width={width * 2 + 2} flexShrink={0}>
        <Box width={width} justifyContent="flex-end">
          <Text color={color} wrap="wrap" backgroundColor={bg} data-line-old-num={lineNumber}>
            {lineNumber
              .toString()
              .padStart(width)
              .padEnd(width * height)}
          </Text>
        </Box>
        <Box width={1}>
          <Text backgroundColor={bg} wrap="wrap">
            {" ".padEnd(height)}
          </Text>
        </Box>
        <Box width={width}>
          <Text backgroundColor={bg} wrap="wrap">
            {" ".padStart(width * height)}
          </Text>
        </Box>
        <Box width={1}>
          <Text backgroundColor={bg} wrap="wrap">
            {" ".padEnd(height)}
          </Text>
        </Box>
      </Box>
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

const DiffUnifiedNewLine = ({
  index,
  width,
  theme,
  height,
  columns,
  rawLine,
  diffLine,
  plainLine,
  syntaxLine,
  lineNumber,
  diffFile,
  contentWidth,
  enableHighlight,
}: {
  index: number;
  width: number;
  height: number;
  theme: "light" | "dark";
  columns: number;
  rawLine: string;
  lineNumber: number;
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
      <Box width={width * 2 + 2} flexShrink={0}>
        <Box width={width}>
          <Text backgroundColor={bg} wrap="wrap">
            {" ".padStart(width * height)}
          </Text>
        </Box>
        <Box width={1}>
          <Text backgroundColor={bg} wrap="wrap">
            {" ".padEnd(height)}
          </Text>
        </Box>
        <Box width={width} justifyContent="flex-end">
          <Text color={color} wrap="wrap" backgroundColor={bg} data-line-new-num={lineNumber}>
            {lineNumber
              .toString()
              .padStart(width)
              .padEnd(width * height)}
          </Text>
        </Box>
        <Box width={1}>
          <Text backgroundColor={bg} wrap="wrap">
            {" ".padEnd(height)}
          </Text>
        </Box>
      </Box>
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
  width,
  theme,
  columns,
  diffFile,
  lineNumber,
  enableHighlight,
}: {
  index: number;
  width: number;
  theme: "light" | "dark";
  columns: number;
  diffFile: DiffFile;
  lineNumber: number;
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

  const contentWidth = columns - (width + 1) * 2;

  let row = getCurrentLineRow({ content: rawLine, width: contentWidth });

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

  if (hasChange) {
    if (unifiedLine.oldLineNumber) {
      return (
        <DiffUnifiedOldLine
          theme={theme}
          width={width}
          height={row}
          columns={columns}
          rawLine={rawLine}
          diffFile={diffFile}
          index={lineNumber}
          diffLine={diffLine}
          plainLine={plainLine}
          syntaxLine={syntaxLine}
          contentWidth={contentWidth}
          enableHighlight={enableHighlight}
          lineNumber={unifiedLine.oldLineNumber}
        />
      );
    } else {
      return (
        <DiffUnifiedNewLine
          theme={theme}
          width={width}
          height={row}
          columns={columns}
          rawLine={rawLine}
          index={lineNumber}
          diffLine={diffLine}
          diffFile={diffFile}
          plainLine={plainLine}
          syntaxLine={syntaxLine}
          contentWidth={contentWidth}
          enableHighlight={enableHighlight}
          lineNumber={unifiedLine.newLineNumber!}
        />
      );
    }
  } else {
    return (
      <Box data-line={lineNumber} data-state={unifiedLine.diff ? "diff" : "plain"} height={row} width={columns}>
        <Box width={width * 2 + 2} flexShrink={0}>
          <Box width={width} justifyContent="flex-end">
            <Text dimColor wrap="wrap" color={color} backgroundColor={bg} data-line-old-num={unifiedLine.oldLineNumber}>
              {unifiedLine.oldLineNumber
                .toString()
                .padStart(width)
                .padEnd(width * row)}
            </Text>
          </Box>
          <Box width={1}>
            <Text backgroundColor={bg} wrap="wrap">
              {" ".padEnd(row)}
            </Text>
          </Box>
          <Box width={width} justifyContent="flex-end">
            <Text dimColor wrap="wrap" color={color} backgroundColor={bg} data-line-new-num={unifiedLine.newLineNumber}>
              {unifiedLine.newLineNumber
                .toString()
                .padStart(width)
                .padEnd(width * row)}
            </Text>
          </Box>
          <Box width={1}>
            <Text backgroundColor={bg} wrap="wrap">
              {" ".padEnd(row)}
            </Text>
          </Box>
        </Box>
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
  }
};

export const DiffUnifiedContentLine = ({
  index,
  width,
  theme,
  columns,
  diffFile,
  lineNumber,
  enableHighlight,
}: {
  index: number;
  width: number;
  columns: number;
  theme: "light" | "dark";
  diffFile: DiffFile;
  lineNumber: number;
  enableHighlight: boolean;
}) => {
  const unifiedLine = diffFile.getUnifiedLine(index);

  if (unifiedLine?.isHidden) return null;

  return (
    <InternalDiffUnifiedLine
      index={index}
      width={width}
      theme={theme}
      columns={columns}
      diffFile={diffFile}
      lineNumber={lineNumber}
      enableHighlight={enableHighlight}
    />
  );
};
