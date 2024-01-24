import { numIterator } from "@git-diff-view/core";
import * as React from "react";
import { Fragment, useEffect, useMemo, useState } from "react";

import { DiffUnifiedExtendLine } from "./DiffUnifiedExtendLine";
import { DiffUnifiedExpandLastLine, DiffUnifiedHunkLine } from "./DiffUnifiedHunkLine";
import { DiffUnifiedLine } from "./DiffUnifiedLine";
import { DiffUnifiedWidgetLine } from "./DiffUnifiedWidgetLine";
import { DiffWidgetContext } from "./DiffWidgetContext";

import type { DiffWidgetContextType } from "./DiffWidgetContext";
import type { DiffFile } from "@git-diff-view/core";

export const DiffUnifiedView = ({ diffFile }: { diffFile: DiffFile }) => {
  const unifiedLineLength = diffFile.unifiedLineLength;

  const [widget, setWidget] = useState<DiffWidgetContextType>({});

  const contextValue = useMemo(() => ({ widget, setWidget }), [widget, setWidget]);

  useEffect(() => {
    setWidget({});
  }, [diffFile]);

  return (
    <DiffWidgetContext.Provider value={contextValue}>
      <div className="unified-diff-view w-full">
        <div className="unified-diff-table-wrapper overflow-auto w-full">
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
            <tbody
              className="leading-[1.4]"
              style={{
                fontFamily: "Menlo, Consolas, monospace",
                fontSize: "var(--diff-font-size--)",
              }}
            >
              {numIterator(unifiedLineLength, (index) => (
                <Fragment key={index}>
                  <DiffUnifiedHunkLine index={index} lineNumber={index + 1} diffFile={diffFile} />
                  <DiffUnifiedLine index={index} lineNumber={index + 1} diffFile={diffFile} />
                  <DiffUnifiedWidgetLine index={index} lineNumber={index + 1} diffFile={diffFile} />
                  <DiffUnifiedExtendLine index={index} lineNumber={index + 1} diffFile={diffFile} />
                </Fragment>
              ))}
              <DiffUnifiedExpandLastLine diffFile={diffFile} />
            </tbody>
          </table>
        </div>
      </div>
    </DiffWidgetContext.Provider>
  );
};
