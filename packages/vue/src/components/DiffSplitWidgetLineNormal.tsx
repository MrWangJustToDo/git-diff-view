import { computed, defineComponent, ref } from "vue";

import { useSetWidget, useSlots, useWidget } from "../context";
import { useDomWidth } from "../hooks/useDomWidth";
import { useSubscribeDiffFile } from "../hooks/useSubscribeDiffFile";
import { useSyncHeight } from "../hooks/useSyncHeight";

import { emptyBGName } from "./color";
import { SplitSide } from "./DiffView";

import type { DiffFile } from "@git-diff-view/core";

export const DiffSplitWidgetLine = defineComponent(
  (props: { index: number; side: SplitSide; diffFile: DiffFile; lineNumber: number }) => {
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

    const currentLine = computed(() => (props.side === SplitSide.old ? oldLine.value : newLine.value));

    const lineSelector = computed(() => `div[data-line="${props.lineNumber}-widget-content"]`);

    const lineWrapperSelector = computed(() => `tr[data-line="${props.lineNumber}-widget"]`);

    const wrapperSelector = computed(() =>
      props.side === SplitSide.old ? ".old-diff-table-wrapper" : ".new-diff-table-wrapper"
    );

    const observeSide = computed(() => SplitSide[props.side]);

    const currentIsShow = computed(
      () => (!!oldLineWidget.value || !!newLineWidget.value) && !currentLine.value.isHidden && !!slots.widget
    );

    const currentWidget = computed(
      () => (props.side === SplitSide.old ? oldLineWidget.value : newLineWidget.value) && !!currentIsShow.value
    );

    const onCloseWidget = () => setWidget({});

    useSyncHeight({
      selector: lineSelector,
      wrapper: lineWrapperSelector,
      side: observeSide,
      enable: currentIsShow,
    });

    const width = useDomWidth({
      selector: wrapperSelector,
      enable: currentWidget,
    });

    return () => {
      if (!currentIsShow.value) return null;

      return (
        <tr
          data-line={`${props.lineNumber}-widget`}
          data-state="widget"
          data-side={SplitSide[props.side]}
          class="diff-line diff-line-widget"
        >
          {currentWidget.value ? (
            <td class={`diff-line-widget-${SplitSide[props.side]}-content p-0`} colspan={2}>
              <div
                data-line={`${props.lineNumber}-widget-content`}
                data-side={SplitSide[props.side]}
                class="diff-line-widget-wrapper sticky left-0"
                style={{ width: width.value + "px" }}
              >
                {width.value > 0 &&
                  slots.widget?.({
                    diffFile: props.diffFile,
                    side: props.side,
                    lineNumber: currentLine.value.lineNumber,
                    onClose: onCloseWidget,
                  })}
              </div>
            </td>
          ) : (
            <td
              class={`diff-line-widget-${SplitSide[props.side]}-placeholder select-none p-0`}
              style={{ backgroundColor: `var(${emptyBGName})` }}
              colspan={2}
            >
              <div data-line={`${props.lineNumber}-widget-content`} data-side={SplitSide[props.side]} />
            </td>
          )}
        </tr>
      );
    };
  },
  { name: "DiffSplitWidgetLine", props: ["diffFile", "index", "lineNumber", "side"] }
);
