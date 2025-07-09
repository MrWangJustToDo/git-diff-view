import { type DiffFile } from "@git-diff-view/core";
import { Box, Text } from "ink";
import * as React from "react";

import { DiffModeEnum } from "..";

import { diffHunkLineNumber, diffHunkContent, diffHunkContentColor } from "./color";
import { useDiffViewContext } from "./DiffViewContext";

const DiffSplitHunkLineGitHub = ({
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
  const currentHunk = diffFile.getSplitHunkLine(index);

  const hunkLineNumberBG = theme === "light" ? diffHunkLineNumber.light : diffHunkLineNumber.dark;

  const hunkContentBG = theme === "light" ? diffHunkContent.light : diffHunkContent.dark;

  const hunkContentColor = theme === "light" ? diffHunkContentColor.light : diffHunkContentColor.dark;

  const contentWidth = columns - width - 4;

  return (
    <Box data-line={`${lineNumber}-hunk`} data-state="hunk">
      <Box width={width + 2}>
        <Text backgroundColor={hunkLineNumberBG}>{" ".padEnd(width + 2)}</Text>
      </Box>
      <Box width={contentWidth}>
        <Text backgroundColor={hunkContentBG} color={hunkContentColor} wrap="truncate">
          {(currentHunk.splitInfo?.plainText || currentHunk.text || "").padEnd(contentWidth)}
        </Text>
      </Box>
    </Box>
  );
};

const DiffSplitHunkLineGitLab = ({
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
  const currentHunk = diffFile.getSplitHunkLine(index);

  const hunkLineNumberBG = theme === "light" ? diffHunkLineNumber.light : diffHunkLineNumber.dark;

  const hunkContentBG = theme === "light" ? diffHunkContent.light : diffHunkContent.dark;

  const hunkContentColor = theme === "light" ? diffHunkContentColor.light : diffHunkContentColor.dark;

  const contentWidth = columns / 2 - width - 2 - 1;

  return (
    <Box data-line={`${lineNumber}-hunk`} data-state="hunk">
      <Box width={width + 2}>
        <Text backgroundColor={hunkLineNumberBG}>{" ".padEnd(width + 2)}</Text>
      </Box>
      <Box width={contentWidth}>
        <Text backgroundColor={hunkContentBG} color={hunkContentColor} wrap="truncate">
          {(currentHunk.splitInfo?.plainText || currentHunk.text || "").padEnd(contentWidth)}
        </Text>
      </Box>
      <Box width={width + 2}>
        <Text backgroundColor={hunkLineNumberBG}>{" ".padEnd(width + 2)}</Text>
      </Box>
      <Box width={contentWidth}>
        <Text backgroundColor={hunkContentBG} color={hunkContentColor} wrap="truncate">
          {(currentHunk.splitInfo?.plainText || currentHunk.text || "").padEnd(contentWidth)}
        </Text>
      </Box>
    </Box>
  );
};

const InternalDiffSplitHunkLine = ({
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
  const { useDiffContext } = useDiffViewContext();

  const diffViewMode = useDiffContext.useShallowStableSelector((s) => s.mode);

  if (
    diffViewMode === DiffModeEnum.SplitGitHub ||
    diffViewMode === DiffModeEnum.Split ||
    diffViewMode === DiffModeEnum.Unified
  ) {
    return (
      <DiffSplitHunkLineGitHub
        index={index}
        width={width}
        theme={theme}
        columns={columns}
        diffFile={diffFile}
        lineNumber={lineNumber}
      />
    );
  } else {
    return (
      <DiffSplitHunkLineGitLab
        index={index}
        width={width}
        theme={theme}
        columns={columns}
        diffFile={diffFile}
        lineNumber={lineNumber}
      />
    );
  }
};

export const DiffSplitHunkLine = ({
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
  const currentHunk = diffFile.getSplitHunkLine(index);

  const currentIsShow =
    currentHunk &&
    currentHunk.splitInfo &&
    currentHunk.splitInfo.startHiddenIndex < currentHunk.splitInfo.endHiddenIndex;

  const currentIsPureHunk = currentHunk && diffFile._getIsPureDiffRender() && !currentHunk.splitInfo;

  if (!currentIsShow && !currentIsPureHunk) return null;

  return (
    <InternalDiffSplitHunkLine
      index={index}
      width={width}
      theme={theme}
      columns={columns}
      diffFile={diffFile}
      lineNumber={lineNumber}
    />
  );
};
