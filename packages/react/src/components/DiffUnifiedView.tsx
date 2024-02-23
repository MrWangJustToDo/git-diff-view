import { getUnifiedContentLine } from "@git-diff-view/core";
import * as React from "react";
import { Fragment, memo, useEffect, useMemo } from "react";
import { createStore, ref } from "reactivity-store";
import { useSyncExternalStore } from "use-sync-external-store/shim";

import { DiffUnifiedExtendLine } from "./DiffUnifiedExtendLine";
import { DiffUnifiedHunkLine } from "./DiffUnifiedHunkLine";
import { DiffUnifiedLine } from "./DiffUnifiedLine";
import { DiffUnifiedWidgetLine } from "./DiffUnifiedWidgetLine";
import { DiffWidgetContext } from "./DiffWidgetContext";
import { removeAllSelection } from "./tools";

import type { SplitSide } from "..";
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
  // performance optimization
  const useWidget = useMemo(
    () =>
      createStore(() => {
        const widgetSide = ref<SplitSide>(undefined);

        const widgetLineNumber = ref<number>(undefined);

        const setWidget = ({ side, lineNumber }: { side?: SplitSide; lineNumber?: number }) => {
          widgetSide.value = side;
          widgetLineNumber.value = lineNumber;
        };

        return { widgetSide, widgetLineNumber, setWidget };
      }),
    []
  );

  const contextValue = useMemo(() => ({ useWidget }), [useWidget]);

  useSyncExternalStore(diffFile.subscribe, diffFile.getUpdateCount);

  useEffect(() => {
    const { setWidget } = useWidget.getReadonlyState();

    setWidget({});
  }, [diffFile, useWidget]);

  const lines = getUnifiedContentLine(diffFile);

  return (
    <DiffWidgetContext.Provider value={contextValue}>
      <div className="unified-diff-view w-full">
        <div
          className="unified-diff-table-wrapper overflow-auto w-full scrollbar-hide scrollbar-disable"
          style={{ fontFamily: "Menlo, Consolas, monospace", fontSize: "var(--diff-font-size--)" }}
        >
          <table className="unified-diff-table border-collapse w-full">
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
            <tbody className="diff-table-body  leading-[1.4]" onMouseDownCapture={onMouseDown}>
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
