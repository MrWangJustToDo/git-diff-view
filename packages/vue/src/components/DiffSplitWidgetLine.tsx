import { computed, defineComponent, ref } from "vue";

import { useSlots } from "../context";
import { useDomWidth } from "../hooks/useDomWidth";
import { useSubscribeDiffFile } from "../hooks/useSubscribeDiffFile";
import { useSyncHeight } from "../hooks/useSyncHeight";

import { emptyBGName } from "./color";
import { SplitSide } from "./DiffView";

import type { DiffFileExtends } from "../utils";

export const DiffSplitWidgetLine = defineComponent(
  (props: { index: number; side: SplitSide; diffFile: DiffFileExtends; lineNumber: number }) => {
    const slots = useSlots();

    const leftItem = ref(props.diffFile.getSplitLeftLine(props.index));

    const rightItem = ref(props.diffFile.getSplitRightLine(props.index));

    const leftWidget = ref(leftItem.value.lineNumber ? props.diffFile.checkWidgetLine(leftItem.value.lineNumber, SplitSide.old) : undefined);

    const rightWidget = ref(rightItem.value.lineNumber ? props.diffFile.checkWidgetLine(rightItem.value.lineNumber, SplitSide.new) : undefined);

    useSubscribeDiffFile(props, (diffFile) => (leftItem.value = diffFile.getSplitLeftLine(props.index)));

    useSubscribeDiffFile(props, (diffFile) => (rightItem.value = diffFile.getSplitRightLine(props.index)));

    useSubscribeDiffFile(
      props,
      (diffFile: DiffFileExtends) =>
        (leftWidget.value = leftItem.value.lineNumber ? diffFile.checkWidgetLine(leftItem.value.lineNumber, SplitSide.old) : undefined)
    );

    useSubscribeDiffFile(
      props,
      (diffFile: DiffFileExtends) =>
        (rightWidget.value = rightItem.value.lineNumber ? diffFile.checkWidgetLine(rightItem.value.lineNumber, SplitSide.new) : undefined)
    );

    const currentItem = computed(() => (props.side === SplitSide.old ? leftItem.value : rightItem.value));

    const currentWidget = computed(() => (props.side === SplitSide.old ? leftWidget.value : rightWidget.value));

    const lineSelector = computed(() => `tr[data-line="${props.lineNumber}-widget"]`);

    const wrapperSelector = computed(() => (props.side === SplitSide.old ? ".old-diff-table-wrapper" : ".new-diff-table-wrapper"));

    const side = computed(() => (props.side === SplitSide.old ? "left" : "right"));

    const currentIsShow = computed(() => !!leftWidget.value || !!rightWidget.value);

    useSyncHeight({
      selector: lineSelector,
      side: side,
      enable: currentWidget,
    });

    const width = useDomWidth({
      selector: wrapperSelector,
      enable: currentWidget,
    });

    return () => {
      if (!currentIsShow.value) return null;

      return (
        <tr
          data-line={`${props.lineNumber}-widget`}
          data-state="widget"
          data-side={props.side === SplitSide.old ? "left" : "right"}
          class={"diff-line diff-line-widget" + !currentWidget.value ? " diff-line-widget-empty" : ""}
          style={{
            backgroundColor: !currentWidget.value ? `var(${emptyBGName})` : undefined,
          }}
        >
          <td class="diff-line-widget-content p-0" colspan={2}>
            <div class="diff-line-widget-wrapper sticky left-0" style={{ width: width.value + "px" }}>
              {width.value > 0 &&
                currentWidget.value &&
                slots.widget?.({
                  diffFile: props.diffFile,
                  side: props.side,
                  lineNumber: currentItem.value.lineNumber,
                  onClose: props.diffFile.onCloseAddWidget,
                })}
            </div>
          </td>
        </tr>
      );
    };
  },
  { name: "DiffSplitWidgetLine", props: ["diffFile", "index", "lineNumber", "side"] }
);
