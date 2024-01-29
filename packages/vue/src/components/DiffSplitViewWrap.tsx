import { numIterator } from "@git-diff-view/core";
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
    const lineLength = ref(props.diffFile.splitLineLength);

    const maxText = ref(props.diffFile.splitLineLength.toString());

    const fontSize = useFontSize();

    const font = computed(() => ({ fontSize: fontSize.value + "px", fontFamily: "Menlo, Consolas, monospace" }));

    useSubscribeDiffFile(props, (diffFile) => {
      lineLength.value = diffFile.splitLineLength;
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
                {numIterator(lineLength.value, (index) => (
                  <Fragment key={index}>
                    <DiffSplitHunkLine index={index} lineNumber={index + 1} diffFile={props.diffFile} />
                    <DiffSplitLine index={index} lineNumber={index + 1} diffFile={props.diffFile} />
                    <DiffSplitWidgetLine index={index} lineNumber={index + 1} diffFile={props.diffFile} />
                    <DiffSplitExtendLine index={index} lineNumber={index + 1} diffFile={props.diffFile} />
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
