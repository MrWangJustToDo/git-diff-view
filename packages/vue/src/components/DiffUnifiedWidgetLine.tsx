import { computed, defineComponent, ref } from "vue";

import { SplitSide } from "..";
import { useSetWidget, useSlots, useWidget } from "../context";
import { useDomWidth } from "../hooks/useDomWidth";
import { useSubscribeDiffFile } from "../hooks/useSubscribeDiffFile";

import type { DiffFile } from "@git-diff-view/core";

export const DiffUnifiedWidgetLine = defineComponent(
  (props: { index: number; diffFile: DiffFile; lineNumber: number }) => {
    const slots = useSlots();

    const widget = useWidget();

    const setWidget = useSetWidget();

    const unifiedItem = ref(props.diffFile.getUnifiedLine(props.index));

    const oldWidget = computed(
      () => unifiedItem.value?.oldLineNumber && widget.value.side === SplitSide.old && widget.value.lineNumber === unifiedItem.value.oldLineNumber
    );

    const newWidget = computed(
      () => unifiedItem.value?.newLineNumber && widget.value.side === SplitSide.new && widget.value.lineNumber === unifiedItem.value.newLineNumber
    );

    useSubscribeDiffFile(props, (diffFile) => (unifiedItem.value = diffFile.getUnifiedLine(props.index)));

    const currentIsShow = computed(() => oldWidget.value || newWidget.value);

    const onCloseWidget = () => setWidget({});

    const width = useDomWidth({
      selector: ref(".unified-diff-table-wrapper"),
      enable: currentIsShow,
    });

    return () => {
      if (!currentIsShow.value) return null;

      return (
        <tr data-state="widget" class="diff-line diff-line-widget">
          <td class="diff-line-widget-content p-0" colspan={4}>
            <div class="diff-line-widget-wrapper sticky left-0" style={{ width: width.value + "px" }}>
              {width.value > 0 &&
                oldWidget.value &&
                slots.widget?.({
                  diffFile: props.diffFile,
                  side: SplitSide.old,
                  lineNumber: unifiedItem.value.oldLineNumber,
                  onClose: onCloseWidget,
                })}
              {width.value > 0 &&
                newWidget.value &&
                slots.widget?.({
                  diffFile: props.diffFile,
                  side: SplitSide.new,
                  lineNumber: unifiedItem.value.newLineNumber,
                  onClose: onCloseWidget,
                })}
            </div>
          </td>
        </tr>
      );
    };
  },
  { name: "DiffUnifiedWidgetLine", props: ["diffFile", "index", "lineNumber"] }
);
