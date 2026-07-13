import { DiffModeEnum } from "@git-diff-view/utils";
import { Box } from "ink";
import { Fragment, memo } from "react";

import { DiffSplitContentLine } from "./DiffSplitContentLine";
import { DiffSplitExtendLine } from "./DiffSplitExtendLine";
import { DiffSplitHunkLine } from "./DiffSplitHunkLine";
import { DiffUnifiedContentLine } from "./DiffUnifiedContentLine";
import { DiffUnifiedExtendLine } from "./DiffUnifiedExtendLine";
import { DiffUnifiedHunkLine } from "./DiffUnifiedHunkLine";
import { getDiffContentLineNumber, type VisibleDiffScrollLine } from "./diffViewScroll";

import type { ResolvedDiffViewColorTheme } from "./color";
import type { DiffFile } from "@git-diff-view/core";

type DiffScrollEntryViewProps = {
  entry: VisibleDiffScrollLine;
  diffFile: DiffFile;
  mode: DiffModeEnum;
  theme: "light" | "dark";
  columns: number;
  lineNumWidth: number;
  enableHighlight: boolean;
  noBG?: boolean;
  themeColors: ResolvedDiffViewColorTheme;
};

export const DiffScrollEntryView = memo(
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
  }: DiffScrollEntryViewProps) => {
    const displayLineNumber = getDiffContentLineNumber(diffFile, entry.diffIndex, mode);
    const scrollSlice = entry.clip;
    const key = `${entry.kind}-${entry.diffIndex}-${entry.lineNumber}-${scrollSlice?.rowOffset ?? 0}`;

    if (entry.kind === "hunk") {
      if (mode & DiffModeEnum.Split) {
        return (
          <DiffSplitHunkLine
            key={key}
            theme={theme}
            columns={columns}
            index={entry.diffIndex}
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
          key={key}
          index={entry.diffIndex}
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

    if (entry.kind === "content") {
      if (mode & DiffModeEnum.Split) {
        return (
          <DiffSplitContentLine
            key={key}
            theme={theme}
            lineNumWidth={lineNumWidth}
            columns={columns}
            index={entry.diffIndex}
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
          key={key}
          index={entry.diffIndex}
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

    const extendHeight = scrollSlice?.rowCount ?? entry.endRow - entry.startRow;

    if (mode & DiffModeEnum.Split) {
      return (
        <Box key={key} height={extendHeight} overflow={scrollSlice ? "hidden" : undefined}>
          <DiffSplitExtendLine
            theme={theme}
            columns={columns}
            index={entry.diffIndex}
            diffFile={diffFile}
            lineNumber={displayLineNumber}
            noBG={noBG}
            themeColors={themeColors}
          />
        </Box>
      );
    }

    return (
      <Box key={key} height={extendHeight} overflow={scrollSlice ? "hidden" : undefined}>
        <DiffUnifiedExtendLine
          index={entry.diffIndex}
          theme={theme}
          columns={columns}
          diffFile={diffFile}
          lineNumber={displayLineNumber}
        />
      </Box>
    );
  }
);

DiffScrollEntryView.displayName = "DiffScrollEntryView";

export const DiffScrollEntryList = memo(
  ({
    entries,
    diffFile,
    mode,
    theme,
    columns,
    lineNumWidth,
    enableHighlight,
    noBG,
    themeColors,
  }: Omit<DiffScrollEntryViewProps, "entry"> & { entries: VisibleDiffScrollLine[] }) => {
    return (
      <>
        {entries.map((entry) => (
          <Fragment key={`${entry.kind}-${entry.diffIndex}-${entry.lineNumber}-${entry.clip?.rowOffset ?? 0}`}>
            <DiffScrollEntryView
              entry={entry}
              diffFile={diffFile}
              mode={mode}
              theme={theme}
              columns={columns}
              lineNumWidth={lineNumWidth}
              enableHighlight={enableHighlight}
              noBG={noBG}
              themeColors={themeColors}
            />
          </Fragment>
        ))}
      </>
    );
  }
);

DiffScrollEntryList.displayName = "DiffScrollEntryList";
