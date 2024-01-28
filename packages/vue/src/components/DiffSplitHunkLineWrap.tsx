import { composeLen, type DiffFile } from "@git-diff-view/core";
import { computed, defineComponent, ref } from "vue";

import { useSubscribeDiffFile } from "../hooks/useSubscribeDiffFile";
import { useSyncHeight } from "../hooks/useSyncHeight";

import { hunkContentBGName, hunkContentColorName, hunkLineNumberBGName, plainLineNumberColorName } from "./color";
import { ExpandAll, ExpandDown, ExpandUp } from "./DiffExpand";
import { SplitSide } from "./DiffView";

export const DiffSplitHunkLine = defineComponent(
  (props: { index: number; side: SplitSide; diffFile: DiffFile; lineNumber: number }) => {
    const currentHunk = ref(props.diffFile.getSplitHunkLine(props.index));

    const enableExpand = ref(props.diffFile.getExpandEnabled());

    const lineSelector = computed(() => `tr[data-line="${props.lineNumber}-hunk"]`);

    const currentShowExpand = computed(() => props.side === SplitSide.old);

    const currentEnableSyncHeight = computed(() => props.side === SplitSide.new);

    const currentSyncHeightSide = computed(() => SplitSide[SplitSide.old]);

    const currentShowExpandAll = ref(
      currentHunk.value &&
        currentHunk.value.splitInfo &&
        currentHunk.value.splitInfo.endHiddenIndex - currentHunk.value.splitInfo.startHiddenIndex < composeLen
    );

    const currentIsShow = ref(
      currentHunk.value &&
        currentHunk.value.splitInfo &&
        currentHunk.value.splitInfo.startHiddenIndex < currentHunk.value.splitInfo.endHiddenIndex
    );

    useSubscribeDiffFile(props, (diffFile) => {
      currentHunk.value = diffFile.getSplitHunkLine(props.index);

      enableExpand.value = diffFile.getExpandEnabled();

      currentShowExpandAll.value =
        currentHunk.value &&
        currentHunk.value.splitInfo &&
        currentHunk.value.splitInfo.endHiddenIndex - currentHunk.value.splitInfo.startHiddenIndex < composeLen;

      currentIsShow.value =
        currentHunk.value &&
        currentHunk.value.splitInfo &&
        currentHunk.value.splitInfo.startHiddenIndex < currentHunk.value.splitInfo.endHiddenIndex;
    });

    useSyncHeight({
      selector: lineSelector,
      side: currentSyncHeightSide,
      enable: currentEnableSyncHeight,
    });

    return () => {
      if (!currentIsShow.value) return null;

      return (
        <tr
          data-line={`${props.lineNumber}-hunk`}
          data-state="hunk"
          data-side={SplitSide[props.side]}
          style={{ backgroundColor: `var(${hunkContentBGName})` }}
          class="diff-line diff-line-hunk select-none"
        >
          {currentShowExpand.value ? (
            <>
              <td
                class="diff-line-hunk-action sticky left-0 p-[1px] w-[1%] min-w-[40px]"
                style={{
                  backgroundColor: `var(${hunkLineNumberBGName})`,
                  color: `var(${plainLineNumberColorName})`,
                }}
              >
                {enableExpand.value ? (
                  currentShowExpandAll.value ? (
                    <button
                      class="w-full hover:bg-blue-300 flex justify-center items-center py-[6px] cursor-pointer rounded-[2px]"
                      title="Expand All"
                      onClick={() => props.diffFile.onSplitHunkExpand("all", props.index)}
                    >
                      <ExpandAll className="fill-current" />
                    </button>
                  ) : (
                    <>
                      <button
                        class="w-full hover:bg-blue-300 flex justify-center items-center py-[2px] cursor-pointer rounded-[2px]"
                        title="Expand Down"
                        onClick={() => props.diffFile.onSplitHunkExpand("down", props.index)}
                      >
                        <ExpandDown className="fill-current" />
                      </button>
                      <button
                        class="w-full hover:bg-blue-300 flex justify-center items-center py-[2px] cursor-pointer rounded-[2px]"
                        title="Expand Up"
                        onClick={() => props.diffFile.onSplitHunkExpand("up", props.index)}
                      >
                        <ExpandUp className="fill-current" />
                      </button>
                    </>
                  )
                ) : (
                  <span>&ensp;</span>
                )}
              </td>
              <td
                class="diff-line-hunk-content pr-[10px] align-middle"
                style={{ backgroundColor: `var(${hunkContentBGName})` }}
              >
                <div
                  class="pl-[1.5em]"
                  style={{
                    color: `var(${hunkContentColorName})`,
                  }}
                >
                  {currentHunk.value.splitInfo.plainText}
                </div>
              </td>
            </>
          ) : (
            <td class="diff-line-hunk-placeholder" colspan={2} style={{ backgroundColor: `var(${hunkContentBGName})` }}>
              <span>&ensp;</span>
            </td>
          )}
        </tr>
      );
    };
  },
  { name: "DiffSplitHunkLine", props: ["diffFile", "index", "lineNumber", "side"] }
);

export const DiffSplitLastHunkLine = defineComponent(
  (props: { side: SplitSide; diffFile: DiffFile }) => {
    const enableHunkAction = computed(() => props.side === SplitSide.old);

    const lineSelector = computed(() => `tr[data-line="last-hunk"]`);

    const currentSyncHeightSide = computed(() => SplitSide[SplitSide.old]);

    const currentEnableSyncHeight = computed(() => props.side === SplitSide.new);

    const currentIsShow = ref(props.diffFile.getNeedShowExpandAll("split") && props.diffFile.getExpandEnabled());

    useSubscribeDiffFile(
      props,
      (diffFile) => (currentIsShow.value = diffFile.getNeedShowExpandAll("split") && diffFile.getExpandEnabled())
    );

    useSyncHeight({
      selector: lineSelector,
      side: currentSyncHeightSide,
      enable: currentEnableSyncHeight,
    });

    return () => {
      if (!currentIsShow.value) return null;

      return (
        <tr
          data-line="last-hunk"
          data-state="hunk"
          data-side={SplitSide[props.side]}
          class="diff-line diff-line-hunk select-none"
        >
          {enableHunkAction.value ? (
            <>
              <td
                class="diff-line-hunk-action sticky left-0 p-[1px] w-[1%] min-w-[40px]"
                style={{
                  backgroundColor: `var(${hunkLineNumberBGName})`,
                  color: `var(${plainLineNumberColorName})`,
                }}
              >
                <button
                  class="w-full hover:bg-blue-300 flex justify-center items-center py-[6px] cursor-pointer rounded-[2px]"
                  title="Expand Down"
                  onClick={() => props.diffFile.onSplitLastExpand()}
                >
                  <ExpandDown className="fill-current" />
                </button>
              </td>
              <td
                class="diff-line-hunk-content pr-[10px] align-middle"
                style={{ backgroundColor: `var(${hunkContentBGName})` }}
              >
                <span>&ensp;</span>
              </td>
            </>
          ) : (
            <td class="diff-line-hunk-placeholder" colspan={2} style={{ backgroundColor: `var(${hunkContentBGName})` }}>
              <span>&ensp;</span>
            </td>
          )}
        </tr>
      );
    };
  },
  { name: "DiffSplitLastHunkLine", props: ["diffFile", "side"] }
);
