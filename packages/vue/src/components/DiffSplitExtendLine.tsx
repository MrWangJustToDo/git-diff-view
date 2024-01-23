import { computed, defineComponent, ref } from "vue";

import { useExtendData, useSlots } from "../context";
import { useDomWidth } from "../hooks/useDomWidth";
import { useSubscribeDiffFile } from "../hooks/useSubscribeDiffFile";
import { useSyncHeight } from "../hooks/useSyncHeight";

import { emptyBGName } from "./color";
import { SplitSide } from "./DiffView";

import type { DiffFileExtends } from "../utils";

export const DiffSplitExtendLine = defineComponent(
  (props: { index: number; side: SplitSide; diffFile: DiffFileExtends; lineNumber: number }) => {
    const extendData = useExtendData();

    const slots = useSlots();

    const side = computed(() => (props.side === SplitSide.old ? "left" : "right"));

    const lineSelector = computed(() => `tr[data-line="${props.lineNumber}-extend"]`);

    const wrapperSelector = computed(() => (props.side === SplitSide.old ? ".old-diff-table-wrapper" : ".new-diff-table-wrapper"));

    const oldItem = ref(props.diffFile.getSplitLeftLine(props.index));

    const newItem = ref(props.diffFile.getSplitRightLine(props.index));

    const currentItem = computed(() => (props.side === SplitSide.old ? oldItem.value : newItem.value));

    const oldExtend = ref(extendData.value?.oldFile?.[oldItem.value?.lineNumber]);

    const newExtend = ref(extendData.value?.newFile?.[newItem.value.lineNumber]);

    useSubscribeDiffFile(props, (diffFile) => (oldItem.value = diffFile.getSplitLeftLine(props.index)));

    useSubscribeDiffFile(props, (diffFile) => (newItem.value = diffFile.getSplitRightLine(props.index)));

    useSubscribeDiffFile(props, () => (oldExtend.value = extendData.value?.oldFile?.[oldItem.value?.lineNumber]));

    useSubscribeDiffFile(props, () => (newExtend.value = extendData.value?.newFile?.[newItem.value?.lineNumber]));

    const currentExtend = computed(() => (props.side === SplitSide.old ? oldExtend.value : newExtend.value));

    const currentEnable = computed(() => (props.side === SplitSide.old ? !!oldExtend.value : !!newExtend.value));

    const currentLineNumber = computed(() => (props.side === SplitSide.old ? oldItem.value.lineNumber : newItem.value.lineNumber));

    const currentIsShow = computed(() =>
      Boolean((oldExtend.value || newExtend.value) && currentItem.value && !currentItem.value.isHidden && currentItem.value.diff)
    );

    useSyncHeight({
      selector: lineSelector,
      side: side,
      enable: currentEnable,
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
          data-side={props.side === SplitSide.old ? "left" : "right"}
          class={"diff-line diff-line-extend" + !currentExtend.value ? " diff-line-extend-empty" : ""}
          style={{
            backgroundColor: !currentExtend.value ? `var(${emptyBGName})` : undefined,
          }}
        >
          <td class="diff-line-extend-content align-top p-0" colspan={2}>
            <div class="diff-line-extend-wrapper sticky left-0" style={{ width: width.value + "px" }}>
              {width.value > 0 &&
                currentExtend.value &&
                slots.extend?.({
                  diffFile: props.diffFile,
                  side: props.side,
                  lineNumber: currentLineNumber.value,
                  data: currentExtend.value.data,
                  onUpdate: props.diffFile.notifyAll,
                })}
            </div>
          </td>
        </tr>
      );
    };
  },
  { name: "DiffSplitExtendLine", props: ["index", "diffFile", "lineNumber", "side"] }
);
