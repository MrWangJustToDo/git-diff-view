import { SplitSide, type DiffFile } from "@git-diff-view/core";
import { createMemo, Show } from "solid-js";

import { useDomWidth, useExtendData, useRenderExtend } from "../hooks";

export const DiffUnifiedExtendLine = (props: { index: number; diffFile: DiffFile; lineNumber: number }) => {
  const extendData = useExtendData();

  const renderExtend = useRenderExtend();

  const unifiedItem = createMemo(() => props.diffFile.getUnifiedLine(props.index));

  const oldExtend = createMemo(() => extendData()?.oldFile?.[unifiedItem()?.oldLineNumber || 0]);

  const newExtend = createMemo(() => extendData()?.newFile?.[unifiedItem()?.newLineNumber || 0]);

  const currentIsHidden = createMemo(() => unifiedItem()?.isHidden);

  const currentIsShow = createMemo(() => Boolean((oldExtend() || newExtend()) && !currentIsHidden() && renderExtend()));

  const lineSelector = createMemo(() => `.unified-diff-table-wrapper`);

  const width = useDomWidth({
    selector: lineSelector,
    enable: currentIsShow,
  });

  return (
    <Show when={currentIsShow()}>
      <tr data-line={`${props.lineNumber}-extend`} data-state="extend" class="diff-line diff-line-extend">
        <td class="diff-line-extend-content p-0 align-top" colspan={2}>
          <div class="diff-line-extend-wrapper sticky left-0 z-[1]" style={{ width: width() + "px" }}>
            {width() > 0 &&
              oldExtend() &&
              renderExtend()?.({
                diffFile: props.diffFile,
                side: SplitSide.old,
                lineNumber: unifiedItem()?.oldLineNumber || 0,
                data: oldExtend()?.data,
                onUpdate: props.diffFile.notifyAll,
              })}
            {width() > 0 &&
              newExtend() &&
              renderExtend()?.({
                diffFile: props.diffFile,
                side: SplitSide.new,
                lineNumber: unifiedItem().newLineNumber || 0,
                data: newExtend()?.data,
                onUpdate: props.diffFile.notifyAll,
              })}
          </div>
        </td>
      </tr>
    </Show>
  );
};
