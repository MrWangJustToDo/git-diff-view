import { computed, defineComponent, ref } from "vue";

import { SplitSide } from "..";
import { useSlots } from "../context";
import { useDomWidth } from "../hooks/useDomWidth";
import { useSubscribeDiffFile } from "../hooks/useSubscribeDiffFile";

import type { DiffFileExtends } from "../utils";

export const DiffUnifiedWidgetLine = defineComponent(
  (props: { index: number; diffFile: DiffFileExtends; lineNumber: number }) => {
    const slots = useSlots();

    const unifiedItem = ref(props.diffFile.getUnifiedLine(props.index));

    const oldWidget = ref(unifiedItem.value?.oldLineNumber ? props.diffFile.checkWidgetLine(unifiedItem.value.oldLineNumber, SplitSide.old) : undefined);

    const newWidget = ref(unifiedItem.value?.newLineNumber ? props.diffFile.checkWidgetLine(unifiedItem.value.newLineNumber, SplitSide.new) : undefined);

    useSubscribeDiffFile(props, (diffFile) => (unifiedItem.value = diffFile.getUnifiedLine(props.index)));

    useSubscribeDiffFile(
      props,
      (diffFile: DiffFileExtends) =>
        (oldWidget.value = unifiedItem.value?.oldLineNumber ? diffFile.checkWidgetLine(unifiedItem.value.oldLineNumber, SplitSide.old) : undefined)
    );

    useSubscribeDiffFile(
      props,
      (diffFile: DiffFileExtends) =>
        (newWidget.value = unifiedItem.value?.newLineNumber ? diffFile.checkWidgetLine(unifiedItem.value.newLineNumber, SplitSide.new) : undefined)
    );

    const currentIsShow = computed(() => oldWidget.value || newWidget.value);

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
                  onClose: props.diffFile.onCloseAddWidget,
                })}
              {width.value > 0 &&
                newWidget.value &&
                slots.widget?.({
                  diffFile: props.diffFile,
                  side: SplitSide.new,
                  lineNumber: unifiedItem.value.newLineNumber,
                  onClose: props.diffFile.onCloseAddWidget,
                })}
            </div>
          </td>
        </tr>
      );
    };
  },
  { name: "DiffUnifiedWidgetLine", props: ["diffFile", "index", "lineNumber"] }
);
