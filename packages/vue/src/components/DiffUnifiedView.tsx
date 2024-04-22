import { getUnifiedContentLine } from "@git-diff-view/core";
import { Fragment, computed, defineComponent, ref } from "vue";

import { useFontSize } from "../context";
import { useSubscribeDiffFile } from "../hooks/useSubscribeDiffFile";
import { useTextWidth } from "../hooks/useTextWidth";

import { DiffUnifiedExtendLine } from "./DiffUnifiedExtendLine";
import { DiffUnifiedHunkLine } from "./DiffUnifiedHunkLine";
import { DiffUnifiedLine } from "./DiffUnifiedLine";
import { DiffUnifiedWidgetLine } from "./DiffUnifiedWidgetLine";
import { diffFontSizeName } from "./DiffView";
import { asideWidth, removeAllSelection } from "./tools";

import type { DiffFile } from "@git-diff-view/core";

const onMouseDown = (e: MouseEvent) => {
  const ele = e.target;

  // need remove all the selection
  if (ele && ele instanceof HTMLElement && ele.nodeName === "BUTTON") {
    removeAllSelection();
    return;
  }
};

export const DiffUnifiedView = defineComponent(
  (props: { diffFile: DiffFile }) => {
    const lines = ref(getUnifiedContentLine(props.diffFile));

    const maxText = ref(props.diffFile.unifiedLineLength.toString());

    useSubscribeDiffFile(props, (diffFile) => {
      lines.value = getUnifiedContentLine(diffFile);
      maxText.value = Math.max(diffFile.splitLineLength, diffFile.fileLineLength).toString();
    });

    const fontSize = useFontSize();

    const font = computed(() => ({ fontSize: fontSize.value + "px", fontFamily: "Menlo, Consolas, monospace" }));

    const width = useTextWidth({ text: maxText, font });

    const computedWidth = computed(() => Math.max(40, width.value + 25));

    return () => (
      <div class="unified-diff-view w-full">
        <div
          class="unified-diff-table-wrapper overflow-x-auto overflow-y-hidden w-full scrollbar-hide"
          style={{
            [asideWidth]: `${Math.round(computedWidth.value)}px`,
            fontFamily: "Menlo, Consolas, monospace",
            fontSize: `var(${diffFontSizeName})`,
          }}
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
              {lines.value.map((item) => (
                <Fragment key={item.index}>
                  <DiffUnifiedHunkLine index={item.index} lineNumber={item.lineNumber} diffFile={props.diffFile} />
                  <DiffUnifiedLine index={item.index} lineNumber={item.lineNumber} diffFile={props.diffFile} />
                  <DiffUnifiedWidgetLine index={item.index} lineNumber={item.lineNumber} diffFile={props.diffFile} />
                  <DiffUnifiedExtendLine index={item.index} lineNumber={item.lineNumber} diffFile={props.diffFile} />
                </Fragment>
              ))}
              <DiffUnifiedHunkLine
                index={props.diffFile.unifiedLineLength}
                lineNumber={props.diffFile.unifiedLineLength}
                diffFile={props.diffFile}
              />
            </tbody>
          </table>
        </div>
      </div>
    );
  },
  { props: ["diffFile"], name: "DiffUnifiedView" }
);
