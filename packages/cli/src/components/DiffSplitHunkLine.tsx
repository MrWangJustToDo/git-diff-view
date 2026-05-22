import { type DiffFile } from "@git-diff-view/core";
import { Box, Text } from "ink";

import { DiffModeEnum } from "..";

import { useDiffViewContext } from "./DiffViewContext";

import type { ResolvedDiffViewColorTheme } from "./color";

const DiffSplitHunkLineGitHub = ({
  index,
  theme,
  columns,
  diffFile,
  lineNumber,
  lineNumWidth,
  noBG,
  themeColors,
}: {
  index: number;
  theme: "light" | "dark";
  columns: number;
  diffFile: DiffFile;
  lineNumber: number;
  lineNumWidth: number;
  noBG?: boolean;
  themeColors: ResolvedDiffViewColorTheme;
}) => {
  const currentHunk = diffFile.getSplitHunkLine(index);

  const hunkLineNumberBG = noBG
    ? undefined
    : theme === "light"
      ? themeColors.hunkLineNumber.light
      : themeColors.hunkLineNumber.dark;

  const hunkContentBG = noBG
    ? undefined
    : theme === "light"
      ? themeColors.hunkContent.light
      : themeColors.hunkContent.dark;

  const hunkContentColor = theme === "light" ? themeColors.hunkContentColor.light : themeColors.hunkContentColor.dark;

  const contentWidth = columns - lineNumWidth - 2;

  return (
    <Box data-line={`${lineNumber}-hunk`} data-state="hunk" height={1}>
      <Box width={lineNumWidth + 2}>
        <Text backgroundColor={hunkLineNumberBG}>{" ".padEnd(lineNumWidth + 2)}</Text>
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
  theme,
  columns,
  diffFile,
  lineNumber,
  lineNumWidth,
  noBG,
  themeColors,
}: {
  index: number;
  theme: "light" | "dark";
  columns: number;
  diffFile: DiffFile;
  lineNumber: number;
  lineNumWidth: number;
  noBG?: boolean;
  themeColors: ResolvedDiffViewColorTheme;
}) => {
  const currentHunk = diffFile.getSplitHunkLine(index);

  const hunkLineNumberBG = noBG
    ? undefined
    : theme === "light"
      ? themeColors.hunkLineNumber.light
      : themeColors.hunkLineNumber.dark;

  const hunkContentBG = noBG
    ? undefined
    : theme === "light"
      ? themeColors.hunkContent.light
      : themeColors.hunkContent.dark;

  const hunkContentColor = theme === "light" ? themeColors.hunkContentColor.light : themeColors.hunkContentColor.dark;

  const contentWidth = columns / 2 - lineNumWidth - 2;

  return (
    <Box data-line={`${lineNumber}-hunk`} data-state="hunk" height={1}>
      <Box width={lineNumWidth + 2}>
        <Text backgroundColor={hunkLineNumberBG}>{" ".padEnd(lineNumWidth + 2)}</Text>
      </Box>
      <Box width={contentWidth}>
        <Text backgroundColor={hunkContentBG} color={hunkContentColor} wrap="truncate">
          {(currentHunk.splitInfo?.plainText || currentHunk.text || "").padEnd(contentWidth)}
        </Text>
      </Box>
      <Box width={lineNumWidth + 2}>
        <Text backgroundColor={hunkLineNumberBG}>{" ".padEnd(lineNumWidth + 2)}</Text>
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
  theme,
  columns,
  diffFile,
  lineNumber,
  lineNumWidth,
  noBG,
  themeColors,
}: {
  index: number;
  theme: "light" | "dark";
  columns: number;
  diffFile: DiffFile;
  lineNumber: number;
  lineNumWidth: number;
  noBG?: boolean;
  themeColors: ResolvedDiffViewColorTheme;
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
        theme={theme}
        columns={columns}
        diffFile={diffFile}
        lineNumber={lineNumber}
        lineNumWidth={lineNumWidth}
        noBG={noBG}
        themeColors={themeColors}
      />
    );
  } else {
    return (
      <DiffSplitHunkLineGitLab
        index={index}
        theme={theme}
        columns={columns}
        diffFile={diffFile}
        lineNumber={lineNumber}
        lineNumWidth={lineNumWidth}
        noBG={noBG}
        themeColors={themeColors}
      />
    );
  }
};

export const DiffSplitHunkLine = ({
  index,
  theme,
  columns,
  diffFile,
  lineNumber,
  lineNumWidth,
  noBG,
  themeColors,
}: {
  index: number;
  theme: "light" | "dark";
  columns: number;
  diffFile: DiffFile;
  lineNumber: number;
  lineNumWidth: number;
  noBG?: boolean;
  themeColors: ResolvedDiffViewColorTheme;
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
      theme={theme}
      columns={columns}
      diffFile={diffFile}
      lineNumber={lineNumber}
      lineNumWidth={lineNumWidth}
      noBG={noBG}
      themeColors={themeColors}
    />
  );
};
