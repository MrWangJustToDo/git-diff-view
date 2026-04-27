import { getUnifiedContentLine } from "@git-diff-view/core";
import { Fragment, memo } from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useSyncExternalStore } from "use-sync-external-store/shim/index.js";

import { useTerminalSize } from "../hooks/useTerminalSize";

import { DiffUnifiedContentLine } from "./DiffUnifiedContentLine";
import { DiffUnifiedExtendLine } from "./DiffUnifiedExtendLine";
import { DiffUnifiedHunkLine } from "./DiffUnifiedHunkLine";
import { useDiffViewContext } from "./DiffViewContext";

import type { DiffFile } from "@git-diff-view/core";

export const DiffUnifiedView = memo(({ diffFile, width }: { diffFile: DiffFile; width?: number }) => {
  const { useDiffContext } = useDiffViewContext();

  const enableHighlight = useDiffContext.useShallowStableSelector((s) => s.enableHighlight);

  useSyncExternalStore(diffFile.subscribe, diffFile.getUpdateCount, diffFile.getUpdateCount);

  const theme = diffFile._getTheme();

  const { columns: _columns } = useTerminalSize();

  const unifiedLineLength = Math.max(diffFile.unifiedLineLength, diffFile.fileLineLength);

  const lineNumWidth = unifiedLineLength.toString().length;

  const lines = getUnifiedContentLine(diffFile);

  const columns = width || _columns;

  if (!columns) return null;

  return (
    <>
      {lines.map((item) => (
        <Fragment key={item.index}>
          <DiffUnifiedHunkLine
            index={item.index}
            theme={theme}
            lineNumWidth={lineNumWidth}
            columns={columns}
            diffFile={diffFile}
            lineNumber={item.lineNumber}
          />
          <DiffUnifiedContentLine
            index={item.index}
            theme={theme}
            columns={columns}
            diffFile={diffFile}
            lineNumWidth={lineNumWidth}
            lineNumber={item.lineNumber}
            enableHighlight={enableHighlight}
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
      <DiffUnifiedHunkLine
        theme={theme}
        columns={columns}
        diffFile={diffFile}
        index={diffFile.unifiedLineLength}
        lineNumber={diffFile.unifiedLineLength}
        lineNumWidth={lineNumWidth}
      />
    </>
  );
});

DiffUnifiedView.displayName = "DiffUnifiedView";
