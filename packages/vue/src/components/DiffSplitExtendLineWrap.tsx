import { borderColorName, emptyBGName } from "@git-diff-view/utils";
import { computed, defineComponent } from "vue";

import { useExtendData, useSlots } from "../context";

import { SplitSide } from "./DiffView";

import type { DiffFile } from "@git-diff-view/core";

export const DiffSplitExtendLine = defineComponent(
  (props: { index: number; diffFile: DiffFile; lineNumber: number }) => {
    const extendData = useExtendData();

    const slots = useSlots();

    const oldLine = computed(() => props.diffFile.getSplitLeftLine(props.index));

    const newLine = computed(() => props.diffFile.getSplitRightLine(props.index));

    const enableExpand = computed(() => props.diffFile.getExpandEnabled());

    const oldLineExtend = computed(() => extendData.value?.oldFile?.[oldLine.value?.lineNumber]);

    const newLineExtend = computed(() => extendData.value?.newFile?.[newLine.value.lineNumber]);

    const hasHidden = computed(() => oldLine.value.isHidden && newLine.value.isHidden);

    const currentIsShow = computed(() =>
      Boolean((oldLineExtend.value || newLineExtend.value) && (!hasHidden.value || enableExpand.value) && slots.extend)
    );

    return () => {
      if (!currentIsShow.value) return null;

      const oldExtendRendered = oldLineExtend.value
        ? slots.extend?.({
            diffFile: props.diffFile,
            side: SplitSide.old,
            lineNumber: oldLine.value.lineNumber,
            data: oldLineExtend.value.data,
            onUpdate: props.diffFile.notifyAll,
          })
        : null;

      const newExtendRendered = newLineExtend.value
        ? slots.extend?.({
            diffFile: props.diffFile,
            side: SplitSide.new,
            lineNumber: newLine.value.lineNumber,
            data: newLineExtend.value.data,
            onUpdate: props.diffFile.notifyAll,
          })
        : null;

      return (
        <tr data-line={`${props.lineNumber}-extend`} data-state="extend" class="diff-line diff-line-extend">
          {oldExtendRendered ? (
            <td class="diff-line-extend-old-content p-0" colspan={2}>
              <div class="diff-line-extend-wrapper">{oldExtendRendered}</div>
            </td>
          ) : (
            <td
              class="diff-line-extend-old-placeholder select-none p-0"
              style={{ backgroundColor: `var(${emptyBGName})` }}
              colspan={2}
            />
          )}
          {newExtendRendered ? (
            <td
              class="diff-line-extend-new-content border-l-[1px] p-0"
              colspan={2}
              style={{ borderLeftColor: `var(${borderColorName})`, borderLeftStyle: "solid" }}
            >
              <div class="diff-line-extend-wrapper">{newExtendRendered}</div>
            </td>
          ) : (
            <td
              class="diff-line-extend-new-placeholder select-none border-l-[1px] p-0"
              style={{
                backgroundColor: `var(${emptyBGName})`,
                borderLeftColor: `var(${borderColorName})`,
                borderLeftStyle: "solid",
              }}
              colspan={2}
            />
          )}
        </tr>
      );
    };
  },
  { name: "DiffSplitExtendLine", props: ["index", "diffFile", "lineNumber"] }
);
