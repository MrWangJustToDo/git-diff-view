import { borderColorName, emptyBGName } from "@git-diff-view/utils";
import { computed, defineComponent } from "vue";

import { useSetWidget, useSlots, useWidget } from "../context";

import { SplitSide } from "./DiffView";

import type { DiffFile } from "@git-diff-view/core";

export const DiffSplitWidgetLine = defineComponent(
  (props: { index: number; diffFile: DiffFile; lineNumber: number }) => {
    const slots = useSlots();

    const widget = useWidget();

    const setWidget = useSetWidget();

    const oldLine = computed(() => props.diffFile.getSplitLeftLine(props.index));

    const newLine = computed(() => props.diffFile.getSplitRightLine(props.index));

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

    const hasHidden = computed(() => oldLine.value.isHidden && newLine.value.isHidden);

    const currentIsShow = computed(
      () => (!!oldLineWidget.value || !!newLineWidget.value) && !hasHidden.value && !!slots.widget
    );

    const onCloseWidget = () => setWidget({});

    return () => {
      if (!currentIsShow.value) return null;

      const oldWidgetRendered = oldLineWidget.value
        ? slots.widget?.({
            diffFile: props.diffFile,
            side: SplitSide.old,
            lineNumber: oldLine.value.lineNumber,
            onClose: onCloseWidget,
          })
        : null;

      const newWidgetRendered = newLineWidget.value
        ? slots.widget?.({
            diffFile: props.diffFile,
            side: SplitSide.new,
            lineNumber: newLine.value.lineNumber,
            onClose: onCloseWidget,
          })
        : null;

      return (
        <tr data-line={`${props.lineNumber}-widget`} data-state="widget" class="diff-line diff-line-widget">
          {oldWidgetRendered ? (
            <td class="diff-line-widget-old-content p-0" colspan={2}>
              <div class="diff-line-widget-wrapper">{oldWidgetRendered}</div>
            </td>
          ) : (
            <td
              class="diff-line-widget-old-placeholder select-none p-0"
              style={{ backgroundColor: `var(${emptyBGName})` }}
              colspan={2}
            />
          )}
          {newWidgetRendered ? (
            <td
              class="diff-line-widget-new-content border-l-[1px] p-0"
              colspan={2}
              style={{ borderLeftColor: `var(${borderColorName})`, borderLeftStyle: "solid" }}
            >
              <div class="diff-line-widget-wrapper">{newWidgetRendered}</div>
            </td>
          ) : (
            <td
              class="diff-line-widget-new-placeholder select-none border-l-[1px] p-0"
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
  { name: "DiffSplitWidgetLine", props: ["diffFile", "index", "lineNumber"] }
);
