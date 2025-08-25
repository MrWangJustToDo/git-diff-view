import { computed, defineComponent, ref } from "vue";

import { SplitSide } from "..";
import { useEnableWrap, useExtendData, useSlots } from "../context";
import { useDomWidth } from "../hooks/useDomWidth";

import type { DiffFile } from "@git-diff-view/core";

export const DiffUnifiedExtendLine = defineComponent(
  (props: { index: number; diffFile: DiffFile; lineNumber: number }) => {
    const extendData = useExtendData();

    const slots = useSlots();

    const enableWrap = useEnableWrap();

    const unifiedItem = computed(() => props.diffFile.getUnifiedLine(props.index));

    const oldExtend = computed(() => extendData.value?.oldFile?.[unifiedItem.value.oldLineNumber]);

    const newExtend = computed(() => extendData.value?.newFile?.[unifiedItem.value.newLineNumber]);

    const currentIsHidden = computed(() => unifiedItem.value.isHidden);

    const currentIsShow = computed(() =>
      Boolean((oldExtend.value || newExtend.value) && !currentIsHidden.value && slots.extend)
    );

    const width = useDomWidth({
      selector: ref(".unified-diff-table-wrapper"),
      enable: currentIsShow,
    });

    return () => {
      if (!currentIsShow.value) return null;

      return (
        <tr data-line={`${props.lineNumber}-extend`} data-state="extend" class="diff-line diff-line-extend">
          <td class="diff-line-extend-content p-0 align-top" colspan={2}>
            <div class="diff-line-extend-wrapper sticky left-0 z-[1]" style={{ width: width.value + "px" }}>
              {(enableWrap.value ? true : width.value > 0) &&
                oldExtend.value &&
                slots.extend({
                  diffFile: props.diffFile,
                  side: SplitSide.old,
                  lineNumber: unifiedItem.value.oldLineNumber,
                  data: oldExtend.value.data,
                  onUpdate: props.diffFile.notifyAll,
                })}
              {(enableWrap.value ? true : width.value > 0) &&
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
