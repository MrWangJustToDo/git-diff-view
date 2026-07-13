import { getUnifiedContentLine } from "@git-diff-view/core";
import { DiffModeEnum } from "@git-diff-view/utils";
import { Box } from "ink";
import { Fragment, memo } from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useSyncExternalStore } from "use-sync-external-store/shim/index.js";

import { useTerminalSize } from "../hooks/useTerminalSize";

import { DiffScrollEntryList } from "./DiffScrollEntryView";
import { DiffUnifiedContentLine } from "./DiffUnifiedContentLine";
import { DiffUnifiedExtendLine } from "./DiffUnifiedExtendLine";
import { DiffUnifiedHunkLine } from "./DiffUnifiedHunkLine";
import { useDiffViewContext } from "./DiffViewContext";

import type { VisibleDiffScrollLine } from "./diffViewScroll";
import type { DiffFile } from "@git-diff-view/core";

export const DiffUnifiedView = memo(
  ({
    diffFile,
    width,
    visibleEntries,
    hasFixedHeight,
    viewportHeight,
  }: {
    diffFile: DiffFile;
    width?: number;
    visibleEntries?: VisibleDiffScrollLine[];
    hasFixedHeight?: boolean;
    viewportHeight?: number;
  }) => {
    const { useDiffContext } = useDiffViewContext();

    const { enableHighlight, noBG, themeColors } = useDiffContext.useShallowStableSelector((s) => ({
      enableHighlight: s.enableHighlight,
      noBG: s.noBG,
      themeColors: s.themeColors,
    }));

    useSyncExternalStore(diffFile.subscribe, diffFile.getUpdateCount, diffFile.getUpdateCount);

    const theme = diffFile._getTheme();

    const { columns: _columns } = useTerminalSize();

    const unifiedLineLength = Math.max(diffFile.unifiedLineLength, diffFile.fileLineLength);

    const lineNumWidth = unifiedLineLength.toString().length;

    const lines = getUnifiedContentLine(diffFile);

    const columns = width || _columns;

    if (!columns) return null;

    if (hasFixedHeight && visibleEntries) {
      return (
        <Box height={viewportHeight} overflow="hidden" flexDirection="column">
          <DiffScrollEntryList
            entries={visibleEntries}
            diffFile={diffFile}
            mode={DiffModeEnum.Unified}
            theme={theme}
            columns={columns}
            lineNumWidth={lineNumWidth}
            enableHighlight={enableHighlight}
            noBG={noBG}
            themeColors={themeColors}
          />
        </Box>
      );
    }

    return (
      <>
        {lines.map((item, index) => (
          <Fragment key={item.index}>
            {index !== 0 && (
              <DiffUnifiedHunkLine
                index={item.index}
                theme={theme}
                lineNumWidth={lineNumWidth}
                columns={columns}
                diffFile={diffFile}
                lineNumber={item.lineNumber}
                noBG={noBG}
                themeColors={themeColors}
              />
            )}
            <DiffUnifiedContentLine
              index={item.index}
              theme={theme}
              columns={columns}
              diffFile={diffFile}
              lineNumWidth={lineNumWidth}
              lineNumber={item.lineNumber}
              enableHighlight={enableHighlight}
              noBG={noBG}
              themeColors={themeColors}
            />
            <DiffUnifiedExtendLine
              index={item.index}
              theme={theme}
              columns={columns}
              diffFile={diffFile}
              lineNumber={item.lineNumber}
            />
          </Fragment>
        ))}
      </>
    );
  }
);

DiffUnifiedView.displayName = "DiffUnifiedView";
