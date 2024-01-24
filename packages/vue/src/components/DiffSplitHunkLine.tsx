import { composeLen, type DiffFile } from "@git-diff-view/core";
import { computed, defineComponent, ref } from "vue";

import { useEnableWrap } from "../context";
import { useSubscribeDiffFile } from "../hooks/useSubscribeDiffFile";
import { useSyncHeight } from "../hooks/useSyncHeight";

import { hunkContentBGName, hunkContentColorName, hunkLineNumberBGName, plainLineNumberColorName } from "./color";
import { ExpandAll, ExpandDown, ExpandUp } from "./DiffExpand";
import { SplitSide } from "./DiffView";

export const DiffSplitHunkLine = defineComponent(
  (props: { index: number; side: SplitSide; diffFile: DiffFile; lineNumber: number }) => {
    const enableWrap = useEnableWrap();

    const currentHunk = ref(props.diffFile.getSplitHunkLine(props.index));

    const side = computed(() => (props.side === SplitSide.old ? "left" : "right"));

    const lineSelector = computed(() => `tr[data-line="${props.lineNumber}-hunk"]`);

    const currentShowExpand = computed(() => props.side === SplitSide.old);

    const currentShowExpandAll = ref(
      currentHunk.value && currentHunk.value.splitInfo && currentHunk.value.splitInfo.endHiddenIndex - currentHunk.value.splitInfo.startHiddenIndex < composeLen
    );

    const currentIsShow = ref(
      currentHunk.value && currentHunk.value.splitInfo && currentHunk.value.splitInfo.startHiddenIndex < currentHunk.value.splitInfo.endHiddenIndex
    );

    useSubscribeDiffFile(props, (diffFile) => (currentHunk.value = diffFile.getSplitHunkLine(props.index)));

    useSubscribeDiffFile(
      props,
      () =>
        (currentShowExpandAll.value =
          currentHunk.value &&
          currentHunk.value.splitInfo &&
          currentHunk.value.splitInfo.endHiddenIndex - currentHunk.value.splitInfo.startHiddenIndex < composeLen)
    );

    useSubscribeDiffFile(
      props,
      () =>
        (currentIsShow.value =
          currentHunk.value && currentHunk.value.splitInfo && currentHunk.value.splitInfo.startHiddenIndex < currentHunk.value.splitInfo.endHiddenIndex)
    );

    useSyncHeight({
      selector: lineSelector,
      side: side,
      enable: currentIsShow,
    });

    return () => {
      if (!currentIsShow.value) return null;

      return (
        <tr
          data-line={`${props.lineNumber}-hunk`}
          data-state="hunk"
          data-side={props.side === SplitSide.old ? "left" : "right"}
          style={{ backgroundColor: `var(${hunkContentBGName})` }}
          class="diff-line diff-line-hunk select-none"
        >
          <td
            class="diff-line-num diff-line-num-hunk left-0 p-[1px] w-[1%] min-w-[50px]"
            style={{
              position: enableWrap.value ? "relative" : "sticky",
              backgroundColor: props.side === SplitSide.old ? `var(${hunkLineNumberBGName})` : undefined,
              color: `var(${plainLineNumberColorName})`,
            }}
          >
            {currentShowExpand.value &&
              (currentShowExpandAll.value ? (
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
              ))}
          </td>
          <td class="diff-line-content diff-line-content-hunk pr-[10px] align-middle">
            {currentShowExpand.value && (
              <div
                class="pl-[1.5em]"
                style={{
                  whiteSpace: enableWrap.value ? "pre-wrap" : "pre",
                  wordBreak: enableWrap.value ? "break-all" : "initial",
                  color: `var(${hunkContentColorName})`,
                }}
              >
                {currentHunk.value.splitInfo.plainText}
              </div>
            )}
          </td>
        </tr>
      );
    };
  },
  { name: "DiffSplitHunkLine", props: ["diffFile", "index", "lineNumber", "side"] }
);

export const DiffSplitExpandLastLine = defineComponent(
  (props: { side: SplitSide; diffFile: DiffFile }) => {
    const enableWrap = useEnableWrap();

    const side = computed(() => (props.side === SplitSide.old ? "left" : "right"));

    const currentIsShow = ref(props.diffFile.getNeedShowExpandAll("split"));

    useSubscribeDiffFile(props, (diffFile) => (currentIsShow.value = diffFile.getNeedShowExpandAll("split")));

    useSyncHeight({
      selector: ref(`tr[data-line="last-hunk"]`),
      side: side,
      enable: currentIsShow,
    });

    return () => {
      if (!currentIsShow.value) return null;

      return (
        <tr
          data-line="last-hunk"
          data-state="hunk"
          data-side={props.side === SplitSide.old ? "left" : "right"}
          style={{ backgroundColor: `var(${hunkContentBGName})` }}
          class="diff-line diff-line-hunk select-none"
        >
          <td
            class="diff-line-num diff-line-num-hunk left-0 p-[1px] w-[1%] min-w-[50px]"
            style={{
              position: enableWrap.value ? "relative" : "sticky",
              backgroundColor: props.side === SplitSide.old ? `var(${hunkLineNumberBGName})` : undefined,
              color: `var(${plainLineNumberColorName})`,
            }}
          >
            {props.side === SplitSide.old && (
              <button
                class="w-full hover:bg-blue-300 flex justify-center items-center py-[2px] cursor-pointer rounded-[2px]"
                title="Expand Down"
                onClick={() => props.diffFile.onSplitLastExpand()}
              >
                <ExpandDown className="fill-current" />
              </button>
            )}
          </td>
          <td class="diff-line-content diff-line-content-hunk pr-[10px] align-middle"></td>
        </tr>
      );
    };
  },
  { name: "DiffSplitExpandLastLine", props: ["diffFile", "side"] }
);
