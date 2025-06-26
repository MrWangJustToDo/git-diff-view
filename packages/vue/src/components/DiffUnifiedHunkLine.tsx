import { composeLen } from "@git-diff-view/core";
import {
  hunkContentBGName,
  hunkContentColorName,
  hunkLineNumberBGName,
  plainLineNumberColorName,
  diffAsideWidthName,
} from "@git-diff-view/utils";
import { computed, defineComponent, ref } from "vue";

import { useEnableWrap } from "../context";
import { useSubscribeDiffFile } from "../hooks/useSubscribeDiffFile";

import { ExpandAll, ExpandDown, ExpandUp } from "./DiffExpand";

import type { DiffFile } from "@git-diff-view/core";

export const DiffUnifiedHunkLine = defineComponent(
  (props: { index: number; diffFile: DiffFile; lineNumber: number }) => {
    const currentHunk = computed(() => props.diffFile.getUnifiedHunkLine(props.index));

    const enableExpand = computed(() => props.diffFile.getExpandEnabled());

    const couldExpand = computed(() => enableExpand.value && currentHunk.value && currentHunk.value.unifiedInfo);

    const enableWrap = useEnableWrap();

    const currentIsShow = ref(
      currentHunk.value &&
        currentHunk.value.unifiedInfo &&
        currentHunk.value.unifiedInfo.startHiddenIndex < currentHunk.value.unifiedInfo.endHiddenIndex
    );

    const currentIsEnableAll = ref(
      currentHunk.value &&
        currentHunk.value.unifiedInfo &&
        currentHunk.value.unifiedInfo.endHiddenIndex - currentHunk.value.unifiedInfo.startHiddenIndex < composeLen
    );

    const currentIsFirstLine = computed(() => currentHunk.value && currentHunk.value.isFirst);

    const currentIsLastLine = computed(() => currentHunk.value && currentHunk.value.isLast);

    const currentIsPureHunk = computed(
      () => currentHunk.value && props.diffFile._getIsPureDiffRender() && !currentHunk.value.unifiedInfo
    );

    useSubscribeDiffFile(props, () => {
      currentIsShow.value =
        currentHunk.value &&
        currentHunk.value.unifiedInfo &&
        currentHunk.value.unifiedInfo.startHiddenIndex < currentHunk.value.unifiedInfo.endHiddenIndex;

      currentIsEnableAll.value =
        currentHunk.value &&
        currentHunk.value.unifiedInfo &&
        currentHunk.value.unifiedInfo.endHiddenIndex - currentHunk.value.unifiedInfo.startHiddenIndex < composeLen;
    });

    return () => {
      if (!currentIsShow.value && !currentIsPureHunk.value) return null;

      return (
        <tr data-line={`${props.lineNumber}-hunk`} data-state="hunk" class="diff-line diff-line-hunk">
          <td
            class="diff-line-hunk-action sticky left-0 w-[1%] min-w-[100px] select-none"
            style={{
              backgroundColor: `var(${hunkLineNumberBGName})`,
              color: `var(${plainLineNumberColorName})`,
              width: `calc(calc(var(${diffAsideWidthName}) + 5px) * 2)`,
              maxWidth: `calc(calc(var(${diffAsideWidthName}) + 5px) * 2)`,
              minWidth: `calc(calc(var(${diffAsideWidthName}) + 5px) * 2)`,
            }}
          >
            {couldExpand.value ? (
              currentIsFirstLine.value ? (
                <button
                  class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]"
                  title="Expand Up"
                  data-title="Expand Up"
                  onClick={() => props.diffFile.onUnifiedHunkExpand("up", props.index)}
                >
                  <ExpandUp className="fill-current" />
                </button>
              ) : currentIsLastLine.value ? (
                <button
                  class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]"
                  title="Expand Down"
                  data-title="Expand Down"
                  onClick={() => props.diffFile.onUnifiedHunkExpand("down", props.index)}
                >
                  <ExpandDown className="fill-current" />
                </button>
              ) : currentIsEnableAll.value ? (
                <button
                  class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]"
                  title="Expand All"
                  data-title="Expand All"
                  onClick={() => props.diffFile.onUnifiedHunkExpand("all", props.index)}
                >
                  <ExpandAll className="fill-current" />
                </button>
              ) : (
                <>
                  <button
                    class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[2px]"
                    title="Expand Down"
                    data-title="Expand Down"
                    onClick={() => props.diffFile.onUnifiedHunkExpand("down", props.index)}
                  >
                    <ExpandDown className="fill-current" />
                  </button>
                  <button
                    class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[2px]"
                    title="Expand Up"
                    data-title="Expand Up"
                    onClick={() => props.diffFile.onUnifiedHunkExpand("up", props.index)}
                  >
                    <ExpandUp className="fill-current" />
                  </button>
                </>
              )
            ) : (
              <div class="min-h-[28px]">&ensp;</div>
            )}
          </td>
          <td
            class="diff-line-hunk-content pr-[10px] align-middle"
            style={{ backgroundColor: `var(${hunkContentBGName})` }}
          >
            <div
              class="pl-[1.5em]"
              style={{
                whiteSpace: enableWrap.value ? "pre-wrap" : "pre",
                wordBreak: enableWrap.value ? "break-all" : "initial",
                color: `var(${hunkContentColorName})`,
              }}
            >
              {currentHunk.value.unifiedInfo?.plainText || currentHunk.value.text}
            </div>
          </td>
        </tr>
      );
    };
  },
  { name: "DiffUnifiedHunkLine", props: ["index", "diffFile", "lineNumber"] }
);
