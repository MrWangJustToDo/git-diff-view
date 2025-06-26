import { SplitSide, type DiffFile } from "@git-diff-view/core";
import { emptyBGName } from "@git-diff-view/utils";
import { createMemo, Show } from "solid-js";

import { useDomWidth, useExtendData, useRenderExtend, useSyncHeight } from "../hooks";

export const DiffSplitExtendLine = (props: {
  index: number;
  side: SplitSide;
  diffFile: DiffFile;
  lineNumber: number;
}) => {
  const extendData = useExtendData();

  const renderExtend = useRenderExtend();

  const lineSelector = createMemo(() => `div[data-line="${props.lineNumber}-extend-content"]`);

  const lineWrapperSelector = createMemo(() => `tr[data-line="${props.lineNumber}-extend"]`);

  const wrapperSelector = createMemo(() =>
    props.side === SplitSide.old ? ".old-diff-table-wrapper" : ".new-diff-table-wrapper"
  );

  const oldLine = createMemo(() => props.diffFile.getSplitLeftLine(props.index));

  const newLine = createMemo(() => props.diffFile.getSplitRightLine(props.index));

  const enableExpand = createMemo(() => props.diffFile.getExpandEnabled());

  const oldLineExtend = createMemo(() => extendData()?.oldFile?.[oldLine()?.lineNumber || ""]);

  const newLineExtend = createMemo(() => extendData()?.newFile?.[newLine()?.lineNumber || ""]);

  const currentItem = createMemo(() => (props.side === SplitSide.old ? oldLine() : newLine()));

  const currentIsHidden = createMemo(() => currentItem()?.isHidden);

  const currentExtend = createMemo(() => (props.side === SplitSide.old ? oldLineExtend() : newLineExtend()));

  const currentLineNumber = createMemo(() =>
    props.side === SplitSide.old ? oldLine()?.lineNumber : newLine()?.lineNumber
  );

  const currentIsShow = createMemo(() =>
    Boolean((oldLineExtend() || newLineExtend()) && (!currentIsHidden() || enableExpand()) && renderExtend())
  );

  const currentEnable = createMemo(
    () => (props.side === SplitSide.old ? !!oldLineExtend() : !!newLineExtend()) && currentIsShow()
  );

  const extendSide = createMemo(
    () => SplitSide[currentExtend() ? props.side : props.side === SplitSide.new ? SplitSide.old : SplitSide.new]
  );

  useSyncHeight({
    selector: lineSelector,
    wrapper: lineWrapperSelector,
    side: extendSide,
    enable: currentIsShow,
  });

  const width = useDomWidth({
    selector: wrapperSelector,
    enable: currentEnable,
  });

  return (
    <Show when={currentIsShow()}>
      <tr
        data-line={`${props.lineNumber}-extend`}
        data-state="extend"
        data-side={SplitSide[props.side]}
        class="diff-line diff-line-extend"
      >
        {renderExtend() && currentExtend() ? (
          <td class={`diff-line-extend-${SplitSide[props.side]}-content p-0`} colspan={2}>
            <div
              data-line={`${props.lineNumber}-extend-content`}
              data-side={SplitSide[props.side]}
              class="diff-line-extend-wrapper sticky left-0 z-[1]"
              style={{ width: width() + "px" }}
            >
              {width() > 0 &&
                renderExtend()?.({
                  diffFile: props.diffFile,
                  side: props.side,
                  lineNumber: currentLineNumber() || 0,
                  data: currentExtend()?.data,
                  onUpdate: props.diffFile.notifyAll,
                })}
            </div>
          </td>
        ) : (
          <td
            class={`diff-line-extend-${SplitSide[props.side]}-placeholder select-none p-0`}
            style={{ "background-color": `var(${emptyBGName})` }}
            colspan={2}
          >
            <div data-line={`${props.lineNumber}-extend-content`} data-side={SplitSide[props.side]} />
          </td>
        )}
      </tr>
    </Show>
  );
};
