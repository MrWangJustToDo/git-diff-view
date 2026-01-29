import { Box, Text } from "ink";
import * as React from "react";

import { diffHunkContent, diffHunkContentColor, diffHunkLineNumber } from "./color";

import type { DiffFile } from "@git-diff-view/core";

const InternalDiffUnifiedHunkLine = ({
  index,
  theme,
  columns,
  diffFile,
  lineNumber,
  lineNumWidth,
}: {
  index: number;
  theme: "light" | "dark";
  columns: number;
  diffFile: DiffFile;
  lineNumber: number;
  lineNumWidth: number;
}) => {
  const currentHunk = diffFile.getUnifiedHunkLine(index);

  const hunkLineNumberBG = theme === "light" ? diffHunkLineNumber.light : diffHunkLineNumber.dark;

  const hunkContentBG = theme === "light" ? diffHunkContent.light : diffHunkContent.dark;

  const hunkContentColor = theme === "light" ? diffHunkContentColor.light : diffHunkContentColor.dark;

  const contentWidth = columns - lineNumWidth * 2 - 3;

  return (
    <Box data-line={`${lineNumber}-hunk`} data-state="hunk" height={1}>
      <Box width={lineNumWidth * 2 + 3} flexShrink={0}>
        <Text backgroundColor={hunkLineNumberBG}>{" ".padEnd(lineNumWidth * 2 + 3)}</Text>
      </Box>
      <Box width={contentWidth} flexShrink={0}>
        <Text backgroundColor={hunkContentBG} color={hunkContentColor} wrap="truncate">
          {(currentHunk.unifiedInfo?.plainText || currentHunk.text || "").padEnd(contentWidth)}
        </Text>
      </Box>
    </Box>
  );
};

export const DiffUnifiedHunkLine = ({
  index,
  theme,
  columns,
  diffFile,
  lineNumber,
  lineNumWidth,
}: {
  index: number;
  theme: "light" | "dark";
  columns: number;
  diffFile: DiffFile;
  lineNumber: number;
  lineNumWidth: number;
}) => {
  const currentHunk = diffFile.getUnifiedHunkLine(index);

  const currentIsShow =
    currentHunk &&
    currentHunk.unifiedInfo &&
    currentHunk.unifiedInfo.startHiddenIndex < currentHunk.unifiedInfo.endHiddenIndex;

  const currentIsPureHunk = currentHunk && diffFile._getIsPureDiffRender() && !currentHunk.unifiedInfo;

  if (!currentIsShow && !currentIsPureHunk) return null;

  return (
    <InternalDiffUnifiedHunkLine
      index={index}
      theme={theme}
      columns={columns}
      diffFile={diffFile}
      lineNumber={lineNumber}
      lineNumWidth={lineNumWidth}
    />
  );
};
