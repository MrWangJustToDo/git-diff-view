import { numIterator } from "@git-diff-view/core";
import { Fragment, computed, defineComponent, ref, watchPostEffect } from "vue";

import { useIsMounted } from "../hooks/useIsMounted";
import { useSubscribeDiffFile } from "../hooks/useSubscribeDiffFile";

import { DiffSplitExtendLine } from "./DiffSplitExtendLineWrap";
import { DiffSplitLastHunkLine, DiffSplitHunkLine } from "./DiffSplitHunkLineWrap";
import { DiffSplitLine } from "./DiffSplitLineWrap";
import { DiffSplitWidgetLine } from "./DiffSplitWidgetLineWrap";
import { SplitSide } from "./DiffView";

import type { DiffFile } from "@git-diff-view/core";

const syncScroll = (left: HTMLElement, right: HTMLElement) => {
  const onScroll = function (event: Event) {
    if (event === null || event.target === null) return;
    if (event.target === left) {
      right.scrollTop = left.scrollTop;
      right.scrollLeft = left.scrollLeft;
    } else {
      left.scrollTop = right.scrollTop;
      left.scrollLeft = right.scrollLeft;
    }
  };
  if (!left.onscroll) {
    left.onscroll = onScroll;
  }
  if (!right.onscroll) {
    right.onscroll = onScroll;
  }

  return () => {
    left.onscroll = null;
    right.onscroll = null;
  };
};

const DiffSplitViewTable = defineComponent(
  (props: { side: SplitSide; lineLength: number; diffFile: DiffFile }) => {
    const className = computed(() => (props.side === SplitSide.new ? "new-diff-table" : "old-diff-table"));

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
          <tbody
            class="diff-table-body leading-[1.4]"
            style={{
              fontFamily: "Menlo, Consolas, monospace",
              fontSize: "var(--diff-font-size--)",
            }}
          >
            {numIterator(props.lineLength, (index) => (
              <Fragment key={index}>
                <DiffSplitHunkLine index={index} side={props.side} lineNumber={index + 1} diffFile={props.diffFile} />
                <DiffSplitLine index={index} side={props.side} lineNumber={index + 1} diffFile={props.diffFile} />
                <DiffSplitWidgetLine index={index} side={props.side} lineNumber={index + 1} diffFile={props.diffFile} />
                <DiffSplitExtendLine index={index} side={props.side} lineNumber={index + 1} diffFile={props.diffFile} />
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

export const DiffSplitViewWrap = defineComponent(
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
          <div class="old-diff-table-wrapper overflow-auto w-full" ref={ref1} style={{ overscrollBehaviorX: "none" }}>
            <DiffSplitViewTable side={SplitSide.old} lineLength={lineLength.value} diffFile={props.diffFile} />
          </div>
          <div class="diff-split-line w-[1.5px] bg-[#ccc]" />
          <div class="new-diff-table-wrapper overflow-auto w-full" ref={ref2} style={{ overscrollBehaviorX: "none" }}>
            <DiffSplitViewTable side={SplitSide.new} lineLength={lineLength.value} diffFile={props.diffFile} />
          </div>
        </div>
      );
    };
  },
  { name: "DiffSplitViewWrap", props: ["diffFile"] }
);
