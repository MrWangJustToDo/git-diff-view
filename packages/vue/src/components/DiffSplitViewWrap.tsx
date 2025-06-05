import { getSplitContentLines } from "@git-diff-view/core";
import { diffAsideWidthName, diffFontSizeName, removeAllSelection } from "@git-diff-view/utils";
import { Fragment, computed, defineComponent, ref } from "vue";

import { SplitSide } from "..";
import { useFontSize } from "../context";
import { useSubscribeDiffFile } from "../hooks/useSubscribeDiffFile";
import { useTextWidth } from "../hooks/useTextWidth";

import { DiffSplitContentLine } from "./DiffSplitContentLineWrap";
import { DiffSplitExtendLine } from "./DiffSplitExtendLineWrap";
import { DiffSplitHunkLine } from "./DiffSplitHunkLineWrap";
import { DiffSplitWidgetLine } from "./DiffSplitWidgetLineWrap";

import type { DiffFile } from "@git-diff-view/core";

const Style = ({ splitSideInfo, id }: { splitSideInfo: { side: SplitSide }; id: string }) => {
  return (
    <style data-select-style>
      {splitSideInfo.side === SplitSide.old
        ? `#${id} [data-side="${SplitSide[SplitSide.new]}"] {user-select: none} \n#${id} [data-state="extend"] {user-select: none} \n#${id} [data-state="hunk"] {user-select: none} \n#${id} [data-state="widget"] {user-select: none}`
        : splitSideInfo.side === SplitSide.new
          ? `#${id} [data-side="${SplitSide[SplitSide.old]}"] {user-select: none} \n#${id} [data-state="extend"] {user-select: none} \n#${id} [data-state="hunk"] {user-select: none} \n#${id} [data-state="widget"] {user-select: none}`
          : ""}
    </style>
  );
};

export const DiffSplitViewWrap = defineComponent(
  (props: { diffFile: DiffFile }) => {
    const lines = ref(getSplitContentLines(props.diffFile));

    const maxText = ref(props.diffFile.splitLineLength.toString());

    const splitSideInfo = ref({ side: undefined as SplitSide });

    const onMouseDown = (e: MouseEvent) => {
      let ele = e.target;

      // need remove all the selection
      if (ele && ele instanceof HTMLElement && ele.nodeName === "BUTTON") {
        removeAllSelection();
        return;
      }

      while (ele && ele instanceof HTMLElement) {
        const state = ele.getAttribute("data-state");
        const side = ele.getAttribute("data-side");
        if (side) {
          splitSideInfo.value.side = SplitSide[side];
          removeAllSelection();
        }
        if (state) {
          if (state === "extend" || state === "hunk" || state === "widget") {
            splitSideInfo.value.side = undefined;
            removeAllSelection();
            return;
          } else {
            return;
          }
        }

        ele = ele.parentElement;
      }
    };

    const fontSize = useFontSize();

    const font = computed(() => ({ fontSize: fontSize.value + "px", fontFamily: "Menlo, Consolas, monospace" }));

    useSubscribeDiffFile(props, (diffFile) => {
      lines.value = getSplitContentLines(diffFile);
      maxText.value = Math.max(diffFile.splitLineLength, diffFile.fileLineLength).toString();
    });

    const width = useTextWidth({ text: maxText, font });

    const computedWidth = computed(() => Math.max(40, width.value + 25));

    return () => {
      return (
        <div class="split-diff-view split-diff-view-warp w-full">
          <div
            class="diff-table-wrapper w-full"
            style={{
              [diffAsideWidthName]: `${Math.round(computedWidth.value)}px`,
              fontFamily: "Menlo, Consolas, monospace",
              fontSize: `var(${diffFontSizeName})`,
            }}
          >
            <Style splitSideInfo={splitSideInfo.value} id={`diff-root${props.diffFile.getId()}`} />
            <table class="diff-table w-full table-fixed border-collapse border-spacing-0">
              <colgroup>
                <col class="diff-table-old-num-col" width={Math.round(computedWidth.value)} />
                <col class="diff-table-old-content-col" />
                <col class="diff-table-new-num-col" width={Math.round(computedWidth.value)} />
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
              <tbody class="diff-table-body leading-[1.4]" onMousedown={onMouseDown}>
                {lines.value.map((item) => (
                  <Fragment key={item.index}>
                    <DiffSplitHunkLine index={item.index} lineNumber={item.lineNumber} diffFile={props.diffFile} />
                    <DiffSplitContentLine index={item.index} lineNumber={item.lineNumber} diffFile={props.diffFile} />
                    <DiffSplitWidgetLine index={item.index} lineNumber={item.lineNumber} diffFile={props.diffFile} />
                    <DiffSplitExtendLine index={item.index} lineNumber={item.lineNumber} diffFile={props.diffFile} />
                  </Fragment>
                ))}
                <DiffSplitHunkLine
                  index={props.diffFile.splitLineLength}
                  lineNumber={props.diffFile.splitLineLength}
                  diffFile={props.diffFile}
                />
              </tbody>
            </table>
          </div>
        </div>
      );
    };
  },
  { name: "DiffSplitViewWrap", props: ["diffFile"] }
);
