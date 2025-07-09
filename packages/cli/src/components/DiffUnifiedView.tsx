/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getUnifiedContentLine } from "@git-diff-view/core";
import * as React from "react";
import { Fragment, memo } from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim/index.js";

import { useTerminalSize } from "../hooks/useTerminalSize";

import { DiffUnifiedContentLine } from "./DiffUnifiedContentLine";
import { DiffUnifiedHunkLine } from "./DiffUnifiedHunkLine";
import { useDiffViewContext } from "./DiffViewContext";

import type { DiffFile } from "@git-diff-view/core";

export const DiffUnifiedView = memo(({ diffFile }: { diffFile: DiffFile }) => {
  const { useDiffContext } = useDiffViewContext();

  const enableHighlight = useDiffContext.useShallowStableSelector((s) => s.enableHighlight);

  useSyncExternalStore(diffFile.subscribe, diffFile.getUpdateCount, diffFile.getUpdateCount);

  const theme = diffFile._getTheme();

  const { columns } = useTerminalSize();

  const unifiedLineLength = Math.max(diffFile.unifiedLineLength, diffFile.fileLineLength);

  const width = unifiedLineLength.toString().length;

  const lines = getUnifiedContentLine(diffFile);

  return (
    <>
      {lines.map((item) => (
        <Fragment key={item.index}>
          <DiffUnifiedHunkLine
            index={item.index}
            theme={theme}
            width={width}
            columns={columns}
            diffFile={diffFile}
            lineNumber={item.lineNumber}
          />
          <DiffUnifiedContentLine
            index={item.index}
            theme={theme}
            width={width}
            columns={columns}
            diffFile={diffFile}
            lineNumber={item.lineNumber}
            enableHighlight={enableHighlight}
          />
        </Fragment>
      ))}
      <DiffUnifiedHunkLine
        theme={theme}
        width={width}
        columns={columns}
        diffFile={diffFile}
        index={diffFile.unifiedLineLength}
        lineNumber={diffFile.unifiedLineLength}
      />
    </>
  );
});

DiffUnifiedView.displayName = "DiffUnifiedView";
