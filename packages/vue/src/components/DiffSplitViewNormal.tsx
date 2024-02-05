import { getSplitContentLines } from "@git-diff-view/core";
import { Fragment, computed, defineComponent, ref, watchPostEffect } from "vue";

import { useIsMounted } from "../hooks/useIsMounted";
import { useSubscribeDiffFile } from "../hooks/useSubscribeDiffFile";

import { DiffSplitExtendLine } from "./DiffSplitExtendLineNormal";
import { DiffSplitLastHunkLine, DiffSplitHunkLine } from "./DiffSplitHunkLineNormal";
import { DiffSplitLine } from "./DiffSplitLineNormal";
import { DiffSplitWidgetLine } from "./DiffSplitWidgetLineNormal";
import { SplitSide } from "./DiffView";
import { removeAllSelection, syncScroll } from "./tools";

import type { DiffFile } from "@git-diff-view/core";

const DiffSplitViewTable = defineComponent(
  (props: { side: SplitSide; lineLength: number; diffFile: DiffFile }) => {
    const className = computed(() => (props.side === SplitSide.new ? "new-diff-table" : "old-diff-table"));

    const lines = ref(getSplitContentLines(props.diffFile));

    useSubscribeDiffFile(props, (diffFile) => {
      lines.value = getSplitContentLines(diffFile);
    });

    const onMouseDown = (e: MouseEvent) => {
      const ele = e.target;

      // need remove all the selection
      if (ele && ele instanceof HTMLElement && ele.nodeName === "BUTTON") {
        removeAllSelection();
        return;
      }
    };

    return () => {
      return (
        <table class={className.value + " border-collapse w-full"} data-mode={SplitSide[props.side]}>
          <colgroup>
            <col class={`diff-table-${SplitSide[props.side]}-num-col`} />
            <col class={`diff-table-${SplitSide[props.side]}-content-col`} />
          </colgroup>
          <thead class="hidden">
            <tr>
              <th scope="col">{SplitSide[props.side]} line number</th>
              <th scope="col">{SplitSide[props.side]} line content</th>
            </tr>
          </thead>
          <tbody class="diff-table-body leading-[1.4]" onMousedown={onMouseDown}>
            {lines.value.map((item) => (
              <Fragment key={item.index}>
                <DiffSplitHunkLine
                  index={item.index}
                  side={props.side}
                  lineNumber={item.lineNumber}
                  diffFile={props.diffFile}
                />
                <DiffSplitLine
                  index={item.index}
                  side={props.side}
                  lineNumber={item.lineNumber}
                  diffFile={props.diffFile}
                />
                <DiffSplitWidgetLine
                  index={item.index}
                  side={props.side}
                  lineNumber={item.lineNumber}
                  diffFile={props.diffFile}
                />
                <DiffSplitExtendLine
                  index={item.index}
                  side={props.side}
                  lineNumber={item.lineNumber}
                  diffFile={props.diffFile}
                />
              </Fragment>
            ))}
            <DiffSplitLastHunkLine side={props.side} diffFile={props.diffFile} />
          </tbody>
        </table>
      );
    };
  },
  { name: "DiffSplitViewTable", props: ["diffFile", "lineLength", "side"] }
);

export const DiffSplitViewNormal = defineComponent(
  (props: { diffFile: DiffFile }) => {
    const isMounted = useIsMounted();

    const ref1 = ref<HTMLDivElement>();

    const ref2 = ref<HTMLDivElement>();

    const lineLength = ref(props.diffFile.splitLineLength);

    useSubscribeDiffFile(props, (diffFile) => {
      lineLength.value = diffFile.splitLineLength;
    });

    const initSyncScroll = (onClean: (cb: () => void) => void) => {
      if (!isMounted.value) return;
      const left = ref1.value;
      const right = ref2.value;
      if (!left || !right) return;
      const clean = syncScroll(left, right);
      onClean(clean);
    };

    watchPostEffect(initSyncScroll);

    return () => {
      return (
        <div class="split-diff-view split-diff-view-wrap w-full flex basis-[50%]">
          <div
            class="old-diff-table-wrapper overflow-auto w-full scrollbar-hide"
            ref={ref1}
            style={{
              overscrollBehaviorX: "none",
              fontFamily: "Menlo, Consolas, monospace",
              fontSize: "var(--diff-font-size--)",
            }}
          >
            <DiffSplitViewTable side={SplitSide.old} lineLength={lineLength.value} diffFile={props.diffFile} />
          </div>
          <div class="diff-split-line w-[1.5px] bg-[#ccc]" />
          <div
            class="new-diff-table-wrapper overflow-auto w-full scrollbar-hide"
            ref={ref2}
            style={{
              overscrollBehaviorX: "none",
              fontFamily: "Menlo, Consolas, monospace",
              fontSize: "var(--diff-font-size--)",
            }}
          >
            <DiffSplitViewTable side={SplitSide.new} lineLength={lineLength.value} diffFile={props.diffFile} />
          </div>
        </div>
      );
    };
  },
  { name: "DiffSplitViewNormal", props: ["diffFile"] }
);
