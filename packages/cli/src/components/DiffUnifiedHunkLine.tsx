import { Box, Text } from "ink";
import * as React from "react";

import { diffHunkContent, diffHunkContentColor, diffHunkLineNumber } from "./color";

import type { DiffFile } from "@git-diff-view/core";

const InternalDiffUnifiedHunkLine = ({
  index,
  width,
  theme,
  columns,
  diffFile,
  lineNumber,
}: {
  index: number;
  width: number;
  theme: "light" | "dark";
  columns: number;
  diffFile: DiffFile;
  lineNumber: number;
}) => {
  const currentHunk = diffFile.getUnifiedHunkLine(index);

  const hunkLineNumberBG = theme === "light" ? diffHunkLineNumber.light : diffHunkLineNumber.dark;

  const hunkContentBG = theme === "light" ? diffHunkContent.light : diffHunkContent.dark;

  const hunkContentColor = theme === "light" ? diffHunkContentColor.light : diffHunkContentColor.dark;

  const contentWidth = columns - width * 2 - 2;

  return (
    <Box data-line={`${lineNumber}-hunk`} data-state="hunk" height={1}>
      <Box width={width * 2 + 2} flexShrink={0}>
        <Text backgroundColor={hunkLineNumberBG}>{" ".padEnd(width * 2 + 2)}</Text>
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
  width,
  theme,
  columns,
  diffFile,
  lineNumber,
}: {
  index: number;
  width: number;
  theme: "light" | "dark";
  columns: number;
  diffFile: DiffFile;
  lineNumber: number;
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
      width={width}
      columns={columns}
      diffFile={diffFile}
      lineNumber={lineNumber}
    />
  );
};
