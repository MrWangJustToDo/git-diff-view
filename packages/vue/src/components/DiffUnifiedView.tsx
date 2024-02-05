import { getUnifiedContentLine } from "@git-diff-view/core";
import { Fragment } from "vue";

import { DiffUnifiedExtendLine } from "./DiffUnifiedExtendLine";
import { DiffUnifiedLastHunkLine, DiffUnifiedHunkLine } from "./DiffUnifiedHunkLine";
import { DiffUnifiedLine } from "./DiffUnifiedLine";
import { DiffUnifiedWidgetLine } from "./DiffUnifiedWidgetLine";
import { removeAllSelection } from "./tools";

import type { DiffFile } from "@git-diff-view/core";

const onMouseDown = (e: MouseEvent) => {
  const ele = e.target;

  // need remove all the selection
  if (ele && ele instanceof HTMLElement && ele.nodeName === "BUTTON") {
    removeAllSelection();
    return;
  }
};

export const DiffUnifiedView = ({ diffFile }: { diffFile: DiffFile }) => {
  const lines = getUnifiedContentLine(diffFile);

  return (
    <div class="unified-diff-view w-full">
      <div
        class="unified-diff-table-wrapper overflow-auto w-full scrollbar-hide"
        style={{ fontFamily: "Menlo, Consolas, monospace", fontSize: "var(--diff-font-size--)" }}
      >
        <table class="unified-diff-table border-collapse w-full">
          <colgroup>
            <col class="unified-diff-table-num-col" />
            <col class="unified-diff-table-content-col" />
          </colgroup>
          <thead class="hidden">
            <tr>
              <th scope="col">line number</th>
              <th scope="col">line content</th>
            </tr>
          </thead>
          <tbody class="diff-table-body leading-[1.4]" onMousedown={onMouseDown}>
            {lines.map((item) => (
              <Fragment key={item.index}>
                <DiffUnifiedHunkLine index={item.index} lineNumber={item.lineNumber} diffFile={diffFile} />
                <DiffUnifiedLine index={item.index} lineNumber={item.lineNumber} diffFile={diffFile} />
                <DiffUnifiedWidgetLine index={item.index} lineNumber={item.lineNumber} diffFile={diffFile} />
                <DiffUnifiedExtendLine index={item.index} lineNumber={item.lineNumber} diffFile={diffFile} />
              </Fragment>
            ))}
            <DiffUnifiedLastHunkLine diffFile={diffFile} />
          </tbody>
        </table>
      </div>
    </div>
  );
};
