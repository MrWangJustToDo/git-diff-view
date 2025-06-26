import { composeLen, type DiffFile } from "@git-diff-view/core";
import {
  hunkLineNumberBGName,
  plainLineNumberColorName,
  diffAsideWidthName,
  hunkContentBGName,
  hunkContentColorName,
} from "@git-diff-view/utils";
import { createEffect, createMemo, createSignal, onCleanup, Show } from "solid-js";

import { useEnableWrap } from "../hooks";

import { ExpandUp, ExpandDown, ExpandAll } from "./DiffExpand";

export const DiffUnifiedHunkLine = (props: { index: number; diffFile: DiffFile; lineNumber: number }) => {
  const currentHunk = createMemo(() => props.diffFile.getUnifiedHunkLine(props.index));

  const enableExpand = createMemo(() => props.diffFile.getExpandEnabled());

  const couldExpand = createMemo(() => enableExpand() && !!currentHunk()?.unifiedInfo);

  const enableWrap = useEnableWrap();

  const checkCurrentIsShow = () => {
    const hunk = currentHunk();
    return hunk && hunk.unifiedInfo && hunk.unifiedInfo.startHiddenIndex < hunk.unifiedInfo.endHiddenIndex;
  };

  const [currentIsShow, setCurrentIsShow] = createSignal(checkCurrentIsShow());

  const checkCurrentIsEnableAll = () => {
    const hunk = currentHunk();
    return hunk && hunk.unifiedInfo && hunk.unifiedInfo.endHiddenIndex - hunk.unifiedInfo.startHiddenIndex < composeLen;
  };

  const [currentIsEnableAll, setCurrentIsEnableAll] = createSignal(checkCurrentIsEnableAll());

  const currentIsFirstLine = createMemo(() => currentHunk()?.isFirst);

  const currentIsLastLine = createMemo(() => currentHunk()?.isLast);

  const currentIsPureHunk = createMemo(
    () => currentHunk() && props.diffFile._getIsPureDiffRender() && !currentHunk()?.unifiedInfo
  );

  createEffect(() => {
    const init = () => {
      setCurrentIsShow(checkCurrentIsShow);
      setCurrentIsEnableAll(checkCurrentIsEnableAll);
    };

    init();

    const unsubscribe = props.diffFile.subscribe(init);

    onCleanup(unsubscribe);
  });

  return (
    <Show when={currentIsShow() || currentIsPureHunk()}>
      <tr data-line={`${props.lineNumber}-hunk`} data-state="hunk" class="diff-line diff-line-hunk">
        <td
          class="diff-line-hunk-action sticky left-0 w-[1%] min-w-[100px] select-none"
          style={{
            "background-color": `var(${hunkLineNumberBGName})`,
            color: `var(${plainLineNumberColorName})`,
            width: `calc(calc(var(${diffAsideWidthName}) + 5px) * 2)`,
            "max-width": `calc(calc(var(${diffAsideWidthName}) + 5px) * 2)`,
            "min-width": `calc(calc(var(${diffAsideWidthName}) + 5px) * 2)`,
          }}
        >
          {couldExpand() ? (
            currentIsFirstLine() ? (
              <button
                class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]"
                title="Expand Up"
                data-title="Expand Up"
                onClick={() => props.diffFile.onUnifiedHunkExpand("up", props.index)}
              >
                <ExpandUp class="fill-current" />
              </button>
            ) : currentIsLastLine() ? (
              <button
                class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]"
                title="Expand Down"
                data-title="Expand Down"
                onClick={() => props.diffFile.onUnifiedHunkExpand("down", props.index)}
              >
                <ExpandDown class="fill-current" />
              </button>
            ) : currentIsEnableAll() ? (
              <button
                class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]"
                title="Expand All"
                data-title="Expand All"
                onClick={() => props.diffFile.onUnifiedHunkExpand("all", props.index)}
              >
                <ExpandAll class="fill-current" />
              </button>
            ) : (
              <>
                <button
                  class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[2px]"
                  title="Expand Down"
                  data-title="Expand Down"
                  onClick={() => props.diffFile.onUnifiedHunkExpand("down", props.index)}
                >
                  <ExpandDown class="fill-current" />
                </button>
                <button
                  class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[2px]"
                  title="Expand Up"
                  data-title="Expand Up"
                  onClick={() => props.diffFile.onUnifiedHunkExpand("up", props.index)}
                >
                  <ExpandUp class="fill-current" />
                </button>
              </>
            )
          ) : (
            <div class="min-h-[28px]">&ensp;</div>
          )}
        </td>
        <td
          class="diff-line-hunk-content pr-[10px] align-middle"
          style={{ "background-color": `var(${hunkContentBGName})` }}
        >
          <div
            class="pl-[1.5em]"
            style={{
              "white-space": enableWrap() ? "pre-wrap" : "pre",
              "word-break": enableWrap() ? "break-all" : "initial",
              color: `var(${hunkContentColorName})`,
            }}
          >
            {currentHunk()?.unifiedInfo?.plainText || currentHunk()?.text}
          </div>
        </td>
      </tr>
    </Show>
  );
};
