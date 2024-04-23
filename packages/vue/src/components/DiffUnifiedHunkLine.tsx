import { composeLen } from "@git-diff-view/core";
import { computed, defineComponent, ref } from "vue";

import { useEnableWrap } from "../context";
import { useSubscribeDiffFile } from "../hooks/useSubscribeDiffFile";

import { hunkContentBGName, hunkContentColorName, hunkLineNumberBGName, plainLineNumberColorName } from "./color";
import { ExpandAll, ExpandDown, ExpandUp } from "./DiffExpand";
import { asideWidth } from "./tools";

import type { DiffFile } from "@git-diff-view/core";

export const DiffUnifiedHunkLine = defineComponent(
  (props: { index: number; diffFile: DiffFile; lineNumber: number }) => {
    const currentHunk = ref(props.diffFile.getUnifiedHunkLine(props.index));

    const enableExpand = ref(props.diffFile.getExpandEnabled());

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

    const currentIsFirstLine = ref(currentHunk.value && currentHunk.value.isFirst);

    const currentIsPureHunk = ref(currentHunk.value && !currentHunk.value.unifiedInfo);

    const currentIsLastLine = ref(currentHunk.value && currentHunk.value.isLast);

    useSubscribeDiffFile(props, (diffFile) => {
      currentHunk.value = diffFile.getUnifiedHunkLine(props.index);

      enableExpand.value = diffFile.getExpandEnabled();

      currentIsShow.value =
        currentHunk.value &&
        currentHunk.value.unifiedInfo &&
        currentHunk.value.unifiedInfo.startHiddenIndex < currentHunk.value.unifiedInfo.endHiddenIndex;

      currentIsEnableAll.value =
        currentHunk.value &&
        currentHunk.value.unifiedInfo &&
        currentHunk.value.unifiedInfo.endHiddenIndex - currentHunk.value.unifiedInfo.startHiddenIndex < composeLen;

      currentIsFirstLine.value = currentHunk.value && currentHunk.value.isFirst;

      currentIsLastLine.value = currentHunk.value && currentHunk.value.isLast;

      currentIsPureHunk.value = currentHunk.value && diffFile._getIsPureDiffRender() && !currentHunk.value.unifiedInfo;
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
              width: `calc(calc(var(${asideWidth}) + 5px) * 2)`,
              maxWidth: `calc(calc(var(${asideWidth}) + 5px) * 2)`,
              minWidth: `calc(calc(var(${asideWidth}) + 5px) * 2)`,
            }}
          >
            {couldExpand.value ? (
              currentIsFirstLine.value ? (
                <button
                  class="w-full diff-widget-tooltip hover:bg-blue-300 flex justify-center items-center py-[6px] cursor-pointer rounded-[2px]"
                  title="Expand Up"
                  data-title="Expand Up"
                  onClick={() => props.diffFile.onUnifiedHunkExpand("up", props.index)}
                >
                  <ExpandUp className="fill-current" />
                </button>
              ) : currentIsLastLine.value ? (
                <button
                  class="w-full diff-widget-tooltip hover:bg-blue-300 flex justify-center items-center py-[6px] cursor-pointer rounded-[2px]"
                  title="Expand Down"
                  data-title="Expand Down"
                  onClick={() => props.diffFile.onUnifiedHunkExpand("down", props.index)}
                >
                  <ExpandDown className="fill-current" />
                </button>
              ) : currentIsEnableAll.value ? (
                <button
                  class="w-full diff-widget-tooltip hover:bg-blue-300 flex justify-center items-center py-[6px] cursor-pointer rounded-[2px]"
                  title="Expand All"
                  data-title="Expand All"
                  onClick={() => props.diffFile.onUnifiedHunkExpand("all", props.index)}
                >
                  <ExpandAll className="fill-current" />
                </button>
              ) : (
                <>
                  <button
                    class="w-full diff-widget-tooltip hover:bg-blue-300 flex justify-center items-center py-[2px] cursor-pointer rounded-[2px]"
                    title="Expand Down"
                    data-title="Expand Down"
                    onClick={() => props.diffFile.onUnifiedHunkExpand("down", props.index)}
                  >
                    <ExpandDown className="fill-current" />
                  </button>
                  <button
                    class="w-full diff-widget-tooltip hover:bg-blue-300 flex justify-center items-center py-[2px] cursor-pointer rounded-[2px]"
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
