import { DiffModeEnum } from "@git-diff-view/utils";
import { Box } from "ink";
import { memo } from "react";

import { DiffSplitContentLine } from "./DiffSplitContentLine";
import { DiffSplitExtendLine } from "./DiffSplitExtendLine";
import { DiffSplitHunkLine } from "./DiffSplitHunkLine";
import { DiffUnifiedContentLine } from "./DiffUnifiedContentLine";
import { DiffUnifiedExtendLine } from "./DiffUnifiedExtendLine";
import { DiffUnifiedHunkLine } from "./DiffUnifiedHunkLine";

import type { ResolvedDiffViewColorTheme } from "./color";
import type { DiffDisplayEntryDescriptor } from "./diffViewScroll";
import type { ScrollSlice } from "./scroll";
import type { DiffFile } from "@git-diff-view/core";

export type DiffDisplayEntryProps = {
  entry: DiffDisplayEntryDescriptor;
  diffFile: DiffFile;
  mode: DiffModeEnum;
  theme: "light" | "dark";
  columns: number;
  lineNumWidth: number;
  enableHighlight: boolean;
  noBG?: boolean;
  themeColors: ResolvedDiffViewColorTheme;
  scrollSlice?: ScrollSlice;
  /** Full entry row count; used for extend clipping in scroll mode. */
  entryRowCount?: number;
};

export const DiffDisplayEntry = memo(
  ({
    entry,
    diffFile,
    mode,
    theme,
    columns,
    lineNumWidth,
    enableHighlight,
    noBG,
    themeColors,
    scrollSlice,
    entryRowCount,
  }: DiffDisplayEntryProps) => {
    const { kind, diffIndex, displayLineNumber } = entry;
    const isSplit = !!(mode & DiffModeEnum.Split);

    if (kind === "hunk") {
      if (isSplit) {
        return (
          <DiffSplitHunkLine
            theme={theme}
            columns={columns}
            index={diffIndex}
            diffFile={diffFile}
            lineNumber={displayLineNumber}
            lineNumWidth={lineNumWidth}
            noBG={noBG}
            themeColors={themeColors}
          />
        );
      }

      return (
        <DiffUnifiedHunkLine
          index={diffIndex}
          theme={theme}
          lineNumWidth={lineNumWidth}
          columns={columns}
          diffFile={diffFile}
          lineNumber={displayLineNumber}
          noBG={noBG}
          themeColors={themeColors}
        />
      );
    }

    if (kind === "content") {
      if (isSplit) {
        return (
          <DiffSplitContentLine
            theme={theme}
            lineNumWidth={lineNumWidth}
            columns={columns}
            index={diffIndex}
            diffFile={diffFile}
            lineNumber={displayLineNumber}
            enableHighlight={enableHighlight}
            noBG={noBG}
            themeColors={themeColors}
            scrollSlice={scrollSlice}
          />
        );
      }

      return (
        <DiffUnifiedContentLine
          index={diffIndex}
          theme={theme}
          columns={columns}
          diffFile={diffFile}
          lineNumWidth={lineNumWidth}
          lineNumber={displayLineNumber}
          enableHighlight={enableHighlight}
          noBG={noBG}
          themeColors={themeColors}
          scrollSlice={scrollSlice}
        />
      );
    }

    const extendHeight = scrollSlice?.rowCount ?? entryRowCount;

    if (isSplit) {
      return (
        <Box height={extendHeight} overflow={scrollSlice ? "hidden" : undefined}>
          <DiffSplitExtendLine
            theme={theme}
            columns={columns}
            index={diffIndex}
            diffFile={diffFile}
            lineNumber={displayLineNumber}
            noBG={noBG}
            themeColors={themeColors}
          />
        </Box>
      );
    }

    return (
      <Box height={extendHeight} overflow={scrollSlice ? "hidden" : undefined}>
        <DiffUnifiedExtendLine
          index={diffIndex}
          theme={theme}
          columns={columns}
          diffFile={diffFile}
          lineNumber={displayLineNumber}
        />
      </Box>
    );
  }
);

DiffDisplayEntry.displayName = "DiffDisplayEntry";
