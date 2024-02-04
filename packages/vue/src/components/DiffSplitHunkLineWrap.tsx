import { composeLen, type DiffFile } from "@git-diff-view/core";
import { defineComponent, ref } from "vue";

import { useSubscribeDiffFile } from "../hooks/useSubscribeDiffFile";

import { hunkContentBGName, hunkContentColorName, hunkLineNumberBGName, plainLineNumberColorName } from "./color";
import { ExpandAll, ExpandDown, ExpandUp } from "./DiffExpand";

export const DiffSplitHunkLine = defineComponent(
  (props: { index: number; diffFile: DiffFile; lineNumber: number }) => {
    const currentHunk = ref(props.diffFile.getSplitHunkLine(props.index));

    const enableExpand = ref(props.diffFile.getExpandEnabled());

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

    return () => {
      if (!currentIsShow.value) return null;

      return (
        <tr data-line={`${props.lineNumber}-hunk`} data-state="hunk" class="diff-line diff-line-hunk select-none">
          <td
            class="diff-line-hunk-action p-[1px] w-[1%] min-w-[40px] select-none"
            style={{
              backgroundColor: `var(${hunkLineNumberBGName})`,
              color: `var(${plainLineNumberColorName})`,
            }}
          >
            {enableExpand.value &&
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
          <td
            class="diff-line-hunk-content pr-[10px] align-middle"
            style={{ backgroundColor: `var(${hunkContentBGName})` }}
            colspan={3}
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
        </tr>
      );
    };
  },
  { name: "DiffSplitHunkLine", props: ["diffFile", "index", "lineNumber"] }
);

export const DiffSplitLastHunkLine = defineComponent(
  (props: { diffFile: DiffFile }) => {
    const currentIsShow = ref(props.diffFile.getNeedShowExpandAll("split") && props.diffFile.getExpandEnabled());

    useSubscribeDiffFile(
      props,
      (diffFile) => (currentIsShow.value = diffFile.getNeedShowExpandAll("split") && diffFile.getExpandEnabled())
    );

    return () => {
      if (!currentIsShow.value) return null;

      return (
        <tr data-line="last-hunk" data-state="hunk" class="diff-line diff-line-hunk">
          <td
            class="diff-line-hunk-action p-[1px] w-[1%] min-w-[40px] select-none"
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
            class="diff-line-hunk-content pr-[10px] align-middle select-none"
            colspan={3}
            style={{ backgroundColor: `var(${hunkContentBGName})` }}
          >
            <span>&ensp;</span>
          </td>
        </tr>
      );
    };
  },
  { name: "DiffSplitExpandLastLine", props: ["diffFile"] }
);
