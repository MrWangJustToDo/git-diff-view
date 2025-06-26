import { SplitSide, type DiffFile } from "@git-diff-view/core";
import { createMemo, Show } from "solid-js";

import { useDomWidth, useRenderWidget } from "../hooks";

import { useDiffWidgetContext } from "./DiffWidgetContext";

export const DiffUnifiedWidgetLine = (props: { index: number; diffFile: DiffFile; lineNumber: number }) => {
  const renderWidget = useRenderWidget();

  const [widget, setWidget] = useDiffWidgetContext() || [];

  const unifiedItem = createMemo(() => props.diffFile.getUnifiedLine(props.index));

  const oldWidget = createMemo(
    () =>
      unifiedItem()?.oldLineNumber &&
      widget?.()?.side === SplitSide.old &&
      widget?.()?.lineNumber === unifiedItem()?.oldLineNumber
  );

  const newWidget = createMemo(
    () =>
      unifiedItem()?.newLineNumber &&
      widget?.()?.side === SplitSide.new &&
      widget?.()?.lineNumber === unifiedItem()?.newLineNumber
  );

  const currentIsHidden = createMemo(() => unifiedItem()?.isHidden);

  const currenIsShow = createMemo(() => !!(oldWidget() || newWidget()) && !currentIsHidden() && !!renderWidget());

  const onCloseWidget = () => setWidget?.({});

  const lineSelector = createMemo(() => `.unified-diff-table-wrapper`);

  const width = useDomWidth({
    selector: lineSelector,
    enable: currenIsShow,
  });

  return (
    <Show when={currenIsShow()}>
      <tr data-line={`${props.lineNumber}-widget`} data-state="widget" class="diff-line diff-line-widget">
        <td class="diff-line-widget-content p-0" colspan={2}>
          <div class="diff-line-widget-wrapper sticky left-0 z-[1]" style={{ width: width() + "px" }}>
            {width() > 0 &&
              oldWidget() &&
              renderWidget()?.({
                diffFile: props.diffFile,
                side: SplitSide.old,
                lineNumber: unifiedItem()?.oldLineNumber || 0,
                onClose: onCloseWidget,
              })}
            {width() > 0 &&
              newWidget() &&
              renderWidget()?.({
                diffFile: props.diffFile,
                side: SplitSide.new,
                lineNumber: unifiedItem().newLineNumber || 0,
                onClose: onCloseWidget,
              })}
          </div>
        </td>
      </tr>
    </Show>
  );
};
