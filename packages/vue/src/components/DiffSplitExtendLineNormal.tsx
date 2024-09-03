import { computed, defineComponent, ref } from "vue";

import { useExtendData, useSlots } from "../context";
import { useDomWidth } from "../hooks/useDomWidth";
import { useSubscribeDiffFile } from "../hooks/useSubscribeDiffFile";
import { useSyncHeight } from "../hooks/useSyncHeight";

import { emptyBGName } from "./color";
import { SplitSide } from "./DiffView";

import type { DiffFile } from "@git-diff-view/core";

export const DiffSplitExtendLine = defineComponent(
  (props: { index: number; side: SplitSide; diffFile: DiffFile; lineNumber: number }) => {
    const extendData = useExtendData();

    const slots = useSlots();

    const currentSide = computed(() => SplitSide[props.side]);

    const lineSelector = computed(() => `div[data-line="${props.lineNumber}-extend-content"]`);

    const lineWrapperSelector = computed(() => `tr[data-line="${props.lineNumber}-extend"]`);

    const wrapperSelector = computed(() =>
      props.side === SplitSide.old ? ".old-diff-table-wrapper" : ".new-diff-table-wrapper"
    );

    const oldLine = ref(props.diffFile.getSplitLeftLine(props.index));

    const newLine = ref(props.diffFile.getSplitRightLine(props.index));

    const enableExpand = ref(props.diffFile.getExpandEnabled());

    const oldLineExtend = ref(extendData.value?.oldFile?.[oldLine.value?.lineNumber]);

    const newLineExtend = ref(extendData.value?.newFile?.[newLine.value.lineNumber]);

    const currentItem = computed(() => (props.side === SplitSide.old ? oldLine.value : newLine.value));

    useSubscribeDiffFile(props, (diffFile) => {
      oldLine.value = diffFile.getSplitLeftLine(props.index);

      newLine.value = diffFile.getSplitRightLine(props.index);

      oldLineExtend.value = extendData.value?.oldFile?.[oldLine.value?.lineNumber];

      newLineExtend.value = extendData.value?.newFile?.[newLine.value.lineNumber];

      enableExpand.value = diffFile.getExpandEnabled();
    });

    const currentExtend = computed(() => (props.side === SplitSide.old ? oldLineExtend.value : newLineExtend.value));

    const currentLineNumber = computed(() =>
      props.side === SplitSide.old ? oldLine.value.lineNumber : newLine.value.lineNumber
    );

    const currentIsShow = computed(() =>
      Boolean(
        (oldLineExtend.value || newLineExtend.value) &&
          (!currentItem.value.isHidden || enableExpand.value) &&
          slots.extend
      )
    );

    const currentEnable = computed(
      () => (props.side === SplitSide.old ? !!oldLineExtend.value : !!newLineExtend.value) && currentIsShow.value
    );

    useSyncHeight({
      selector: lineSelector,
      wrapper: lineWrapperSelector,
      side: currentSide,
      enable: currentIsShow,
    });

    const width = useDomWidth({
      selector: wrapperSelector,
      enable: currentEnable,
    });

    return () => {
      if (!currentIsShow.value) return null;

      return (
        <tr
          data-line={`${props.lineNumber}-extend`}
          data-state="extend"
          data-side={SplitSide[props.side]}
          class="diff-line diff-line-extend"
        >
          {currentExtend.value ? (
            <td class={`diff-line-extend-${SplitSide[props.side]}-content p-0`} colspan={2}>
              <div
                data-line={`${props.lineNumber}-extend-content`}
                data-side={SplitSide[props.side]}
                class="diff-line-extend-wrapper sticky left-0"
                style={{ width: width.value + "px" }}
              >
                {width.value > 0 &&
                  slots.extend?.({
                    diffFile: props.diffFile,
                    side: props.side,
                    lineNumber: currentLineNumber.value,
                    data: currentExtend.value.data,
                    onUpdate: props.diffFile.notifyAll,
                  })}
              </div>
            </td>
          ) : (
            <td
              class={`diff-line-extend-${SplitSide[props.side]}-placeholder select-none p-0`}
              style={{ backgroundColor: `var(${emptyBGName})` }}
              colspan={2}
            >
              <div data-line={`${props.lineNumber}-extend-content`} data-side={SplitSide[props.side]}>
                &ensp;
              </div>
            </td>
          )}
        </tr>
      );
    };
  },
  { name: "DiffSplitExtendLine", props: ["index", "diffFile", "lineNumber", "side"] }
);
