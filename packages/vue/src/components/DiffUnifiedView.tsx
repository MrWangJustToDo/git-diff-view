import { getUnifiedContentLine } from "@git-diff-view/core";
import { diffAsideWidthName, diffFontSizeName, removeAllSelection } from "@git-diff-view/utils";
import { Fragment, computed, defineComponent, ref } from "vue";

import { useEnableWrap, useFontSize } from "../context";
import { useSubscribeDiffFile } from "../hooks/useSubscribeDiffFile";
import { useTextWidth } from "../hooks/useTextWidth";

import { DiffUnifiedContentLine } from "./DiffUnifiedContentLine";
import { DiffUnifiedExtendLine } from "./DiffUnifiedExtendLine";
import { DiffUnifiedHunkLine } from "./DiffUnifiedHunkLine";
import { DiffUnifiedWidgetLine } from "./DiffUnifiedWidgetLine";

import type { DiffFile } from "@git-diff-view/core";

export const DiffUnifiedView = defineComponent(
  (props: { diffFile: DiffFile }) => {
    const lines = ref(getUnifiedContentLine(props.diffFile));

    const maxText = computed(() =>
      Math.max(props.diffFile.unifiedLineLength, props.diffFile.fileLineLength).toString()
    );

    useSubscribeDiffFile(props, (diffFile) => {
      lines.value = getUnifiedContentLine(diffFile);
    });

    const fontSize = useFontSize();

    const enableWrap = useEnableWrap();

    const selectState = { current: undefined as boolean | undefined };

    const styleRef = ref<HTMLStyleElement | null>(null);

    const onSelect = (state?: boolean) => {
      const ele = styleRef.value;

      if (!ele) return;

      if (state === undefined) {
        ele.textContent = "";
      } else {
        const id = `diff-root${props.diffFile.getId()}`;
        ele.textContent = `#${id} [data-state="extend"] {user-select: none} \n#${id} [data-state="hunk"] {user-select: none} \n#${id} [data-state="widget"] {user-select: none}`;
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      let ele = e.target as HTMLElement;

      if (ele && ele?.nodeName === "BUTTON") {
        removeAllSelection();
        return;
      }

      while (ele && ele instanceof HTMLElement) {
        const state = ele.getAttribute("data-state");
        if (state) {
          if (state === "extend" || state === "hunk" || state === "widget") {
            if (selectState.current !== false) {
              selectState.current = false;
              onSelect(false);
              removeAllSelection();
            }
          } else {
            if (selectState.current !== true) {
              selectState.current = true;
              onSelect(true);
              removeAllSelection();
            }
          }
          return;
        }
        ele = ele.parentElement;
      }
    };

    const font = computed(() => ({ fontSize: fontSize.value + "px", fontFamily: "Menlo, Consolas, monospace" }));

    const width = useTextWidth({ text: maxText, font });

    const computedWidth = computed(() => Math.max(40, width.value + 10));

    return () => {
      return (
        <div
          class={`unified-diff-view ${enableWrap.value ? "unified-diff-view-wrap" : "unified-diff-view-normal"} w-full`}
        >
          <style data-select-style ref={styleRef} />
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
              <tbody class="diff-table-body leading-[1.6]" onMousedown={onMouseDown}>
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
    };
  },
  { props: ["diffFile"], name: "DiffUnifiedView" }
);
