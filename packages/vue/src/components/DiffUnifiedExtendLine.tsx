import { computed, defineComponent, ref } from "vue";

import { SplitSide } from "..";
import { useExtendData, useSlots } from "../context";
import { useDomWidth } from "../hooks/useDomWidth";
import { useSubscribeDiffFile } from "../hooks/useSubscribeDiffFile";

import type { DiffFile } from "@git-diff-view/core";

export const DiffUnifiedExtendLine = defineComponent(
  (props: { index: number; diffFile: DiffFile; lineNumber: number }) => {
    const extendData = useExtendData();

    const slots = useSlots();

    const unifiedItem = ref(props.diffFile.getUnifiedLine(props.index));

    const oldExtend = ref(extendData.value?.oldFile?.[unifiedItem.value.oldLineNumber]);

    const newExtend = ref(extendData.value?.newFile?.[unifiedItem.value.newLineNumber]);

    useSubscribeDiffFile(props, (diffFile) => {
      unifiedItem.value = diffFile.getUnifiedLine(props.index);

      oldExtend.value = extendData.value?.oldFile?.[unifiedItem.value.oldLineNumber];

      newExtend.value = extendData.value?.newFile?.[unifiedItem.value.newLineNumber];
    });

    const currentIsShow = computed(() =>
      Boolean(
        (oldExtend.value || newExtend.value) &&
          unifiedItem.value &&
          !unifiedItem.value.isHidden &&
          unifiedItem.value.diff
      )
    );

    const width = useDomWidth({
      selector: ref(".unified-diff-table-wrapper"),
      enable: currentIsShow,
    });

    return () => {
      if (!currentIsShow.value) return null;

      return (
        <tr data-line={`${props.lineNumber}-extend`} data-state="extend" class="diff-line diff-line-extend">
          <td class="diff-line-extend-content align-top p-0" colspan={4}>
            <div class="diff-line-extend-wrapper sticky left-0" style={{ width: width.value + "px" }}>
              {width.value > 0 &&
                oldExtend.value &&
                slots.extend({
                  diffFile: props.diffFile,
                  side: SplitSide.old,
                  lineNumber: unifiedItem.value.oldLineNumber,
                  data: oldExtend.value.data,
                  onUpdate: props.diffFile.notifyAll,
                })}
              {width.value > 0 &&
                newExtend.value &&
                slots.extend({
                  diffFile: props.diffFile,
                  side: SplitSide.new,
                  lineNumber: unifiedItem.value.newLineNumber,
                  data: newExtend.value.data,
                  onUpdate: props.diffFile.notifyAll,
                })}
            </div>
          </td>
        </tr>
      );
    };
  },
  { name: "DiffUnifiedExtendLine", props: ["diffFile", "index", "lineNumber"] }
);
