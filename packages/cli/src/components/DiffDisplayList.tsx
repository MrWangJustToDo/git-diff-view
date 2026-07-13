import { Box } from "ink";
import { Fragment, memo, useMemo } from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useSyncExternalStore } from "use-sync-external-store/shim/index.js";

import { useTerminalSize } from "../hooks/useTerminalSize";

import { DiffDisplayEntry } from "./DiffDisplayEntry";
import { useDiffViewContext } from "./DiffViewContext";
import {
  getDiffContentLineNumber,
  getDiffLineNumWidth,
  iterateDiffDisplayEntries,
  type DiffDisplayEntryDescriptor,
  type DiffDisplayIterateOptions,
  type VisibleDiffScrollLine,
} from "./diffViewScroll";

import type { DiffFile } from "@git-diff-view/core";
import type { DiffModeEnum } from "@git-diff-view/utils";

type DiffDisplayListProps = {
  diffFile: DiffFile;
  mode: DiffModeEnum;
  width?: number;
  extendData?: DiffDisplayIterateOptions["extendData"];
  hasRenderExtendLine?: boolean;
  visibleEntries?: VisibleDiffScrollLine[];
  hasFixedHeight?: boolean;
  viewportHeight?: number;
};

function toDisplayDescriptor(
  entry: VisibleDiffScrollLine,
  diffFile: DiffFile,
  mode: DiffModeEnum
): DiffDisplayEntryDescriptor {
  return {
    kind: entry.kind,
    diffIndex: entry.diffIndex,
    displayLineNumber: getDiffContentLineNumber(diffFile, entry.diffIndex, mode),
  };
}

export const DiffDisplayList = memo(
  ({
    diffFile,
    mode,
    width,
    extendData,
    hasRenderExtendLine,
    visibleEntries,
    hasFixedHeight,
    viewportHeight,
  }: DiffDisplayListProps) => {
    const { useDiffContext } = useDiffViewContext();

    const { enableHighlight, noBG, themeColors } = useDiffContext.useShallowStableSelector((s) => ({
      enableHighlight: s.enableHighlight,
      noBG: s.noBG,
      themeColors: s.themeColors,
    }));

    useSyncExternalStore(diffFile.subscribe, diffFile.getUpdateCount, diffFile.getUpdateCount);

    const theme = diffFile._getTheme();
    const { columns: terminalColumns } = useTerminalSize();
    const columns = width || terminalColumns || 0;
    const lineNumWidth = getDiffLineNumWidth(diffFile, mode);

    const updateCount = diffFile.getUpdateCount();

    const allEntries = useMemo(
      () =>
        iterateDiffDisplayEntries({
          diffFile,
          mode,
          extendData,
          hasRenderExtendLine,
        }),
      // updateCount triggers rebuild when diff content changes
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [diffFile, mode, extendData, hasRenderExtendLine, updateCount]
    );

    if (!columns) return null;

    const isScrollMode = hasFixedHeight && !!visibleEntries;

    const entries = isScrollMode ? visibleEntries! : allEntries;

    const list = (
      <>
        {entries.map((entry) => {
          const scrollEntry = isScrollMode ? (entry as VisibleDiffScrollLine) : undefined;
          const descriptor = scrollEntry
            ? toDisplayDescriptor(scrollEntry, diffFile, mode)
            : (entry as DiffDisplayEntryDescriptor);

          const key = scrollEntry
            ? `${descriptor.kind}-${descriptor.diffIndex}-${scrollEntry.lineNumber}-${scrollEntry.clip?.rowOffset ?? 0}`
            : `${descriptor.kind}-${descriptor.diffIndex}-${descriptor.displayLineNumber}`;

          return (
            <Fragment key={key}>
              <DiffDisplayEntry
                entry={descriptor}
                diffFile={diffFile}
                mode={mode}
                theme={theme}
                columns={columns}
                lineNumWidth={lineNumWidth}
                enableHighlight={enableHighlight}
                noBG={noBG}
                themeColors={themeColors}
                scrollSlice={scrollEntry?.clip}
                entryRowCount={scrollEntry ? scrollEntry.endRow - scrollEntry.startRow : undefined}
              />
            </Fragment>
          );
        })}
      </>
    );

    if (isScrollMode) {
      return (
        <Box height={viewportHeight} overflow="hidden" flexDirection="column">
          {list}
        </Box>
      );
    }

    return list;
  }
);

DiffDisplayList.displayName = "DiffDisplayList";
