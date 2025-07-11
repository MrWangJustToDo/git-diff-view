import { SplitSide, type DiffFile } from "@git-diff-view/core";
import { emptyBGName } from "@git-diff-view/utils";
import { createMemo, Show } from "solid-js";

import { useDomWidth, useRenderWidget, useSyncHeight } from "../hooks";

import { useDiffWidgetContext } from "./DiffWidgetContext";

export const DiffSplitWidgetLine = (props: {
  index: number;
  side: SplitSide;
  diffFile: DiffFile;
  lineNumber: number;
}) => {
  const renderWidget = useRenderWidget();

  const [widget, setWidget] = useDiffWidgetContext() || [];

  const oldLine = createMemo(() => props.diffFile.getSplitLeftLine(props.index));

  const newLine = createMemo(() => props.diffFile.getSplitRightLine(props.index));

  const oldLineWidget = createMemo(
    () =>
      !!oldLine()?.lineNumber && widget?.()?.side === SplitSide.old && widget?.()?.lineNumber === oldLine()?.lineNumber
  );

  const newLineWidget = createMemo(
    () =>
      !!newLine()?.lineNumber && widget?.()?.side === SplitSide.new && widget?.()?.lineNumber === newLine()?.lineNumber
  );

  const currentLine = createMemo(() => (props.side === SplitSide.old ? oldLine() : newLine()));

  const currentIsHidden = createMemo(() => currentLine()?.isHidden);

  const lineSelector = createMemo(() => `div[data-line="${props.lineNumber}-widget-content"]`);

  const lineWrapperSelector = createMemo(() => `tr[data-line="${props.lineNumber}-widget"]`);

  const wrapperSelector = createMemo(() =>
    props.side === SplitSide.old ? ".old-diff-table-wrapper" : ".new-diff-table-wrapper"
  );

  const currentWidget = createMemo(() => (props.side === SplitSide.old ? oldLineWidget() : newLineWidget()));

  const observeSide = createMemo(
    () => SplitSide[currentWidget() ? props.side : props.side === SplitSide.old ? SplitSide.new : SplitSide.old]
  );

  const currentIsShow = createMemo(
    () => (!!oldLineWidget() || !!newLineWidget()) && !currentIsHidden() && !!renderWidget
  );

  const currentEnable = createMemo(() => currentWidget() && !!currentIsShow());

  const onCloseWidget = () => setWidget?.({});

  useSyncHeight({
    selector: lineSelector,
    wrapper: lineWrapperSelector,
    side: observeSide,
    enable: currentIsShow,
  });

  const width = useDomWidth({
    selector: wrapperSelector,
    enable: currentEnable,
  });

  return (
    <Show when={currentIsShow()}>
      <tr
        data-line={`${props.lineNumber}-widget`}
        data-state="widget"
        data-side={SplitSide[props.side]}
        class="diff-line diff-line-widget"
      >
        {currentWidget() ? (
          <td class={`diff-line-widget-${SplitSide[props.side]}-content p-0`} colspan={2}>
            <div
              data-line={`${props.lineNumber}-widget-content`}
              data-side={SplitSide[props.side]}
              class="diff-line-widget-wrapper sticky left-0 z-[1]"
              style={{ width: width() + "px" }}
            >
              {width() > 0 &&
                renderWidget()?.({
                  diffFile: props.diffFile,
                  side: props.side,
                  lineNumber: currentLine()?.lineNumber || 0,
                  onClose: onCloseWidget,
                })}
            </div>
          </td>
        ) : (
          <td
            class={`diff-line-widget-${SplitSide[props.side]}-placeholder select-none p-0`}
            style={{ "background-color": `var(${emptyBGName})` }}
            colspan={2}
          >
            <div data-line={`${props.lineNumber}-widget-content`} data-side={SplitSide[props.side]} />
          </td>
        )}
      </tr>
    </Show>
  );
};
