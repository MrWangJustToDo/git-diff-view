import { Box, Text } from "ink";

import type { ResolvedDiffViewColorTheme } from "./color";
import type { DiffFile } from "@git-diff-view/core";

const InternalDiffUnifiedHunkLine = ({
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
  const currentHunk = diffFile.getUnifiedHunkLine(index);

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
      noBG={noBG}
      themeColors={themeColors}
    />
  );
};
