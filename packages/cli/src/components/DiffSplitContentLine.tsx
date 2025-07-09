import { DiffLineType, type DiffFile, checkDiffLineIncludeChange } from "@git-diff-view/core";
import { NewLineSymbol } from "@git-diff-view/utils";
import { Box, Text } from "ink";
import * as React from "react";

import {
  diffAddLineNumber,
  diffDelLineNumber,
  diffEmptyContent,
  diffExpandLineNumber,
  diffExpandLineNumberColor,
  diffPlainLineNumber,
  diffPlainLineNumberColor,
} from "./color";
import { DiffContent } from "./DiffContent";
import { getCurrentLineRow } from "./tools";

const InternalDiffSplitLine = ({
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
  const oldLine = diffFile.getSplitLeftLine(index);

  const newLine = diffFile.getSplitRightLine(index);

  const oldSyntaxLine = diffFile.getOldSyntaxLine(oldLine?.lineNumber);

  const oldPlainLine = diffFile.getOldPlainLine(oldLine.lineNumber);

  const newSyntaxLine = diffFile.getNewSyntaxLine(newLine?.lineNumber);

  const newPlainLine = diffFile.getNewPlainLine(newLine.lineNumber);

  const hasDiff = !!oldLine?.diff || !!newLine?.diff;

  const hasChange = checkDiffLineIncludeChange(oldLine?.diff) || checkDiffLineIncludeChange(newLine?.diff);

  const oldLineIsDelete = oldLine?.diff?.type === DiffLineType.Delete;

  const newLineIsAdded = newLine?.diff?.type === DiffLineType.Add;

  const hasOldLine = !!oldLine.lineNumber;

  const hasNewLine = !!newLine.lineNumber;

  const emptyBG = theme === "light" ? diffEmptyContent.light : diffEmptyContent.dark;

  const halfColumns = columns / 2;

  let oldRow = getCurrentLineRow({ content: oldLine?.value || "", width: halfColumns - width - 1 });

  let newRow = getCurrentLineRow({ content: newLine?.value || "", width: halfColumns - width - 1 });

  oldRow =
    oldLine?.diff?.changes?.hasLineChange && oldLine?.diff?.changes.newLineSymbol === NewLineSymbol.NEWLINE
      ? oldRow + 1
      : oldRow;

  newRow =
    newLine?.diff?.changes?.hasLineChange && newLine?.diff?.changes.newLineSymbol === NewLineSymbol.NEWLINE
      ? newRow + 1
      : newRow;

  const row = Math.max(oldRow, newRow);

  const contentWidth = columns / 2 - width - 2;

  const oldLineNumberBG = oldLineIsDelete
    ? theme === "light"
      ? diffDelLineNumber.light
      : diffDelLineNumber.dark
    : hasDiff
      ? theme === "light"
        ? diffPlainLineNumber.light
        : diffPlainLineNumber.dark
      : theme === "light"
        ? diffExpandLineNumber.light
        : diffExpandLineNumber.dark;

  const newLineNumberBG = newLineIsAdded
    ? theme === "light"
      ? diffAddLineNumber.light
      : diffAddLineNumber.dark
    : hasDiff
      ? theme === "light"
        ? diffPlainLineNumber.light
        : diffPlainLineNumber.dark
      : theme === "light"
        ? diffExpandLineNumber.light
        : diffExpandLineNumber.dark;

  const color = hasDiff
    ? theme === "light"
      ? diffPlainLineNumberColor.light
      : diffPlainLineNumberColor.dark
    : theme === "light"
      ? diffExpandLineNumberColor.light
      : diffExpandLineNumberColor.dark;

  return (
    <Box data-line={lineNumber} data-state={hasDiff ? "diff" : "plain"} height={row} width={columns}>
      {hasOldLine ? (
        <>
          <Box width={width + 2} flexShrink={0}>
            <Box width={1}>
              <Text backgroundColor={oldLineNumberBG} wrap="wrap">
                {" ".padEnd(row)}
              </Text>
            </Box>
            <Box width={width} justifyContent="flex-end">
              <Text dimColor={!hasChange} wrap="wrap" color={color} backgroundColor={oldLineNumberBG}>
                {oldLine.lineNumber
                  .toString()
                  .padStart(width)
                  .padEnd(row * width)}
              </Text>
            </Box>
            <Box width={1}>
              <Text backgroundColor={oldLineNumberBG} wrap="wrap">
                {" ".padEnd(row)}
              </Text>
            </Box>
          </Box>
          <DiffContent
            theme={theme}
            height={row}
            diffFile={diffFile}
            width={contentWidth}
            rawLine={oldLine.value}
            diffLine={oldLine.diff}
            plainLine={oldPlainLine}
            syntaxLine={oldSyntaxLine}
            enableHighlight={enableHighlight}
          />
        </>
      ) : (
        <Box width={halfColumns}>
          <Text backgroundColor={emptyBG} wrap="wrap">
            {" ".padEnd(halfColumns * row)}
          </Text>
        </Box>
      )}
      {hasNewLine ? (
        <>
          <Box width={width + 2} flexShrink={0}>
            <Box width={1}>
              <Text backgroundColor={newLineNumberBG} wrap="wrap">
                {" ".padEnd(row)}
              </Text>
            </Box>
            <Box width={width} justifyContent="flex-end">
              <Text dimColor={!hasChange} wrap="wrap" color={color} backgroundColor={newLineNumberBG}>
                {newLine.lineNumber
                  .toString()
                  .padStart(width)
                  .padEnd(row * width)}
              </Text>
            </Box>
            <Box width={1}>
              <Text backgroundColor={newLineNumberBG} wrap="wrap">
                {" ".padEnd(row)}
              </Text>
            </Box>
          </Box>
          <DiffContent
            theme={theme}
            height={row}
            width={contentWidth}
            diffFile={diffFile}
            rawLine={newLine.value || ""}
            diffLine={newLine.diff}
            plainLine={newPlainLine}
            syntaxLine={newSyntaxLine}
            enableHighlight={enableHighlight}
          />
        </>
      ) : (
        <Box width={halfColumns}>
          <Text backgroundColor={emptyBG} wrap="wrap">
            {" ".padEnd(halfColumns * row)}
          </Text>
        </Box>
      )}
    </Box>
  );
};

export const DiffSplitContentLine = ({
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
  const oldLine = diffFile.getSplitLeftLine(index);

  const newLine = diffFile.getSplitRightLine(index);

  if (oldLine?.isHidden && newLine?.isHidden) return null;

  return (
    <InternalDiffSplitLine
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
