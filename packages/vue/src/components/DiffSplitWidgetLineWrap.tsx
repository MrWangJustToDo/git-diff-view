import { computed, defineComponent, ref } from "vue";

import { useSetWidget, useSlots, useWidget } from "../context";
import { useSubscribeDiffFile } from "../hooks/useSubscribeDiffFile";

import { emptyBGName } from "./color";
import { SplitSide } from "./DiffView";

import type { DiffFile } from "@git-diff-view/core";

export const DiffSplitWidgetLine = defineComponent(
  (props: { index: number; diffFile: DiffFile; lineNumber: number }) => {
    const slots = useSlots();

    const widget = useWidget();

    const setWidget = useSetWidget();

    const oldLine = ref(props.diffFile.getSplitLeftLine(props.index));

    const newLine = ref(props.diffFile.getSplitRightLine(props.index));

    const oldLineWidget = computed(
      () =>
        oldLine.value.lineNumber &&
        widget.value.side === SplitSide.old &&
        widget.value.lineNumber === oldLine.value.lineNumber
    );

    const newLineWidget = computed(
      () =>
        newLine.value.lineNumber &&
        widget.value.side === SplitSide.new &&
        widget.value.lineNumber === newLine.value.lineNumber
    );

    useSubscribeDiffFile(props, (diffFile) => {
      oldLine.value = diffFile.getSplitLeftLine(props.index);

      newLine.value = diffFile.getSplitRightLine(props.index);
    });

    const currentIsShow = computed(() => !!oldLineWidget.value || !!newLineWidget.value);

    const onCloseWidget = () => setWidget({});

    return () => {
      if (!currentIsShow.value || !slots.widget) return null;

      return (
        <tr data-line={`${props.lineNumber}-widget`} data-state="widget" class="diff-line diff-line-widget">
          {oldLineWidget.value ? (
            <td class="diff-line-widget-old-content p-0" colspan={2}>
              <div class="diff-line-widget-wrapper">
                {slots.widget?.({
                  diffFile: props.diffFile,
                  side: SplitSide.old,
                  lineNumber: oldLine.value.lineNumber,
                  onClose: onCloseWidget,
                })}
              </div>
            </td>
          ) : (
            <td
              class="diff-line-widget-old-placeholder p-0"
              style={{ backgroundColor: `var(${emptyBGName})` }}
              colspan={2}
            >
              <span>&ensp;</span>
            </td>
          )}
          {newLineWidget.value ? (
            <td class="diff-line-widget-new-content p-0 border-l-[1px] border-l-[#ccc]" colspan={2}>
              <div class="diff-line-widget-wrapper">
                {slots.widget?.({
                  diffFile: props.diffFile,
                  side: SplitSide.new,
                  lineNumber: newLine.value.lineNumber,
                  onClose: onCloseWidget,
                })}
              </div>
            </td>
          ) : (
            <td
              class="diff-line-widget-new-placeholder p-0 border-l-[1px] border-l-[#ccc]"
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
  { name: "DiffSplitWidgetLine", props: ["diffFile", "index", "lineNumber"] }
);
