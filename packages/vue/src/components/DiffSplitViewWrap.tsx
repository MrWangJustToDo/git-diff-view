import { getSplitContentLines } from "@git-diff-view/core";
import { Fragment, computed, defineComponent, ref } from "vue";

import { useFontSize } from "../context";
import { useSubscribeDiffFile } from "../hooks/useSubscribeDiffFile";
import { useTextWidth } from "../hooks/useTextWidth";

import { DiffSplitExtendLine } from "./DiffSplitExtendLineWrap";
import { DiffSplitHunkLine, DiffSplitLastHunkLine } from "./DiffSplitHunkLineWrap";
import { DiffSplitLine } from "./DiffSplitLineWrap";
import { DiffSplitWidgetLine } from "./DiffSplitWidgetLineWrap";

import type { DiffFile } from "@git-diff-view/core";

export const DiffSplitViewWrap = defineComponent(
  (props: { diffFile: DiffFile }) => {
    const lines = ref(getSplitContentLines(props.diffFile));

    const maxText = ref(props.diffFile.splitLineLength.toString());

    const fontSize = useFontSize();

    const font = computed(() => ({ fontSize: fontSize.value + "px", fontFamily: "Menlo, Consolas, monospace" }));

    useSubscribeDiffFile(props, (diffFile) => {
      lines.value = getSplitContentLines(diffFile);
    });

    const width = useTextWidth({ text: maxText, font });

    return () => {
      return (
        <div class="split-diff-view split-diff-view-normal w-full">
          <div
            class="diff-table-wrapper w-full"
            style={{
              fontFamily: "Menlo, Consolas, monospace",
              fontSize: "var(--diff-font-size--)",
            }}
          >
            <table class="diff-table border-collapse table-fixed w-full">
              <colgroup>
                <col class="diff-table-old-num-col" width={Math.round(width.value) + 25} />
                <col class="diff-table-old-content-col" />
                <col class="diff-table-new-num-col" width={Math.round(width.value) + 25} />
                <col class="diff-table-new-content-col" />
              </colgroup>
              <thead class="hidden">
                <tr>
                  <th scope="col">old line number</th>
                  <th scope="col">old line content</th>
                  <th scope="col">new line number</th>
                  <th scope="col">new line content</th>
                </tr>
              </thead>
              <tbody class="diff-table-body leading-[1.4]">
                {lines.value.map((item) => (
                  <Fragment key={item.index}>
                    <DiffSplitHunkLine index={item.index} lineNumber={item.lineNumber} diffFile={props.diffFile} />
                    <DiffSplitLine index={item.index} lineNumber={item.lineNumber} diffFile={props.diffFile} />
                    <DiffSplitWidgetLine index={item.index} lineNumber={item.lineNumber} diffFile={props.diffFile} />
                    <DiffSplitExtendLine index={item.index} lineNumber={item.lineNumber} diffFile={props.diffFile} />
                  </Fragment>
                ))}
                <DiffSplitLastHunkLine diffFile={props.diffFile} />
              </tbody>
            </table>
          </div>
        </div>
      );
    };
  },
  { name: "DiffSplitViewWrap", props: ["diffFile"] }
);
