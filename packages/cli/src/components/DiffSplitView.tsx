import { getSplitContentLines, type DiffFile } from "@git-diff-view/core";
import { Fragment, memo } from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useSyncExternalStore } from "use-sync-external-store/shim/index.js";

import { useTerminalSize } from "../hooks/useTerminalSize";

import { DiffSplitContentLine } from "./DiffSplitContentLine";
import { DiffSplitExtendLine } from "./DiffSplitExtendLine";
import { DiffSplitHunkLine } from "./DiffSplitHunkLine";
import { useDiffViewContext } from "./DiffViewContext";

export const DiffSplitView = memo(({ diffFile, width }: { diffFile: DiffFile; width?: number }) => {
  const { useDiffContext } = useDiffViewContext();

  const { enableHighlight, noBG, themeColors } = useDiffContext.useShallowStableSelector((s) => ({
    enableHighlight: s.enableHighlight,
    noBG: s.noBG,
    themeColors: s.themeColors,
  }));

  useSyncExternalStore(diffFile.subscribe, diffFile.getUpdateCount, diffFile.getUpdateCount);

  const theme = diffFile._getTheme();

  const { columns: _columns } = useTerminalSize();

  const splitLineLength = Math.max(diffFile.splitLineLength, diffFile.fileLineLength);

  const lineNumWidth = splitLineLength.toString().length;

  const lines = getSplitContentLines(diffFile);

  const columns = width || _columns;

  if (!columns) return null;

  return (
    <>
      {lines.map((line, index) => (
        <Fragment key={line.index}>
          {index !== 0 && (
            <DiffSplitHunkLine
              theme={theme}
              columns={columns}
              index={line.index}
              diffFile={diffFile}
              lineNumber={line.lineNumber}
              lineNumWidth={lineNumWidth}
              noBG={noBG}
              themeColors={themeColors}
            />
          )}
          <DiffSplitContentLine
            theme={theme}
            lineNumWidth={lineNumWidth}
            columns={columns}
            index={line.index}
            diffFile={diffFile}
            lineNumber={line.lineNumber}
            enableHighlight={enableHighlight}
            noBG={noBG}
            themeColors={themeColors}
          />
          <DiffSplitExtendLine
            theme={theme}
            columns={columns}
            index={line.index}
            diffFile={diffFile}
            lineNumber={line.lineNumber}
            noBG={noBG}
            themeColors={themeColors}
          />
        </Fragment>
      ))}
    </>
  );
});

DiffSplitView.displayName = "DiffSplitView";
