import { defineComponent, ref, watchEffect } from "vue";

import { SplitSide, useExtendData, useRenderExtendLine } from "../context";
import { useDomWidth } from "../hooks/useDomWidth";
import { useForceUpdate } from "../hooks/useForceUpdate";
import { useSyncHeight } from "../hooks/useSyncHeight";

import { emptyBGName } from "./color";

import type { DiffFileExtends } from "../utils";

export const DiffSplitExtendLine = defineComponent(
  (props: { index: number; side: SplitSide; diffFile: DiffFileExtends; lineNumber: number }) => {
    const extendData = useExtendData();

    const renderExtendLine = useRenderExtendLine();

    const side = ref<"left" | "right">(props.side === SplitSide.old ? "left" : "right");

    const lineSelector = ref(`tr[data-line="${props.lineNumber}-extend"]`);

    const oldItem = ref(props.diffFile.getSplitLeftLine(props.index));

    const newItem = ref(props.diffFile.getSplitRightLine(props.index));

    const currentItem = ref(props.side === SplitSide.old ? oldItem.value : newItem.value);

    const oldExtend = ref(extendData.value?.oldFile?.[oldItem.value?.lineNumber]);

    const newExtend = ref(extendData.value?.newFile?.[newItem.value.lineNumber]);

    const currentExtend = ref(props.side === SplitSide.old ? oldExtend.value : newExtend.value);

    const currentEnable = ref(props.side === SplitSide.old ? !!oldExtend.value : !!newExtend.value);

    const wrapperSelector = ref(props.side === SplitSide.old ? ".old-diff-table-wrapper" : ".new-diff-table-wrapper");

    const currentLineNumber = ref(props.side === SplitSide.old ? oldItem.value.lineNumber : newItem.value.lineNumber);

    const currentIsShow = ref(Boolean((oldExtend.value || newExtend.value) && currentItem.value && !currentItem.value.isHidden && currentItem.value.diff));

    const count = useForceUpdate(props);

    watchEffect(() => {
      side.value = props.side === SplitSide.old ? "left" : "right";

      oldItem.value = props.diffFile.getSplitLeftLine(props.index);

      newItem.value = props.diffFile.getSplitRightLine(props.index);

      lineSelector.value = `tr[data-line="${props.lineNumber}-extend"]`;

      currentItem.value = props.side === SplitSide.old ? oldItem.value : newItem.value;

      oldExtend.value = extendData.value?.oldFile?.[oldItem.value?.lineNumber];

      newExtend.value = extendData.value?.newFile?.[newItem.value.lineNumber];

      currentExtend.value = props.side === SplitSide.old ? oldExtend.value : newExtend.value;

      wrapperSelector.value = props.side === SplitSide.old ? ".old-diff-table-wrapper" : ".new-diff-table-wrapper";

      currentLineNumber.value = props.side === SplitSide.old ? oldItem.value.lineNumber : newItem.value.lineNumber;

      currentIsShow.value = Boolean((oldExtend.value || newExtend.value) && currentItem.value && !currentItem.value.isHidden && currentItem.value.diff);
    });

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
      count.value;

      if (!currentIsShow.value) return null;

      return (
        <tr
          data-line={`${props.lineNumber}-extend`}
          data-state="extend"
          data-side={props.side === SplitSide.old ? "left" : "right"}
          class={"diff-line diff-line-extend" + !currentExtend ? " diff-line-extend-empty" : ""}
          style={{
            backgroundColor: !currentExtend ? `var(${emptyBGName})` : undefined,
          }}
        >
          <td class="diff-line-extend-content align-top p-0" colspan={2}>
            <div class="diff-line-extend-wrapper sticky left-0" style={{ width: width.value + "px" }}>
              {width.value > 0 &&
                currentExtend.value &&
                renderExtendLine.value?.({
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
