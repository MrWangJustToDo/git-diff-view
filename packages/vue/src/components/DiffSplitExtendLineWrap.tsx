import { computed, defineComponent, ref } from "vue";

import { useExtendData, useSlots } from "../context";
import { useSubscribeDiffFile } from "../hooks/useSubscribeDiffFile";

import { emptyBGName } from "./color";
import { SplitSide } from "./DiffView";

import type { DiffFile } from "@git-diff-view/core";

export const DiffSplitExtendLine = defineComponent(
  (props: { index: number; diffFile: DiffFile; lineNumber: number }) => {
    const extendData = useExtendData();

    const slots = useSlots();

    const oldLine = ref(props.diffFile.getSplitLeftLine(props.index));

    const newLine = ref(props.diffFile.getSplitRightLine(props.index));

    const enableExpand = ref(props.diffFile.getExpandEnabled());

    const oldLineExtend = ref(extendData.value?.oldFile?.[oldLine.value?.lineNumber]);

    const newLineExtend = ref(extendData.value?.newFile?.[newLine.value.lineNumber]);

    useSubscribeDiffFile(props, (diffFile) => {
      oldLine.value = diffFile.getSplitLeftLine(props.index);

      newLine.value = diffFile.getSplitRightLine(props.index);

      oldLineExtend.value = extendData.value?.oldFile?.[oldLine.value?.lineNumber];

      newLineExtend.value = extendData.value?.newFile?.[newLine.value.lineNumber];

      enableExpand.value = diffFile.getExpandEnabled();
    });

    const currentIsShow = computed(() =>
      Boolean(
        (oldLineExtend.value || newLineExtend.value) &&
          ((!oldLine.value?.isHidden && !newLine.value?.isHidden) || enableExpand.value)
      )
    );

    return () => {
      if (!currentIsShow.value) return null;

      return (
        <tr data-line={`${props.lineNumber}-extend`} data-state="extend" class="diff-line diff-line-extend">
          {oldLineExtend.value ? (
            <td class="diff-line-extend-old-content p-0" colspan={2}>
              <div class="diff-line-extend-wrapper">
                {slots.extend?.({
                  diffFile: props.diffFile,
                  side: SplitSide.old,
                  lineNumber: oldLine.value.lineNumber,
                  data: oldLineExtend.value.data,
                  onUpdate: props.diffFile.notifyAll,
                })}
              </div>
            </td>
          ) : (
            <td
              class="diff-line-extend-old-placeholder p-0"
              style={{ backgroundColor: `var(${emptyBGName})` }}
              colspan={2}
            >
              <span>&ensp;</span>
            </td>
          )}
          {newLineExtend.value ? (
            <td class="diff-line-extend-new-content p-0 border-l-[1px] border-l-[#ccc]" colspan={2}>
              <div class="diff-line-extend-wrapper">
                {slots.extend?.({
                  diffFile: props.diffFile,
                  side: SplitSide.new,
                  lineNumber: newLine.value.lineNumber,
                  data: newLineExtend.value.data,
                  onUpdate: props.diffFile.notifyAll,
                })}
              </div>
            </td>
          ) : (
            <td
              class="diff-line-extend-new-placeholder p-0 border-l-[1px] border-l-[#ccc]"
              style={{ backgroundColor: `var(${emptyBGName})` }}
              colspan={2}
            >
              <span>&ensp;</span>
            </td>
          )}
        </tr>
      );
    };
  },
  { name: "DiffSplitExtendLine", props: ["index", "diffFile", "lineNumber"] }
);
