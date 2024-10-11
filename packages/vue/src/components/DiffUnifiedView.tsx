import { getUnifiedContentLine } from "@git-diff-view/core";
import { Fragment, computed, defineComponent, ref } from "vue";

import { useEnableWrap, useFontSize } from "../context";
import { useSubscribeDiffFile } from "../hooks/useSubscribeDiffFile";
import { useTextWidth } from "../hooks/useTextWidth";

import { DiffUnifiedContentLine } from "./DiffUnifiedContentLine";
import { DiffUnifiedExtendLine } from "./DiffUnifiedExtendLine";
import { DiffUnifiedHunkLine } from "./DiffUnifiedHunkLine";
import { DiffUnifiedWidgetLine } from "./DiffUnifiedWidgetLine";
import { diffAsideWidthName, diffFontSizeName, removeAllSelection } from "./tools";

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

    const enableWrap = useEnableWrap();

    const font = computed(() => ({ fontSize: fontSize.value + "px", fontFamily: "Menlo, Consolas, monospace" }));

    const width = useTextWidth({ text: maxText, font });

    const computedWidth = computed(() => Math.max(40, width.value + 10));

    return () => (
      <div
        class={`unified-diff-view ${enableWrap.value ? "unified-diff-view-wrap" : "unified-diff-view-normal"} w-full`}
      >
        <div
          class="unified-diff-table-wrapper diff-table-scroll-container w-full overflow-x-auto overflow-y-hidden"
          style={{
            [diffAsideWidthName]: `${Math.round(computedWidth.value)}px`,
            fontFamily: "Menlo, Consolas, monospace",
            fontSize: `var(${diffFontSizeName})`,
          }}
        >
          <table
            class={`unified-diff-table w-full border-collapse border-spacing-0 ${enableWrap.value ? "table-fixed" : ""}`}
          >
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
                  <DiffUnifiedContentLine index={item.index} lineNumber={item.lineNumber} diffFile={props.diffFile} />
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
