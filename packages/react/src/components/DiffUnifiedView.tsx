/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getUnifiedContentLine } from "@git-diff-view/core";
import * as React from "react";
import { Fragment, memo, useEffect, useMemo, useCallback, useRef } from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim/index.js";

import { useDiffViewContext } from "..";
import { useTextWidth } from "../hooks/useTextWidth";

import { DiffUnifiedExtendLine } from "./DiffUnifiedExtendLine";
import { DiffUnifiedHunkLine } from "./DiffUnifiedHunkLine";
import { DiffUnifiedLine } from "./DiffUnifiedLine";
import { DiffUnifiedWidgetLine } from "./DiffUnifiedWidgetLine";
import { DiffWidgetContext } from "./DiffWidgetContext";
import { createDiffWidgetStore, diffAsideWidthName, diffFontSizeName, removeAllSelection } from "./tools";

import type { DiffFile } from "@git-diff-view/core";
import type { MouseEventHandler } from "react";

const onMouseDown: MouseEventHandler<HTMLTableSectionElement> = (e) => {
  const ele = e.target;

  // need remove all the selection
  if (ele && ele instanceof HTMLElement && ele.nodeName === "BUTTON") {
    removeAllSelection();
    return;
  }
};

export const DiffUnifiedView = memo(({ diffFile }: { diffFile: DiffFile }) => {
  const { useDiffContext } = useDiffViewContext();

  const useDiffContextRef = useRef(useDiffContext);

  useDiffContextRef.current = useDiffContext;

  // performance optimization
  const useWidget = useMemo(() => createDiffWidgetStore(useDiffContextRef), []);

  const contextValue = useMemo(() => ({ useWidget }), [useWidget]);

  const fontSize = useDiffContext(useCallback((s) => s.fontSize, []));

  useSyncExternalStore(diffFile.subscribe, diffFile.getUpdateCount);

  useEffect(() => {
    const { setWidget } = useWidget.getReadonlyState();

    setWidget({});
  }, [diffFile, useWidget]);

  const unifiedLineLength = Math.max(diffFile.unifiedLineLength, diffFile.fileLineLength);

  const _width = useTextWidth({
    text: unifiedLineLength.toString(),
    font: useMemo(() => ({ fontSize: fontSize + "px", fontFamily: "Menlo, Consolas, monospace" }), [fontSize]),
  });

  const width = Math.max(40, _width + 10);

  const lines = getUnifiedContentLine(diffFile);

  return (
    <DiffWidgetContext.Provider value={contextValue}>
      <div className="unified-diff-view w-full">
        <div
          className="unified-diff-table-wrapper diff-table-scroll-container w-full overflow-x-auto overflow-y-hidden"
          style={{
            // @ts-ignore
            [diffAsideWidthName]: `${Math.round(width)}px`,
            fontFamily: "Menlo, Consolas, monospace",
            fontSize: `var(${diffFontSizeName})`,
          }}
        >
          <table className="unified-diff-table w-full border-collapse">
            <colgroup>
              <col className="unified-diff-table-num-col" />
              <col className="unified-diff-table-content-col" />
            </colgroup>
            <thead className="hidden">
              <tr>
                <th scope="col">line number</th>
                <th scope="col">line content</th>
              </tr>
            </thead>
            <tbody className="diff-table-body leading-[1.4]" onMouseDownCapture={onMouseDown}>
              {lines.map((item) => (
                <Fragment key={item.index}>
                  <DiffUnifiedHunkLine index={item.index} lineNumber={item.lineNumber} diffFile={diffFile} />
                  <DiffUnifiedLine index={item.index} lineNumber={item.lineNumber} diffFile={diffFile} />
                  <DiffUnifiedWidgetLine index={item.index} lineNumber={item.lineNumber} diffFile={diffFile} />
                  <DiffUnifiedExtendLine index={item.index} lineNumber={item.lineNumber} diffFile={diffFile} />
                </Fragment>
              ))}
              <DiffUnifiedHunkLine
                index={diffFile.unifiedLineLength}
                lineNumber={diffFile.unifiedLineLength}
                diffFile={diffFile}
              />
            </tbody>
          </table>
        </div>
      </div>
    </DiffWidgetContext.Provider>
  );
});

DiffUnifiedView.displayName = "DiffUnifiedView";
