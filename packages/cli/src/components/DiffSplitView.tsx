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

  const { enableHighlight, noBG } = useDiffContext.useShallowStableSelector((s) => ({
    enableHighlight: s.enableHighlight,
    noBG: s.noBG,
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
      {lines.map((line) => (
        <Fragment key={line.index}>
          <DiffSplitHunkLine
            theme={theme}
            columns={columns}
            index={line.index}
            diffFile={diffFile}
            lineNumber={line.lineNumber}
            lineNumWidth={lineNumWidth}
            noBG={noBG}
          />
          <DiffSplitContentLine
            theme={theme}
            lineNumWidth={lineNumWidth}
            columns={columns}
            index={line.index}
            diffFile={diffFile}
            lineNumber={line.lineNumber}
            enableHighlight={enableHighlight}
            noBG={noBG}
          />
          <DiffSplitExtendLine
            theme={theme}
            columns={columns}
            index={line.index}
            diffFile={diffFile}
            lineNumber={line.lineNumber}
            noBG={noBG}
          />
        </Fragment>
      ))}
      <DiffSplitHunkLine
        theme={theme}
        columns={columns}
        diffFile={diffFile}
        index={diffFile.splitLineLength}
        lineNumber={diffFile.splitLineLength}
        lineNumWidth={lineNumWidth}
        noBG={noBG}
      />
    </>
  );
});

DiffSplitView.displayName = "DiffSplitView";
