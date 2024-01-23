import { numIterator } from "@git-diff-view/core";
import { Fragment } from "vue";

import { DiffUnifiedExtendLine } from "./DiffUnifiedExtendLine";
import { DiffUnifiedExpandLastLine, DiffUnifiedHunkLine } from "./DiffUnifiedHunkLine";
import { DiffUnifiedLine } from "./DiffUnifiedLine";
import { DiffUnifiedWidgetLine } from "./DiffUnifiedWidgetLine";

import type { DiffFileExtends } from "../utils";
import type { DiffFile } from "@git-diff-view/core";

export const DiffUnifiedView = ({ diffFile }: { diffFile: DiffFile }) => {
  const unifiedLineLength = diffFile.unifiedLineLength;

  return (
    <div class="unified-diff-view w-full">
      <div class="unified-diff-table-wrapper overflow-auto w-full">
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
          <tbody
            class="leading-[1.4]"
            style={{
              fontFamily: "Menlo, Consolas, monospace",
              fontSize: "var(--diff-font-size--)",
            }}
          >
            {numIterator(unifiedLineLength, (index) => (
              <Fragment key={index}>
                <DiffUnifiedHunkLine index={index} lineNumber={index + 1} diffFile={diffFile} />
                <DiffUnifiedLine index={index} lineNumber={index + 1} diffFile={diffFile} />
                <DiffUnifiedWidgetLine index={index} lineNumber={index + 1} diffFile={diffFile as DiffFileExtends} />
                <DiffUnifiedExtendLine index={index} lineNumber={index + 1} diffFile={diffFile as DiffFileExtends} />
              </Fragment>
            ))}
            <DiffUnifiedExpandLastLine diffFile={diffFile} />
          </tbody>
        </table>
      </div>
    </div>
  );
};
