import { computed, defineComponent, ref } from "vue";

import { useSetWidget, useSlots, useWidget } from "../context";
import { useDomWidth } from "../hooks/useDomWidth";
import { useSubscribeDiffFile } from "../hooks/useSubscribeDiffFile";
import { useSyncHeight } from "../hooks/useSyncHeight";

import { emptyBGName } from "./color";
import { SplitSide } from "./DiffView";

import type { DiffFile } from "@git-diff-view/core";

export const DiffSplitWidgetLine = defineComponent(
  (props: { index: number; side: SplitSide; diffFile: DiffFile; lineNumber: number }) => {
    const slots = useSlots();

    const widget = useWidget();

    const setWidget = useSetWidget();

    const leftItem = ref(props.diffFile.getSplitLeftLine(props.index));

    const rightItem = ref(props.diffFile.getSplitRightLine(props.index));

    const leftWidget = computed(
      () => leftItem.value.lineNumber && widget.value.side === SplitSide.old && widget.value.lineNumber === leftItem.value.lineNumber
    );

    const rightWidget = computed(
      () => rightItem.value.lineNumber && widget.value.side === SplitSide.new && widget.value.lineNumber === rightItem.value.lineNumber
    );

    useSubscribeDiffFile(props, (diffFile) => (leftItem.value = diffFile.getSplitLeftLine(props.index)));

    useSubscribeDiffFile(props, (diffFile) => (rightItem.value = diffFile.getSplitRightLine(props.index)));

    const currentItem = computed(() => (props.side === SplitSide.old ? leftItem.value : rightItem.value));

    const currentWidget = computed(() => (props.side === SplitSide.old ? leftWidget.value : rightWidget.value));

    const lineSelector = computed(() => `tr[data-line="${props.lineNumber}-widget"]`);

    const wrapperSelector = computed(() => (props.side === SplitSide.old ? ".old-diff-table-wrapper" : ".new-diff-table-wrapper"));

    const side = computed(() => (props.side === SplitSide.old ? "left" : "right"));

    const currentIsShow = computed(() => !!leftWidget.value || !!rightWidget.value);

    const onCloseWidget = () => setWidget({});

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
                  onClose: onCloseWidget,
                })}
            </div>
          </td>
        </tr>
      );
    };
  },
  { name: "DiffSplitWidgetLine", props: ["diffFile", "index", "lineNumber", "side"] }
);
