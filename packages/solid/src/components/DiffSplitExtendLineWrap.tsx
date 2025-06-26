import { SplitSide, type DiffFile } from "@git-diff-view/core";
import { borderColorName, emptyBGName } from "@git-diff-view/utils";
import { createMemo, Show } from "solid-js";

import { useExtendData, useRenderExtend } from "../hooks";

export const DiffSplitExtendLine = (props: { index: number; diffFile: DiffFile; lineNumber: number }) => {
  const extendData = useExtendData();

  const renderExtend = useRenderExtend();

  const oldLine = createMemo(() => props.diffFile.getSplitLeftLine(props.index));

  const newLine = createMemo(() => props.diffFile.getSplitRightLine(props.index));

  const enableExpand = createMemo(() => props.diffFile.getExpandEnabled());

  const oldLineExtend = createMemo(() => extendData()?.oldFile?.[oldLine()?.lineNumber || ""]);

  const newLineExtend = createMemo(() => extendData()?.newFile?.[newLine()?.lineNumber || ""]);

  const checkIsShow = () => {
    const oldExtend = oldLineExtend();
    const newExtend = newLineExtend();
    const oldLineData = oldLine();
    const newLineData = newLine();
    const enableExpandValue = enableExpand();
    const renderExtendValue = renderExtend();

    return (
      (oldExtend || newExtend) &&
      ((!oldLineData?.isHidden && !newLineData?.isHidden) || enableExpandValue) &&
      renderExtendValue
    );
  };

  const currentIsShow = createMemo(checkIsShow);

  return (
    <Show when={currentIsShow()}>
      <tr data-line={`${props.lineNumber}-extend`} data-state="extend" class="diff-line diff-line-extend">
        {renderExtend() && oldLineExtend() ? (
          <td class="diff-line-extend-old-content p-0" colspan={2}>
            <div class="diff-line-extend-wrapper">
              {renderExtend()?.({
                diffFile: props.diffFile,
                side: SplitSide.old,
                lineNumber: oldLine()?.lineNumber || 0,
                data: oldLineExtend()?.data,
                onUpdate: props.diffFile.notifyAll,
              })}
            </div>
          </td>
        ) : (
          <td
            class="diff-line-extend-old-placeholder select-none p-0"
            style={{ "background-color": `var(${emptyBGName})` }}
            colspan={2}
          />
        )}
        {renderExtend() && newLineExtend() ? (
          <td
            class="diff-line-extend-new-content border-l-[1px] p-0"
            colspan={2}
            style={{ "border-left-color": `var(${borderColorName})`, "border-left-style": "solid" }}
          >
            <div class="diff-line-extend-wrapper">
              {renderExtend()?.({
                diffFile: props.diffFile,
                side: SplitSide.new,
                lineNumber: newLine()?.lineNumber || 0,
                data: newLineExtend()?.data,
                onUpdate: props.diffFile.notifyAll,
              })}
            </div>
          </td>
        ) : (
          <td
            class="diff-line-extend-new-placeholder select-none border-l-[1px] p-0"
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
