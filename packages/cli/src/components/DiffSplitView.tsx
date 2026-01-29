import { getSplitContentLines, type DiffFile } from "@git-diff-view/core";
import { Fragment, memo } from "react";
import * as React from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim/index.js";

import { useTerminalSize } from "../hooks/useTerminalSize";

import { DiffSplitContentLine } from "./DiffSplitContentLine";
import { DiffSplitExtendLine } from "./DiffSplitExtendLine";
import { DiffSplitHunkLine } from "./DiffSplitHunkLine";
import { useDiffViewContext } from "./DiffViewContext";

export const DiffSplitView = memo(({ diffFile }: { diffFile: DiffFile }) => {
  const { useDiffContext } = useDiffViewContext();

  const enableHighlight = useDiffContext.useShallowStableSelector((s) => s.enableHighlight);

  useSyncExternalStore(diffFile.subscribe, diffFile.getUpdateCount, diffFile.getUpdateCount);

  const theme = diffFile._getTheme();

  const { columns } = useTerminalSize();

  const splitLineLength = Math.max(diffFile.splitLineLength, diffFile.fileLineLength);

  const lineNumWidth = splitLineLength.toString().length;

  const lines = getSplitContentLines(diffFile);

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
          />
          <DiffSplitContentLine
            theme={theme}
            lineNumWidth={lineNumWidth}
            columns={columns}
            index={line.index}
            diffFile={diffFile}
            lineNumber={line.lineNumber}
            enableHighlight={enableHighlight}
          />
          <DiffSplitExtendLine
            theme={theme}
            columns={columns}
            index={line.index}
            diffFile={diffFile}
            lineNumber={line.lineNumber}
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
      />
    </>
  );
});

DiffSplitView.displayName = "DiffSplitView";
