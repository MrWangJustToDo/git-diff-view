import { SplitSide, type DiffFile } from "@git-diff-view/core";
import { borderColorName, emptyBGName } from "@git-diff-view/utils";
import { createEffect, createMemo, createSignal, onCleanup, Show } from "solid-js";

import { useRenderWidget } from "../hooks";

import { useDiffWidgetContext } from "./DiffWidgetContext";

export const DiffSplitWidgetLine = (props: { index: number; diffFile: DiffFile; lineNumber: number }) => {
  const renderWidget = useRenderWidget();

  const [widget, setWidget] = useDiffWidgetContext() || [];

  const [oldLine, setOldLine] = createSignal(props.diffFile.getSplitLeftLine(props.index));

  const [newLine, setNewLine] = createSignal(props.diffFile.getSplitRightLine(props.index));

  const oldLineWidget = createMemo(
    () => oldLine()?.lineNumber && widget?.()?.side === SplitSide.old && widget?.()?.lineNumber === oldLine()?.lineNumber
  );

  const newLineWidget = createMemo(
    () => newLine()?.lineNumber && widget?.()?.side === SplitSide.new && widget?.()?.lineNumber === newLine()?.lineNumber
  );

  createEffect(() => {
    const init = () => {
      setOldLine(props.diffFile.getSplitLeftLine(props.index));
      setNewLine(props.diffFile.getSplitRightLine(props.index));
    };

    init();

    const cb = props.diffFile.subscribe(init);

    onCleanup(cb);
  });

  // TODO improve
  const currentIsShow = createMemo(
    () => (!!oldLineWidget() || !!newLineWidget()) && !oldLine()?.isHidden && !newLine()?.isHidden && !!renderWidget
  );

  const onCloseWidget = () => setWidget?.({});

  return (
    <Show when={currentIsShow()}>
      <tr data-line={`${props.lineNumber}-widget`} data-state="widget" class="diff-line diff-line-widget">
        {oldLineWidget() && renderWidget() ? (
          <td class="diff-line-widget-old-content p-0" colspan={2}>
            <div class="diff-line-widget-wrapper">
              {renderWidget?.()?.({
                diffFile: props.diffFile,
                side: SplitSide.old,
                lineNumber: oldLine()?.lineNumber || 0,
                onClose: onCloseWidget,
              })}
            </div>
          </td>
        ) : (
          <td
            class="diff-line-widget-old-placeholder select-none p-0"
            style={{ "background-color": `var(${emptyBGName})` }}
            colspan={2}
          />
        )}
        {newLineWidget() && renderWidget() ? (
          <td
            class="diff-line-widget-new-content border-l-[1px] p-0"
            colspan={2}
            style={{ "border-left-color": `var(${borderColorName})`, "border-left-style": "solid" }}
          >
            <div class="diff-line-widget-wrapper">
              {renderWidget?.()?.({
                diffFile: props.diffFile,
                side: SplitSide.new,
                lineNumber: newLine()?.lineNumber || 0,
                onClose: onCloseWidget,
              })}
            </div>
          </td>
        ) : (
          <td
            class="diff-line-widget-new-placeholder select-none border-l-[1px] p-0"
            style={{
              "background-color": `var(${emptyBGName})`,
              "border-left-color": `var(${borderColorName})`,
              "border-left-style": "solid",
            }}
            colspan={2}
          />
        )}
      </tr>
    </Show>
  );
};
