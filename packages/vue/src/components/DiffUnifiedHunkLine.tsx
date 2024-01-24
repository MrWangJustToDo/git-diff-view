import { composeLen } from "@git-diff-view/core";
import { defineComponent, ref } from "vue";

import { useEnableWrap } from "../context";
import { useSubscribeDiffFile } from "../hooks/useSubscribeDiffFile";

import { hunkContentBGName, hunkContentColorName, hunkLineNumberBGName, plainLineNumberColorName } from "./color";
import { ExpandAll, ExpandDown, ExpandUp } from "./DiffExpand";

import type { DiffFile } from "@git-diff-view/core";

export const DiffUnifiedHunkLine = defineComponent(
  (props: { index: number; diffFile: DiffFile; lineNumber: number }) => {
    const currentHunk = ref(props.diffFile.getUnifiedHunkLine(props.index));

    const enableWrap = useEnableWrap();

    const currentIsShow = ref(
      currentHunk.value && currentHunk.value.unifiedInfo && currentHunk.value.unifiedInfo.startHiddenIndex < currentHunk.value.unifiedInfo.endHiddenIndex
    );

    const currentIsEnableAll = ref(
      currentHunk.value &&
        currentHunk.value.unifiedInfo &&
        currentHunk.value.unifiedInfo.endHiddenIndex - currentHunk.value.unifiedInfo.startHiddenIndex < composeLen
    );

    useSubscribeDiffFile(props, (diffFile) => (currentHunk.value = diffFile.getUnifiedHunkLine(props.index)));

    useSubscribeDiffFile(
      props,
      () =>
        (currentIsShow.value =
          currentHunk.value && currentHunk.value.unifiedInfo && currentHunk.value.unifiedInfo.startHiddenIndex < currentHunk.value.unifiedInfo.endHiddenIndex)
    );

    useSubscribeDiffFile(
      props,
      () =>
        (currentIsEnableAll.value =
          currentHunk.value &&
          currentHunk.value.unifiedInfo &&
          currentHunk.value.unifiedInfo.endHiddenIndex - currentHunk.value.unifiedInfo.startHiddenIndex < composeLen)
    );

    return () => {
      if (!currentIsShow.value) return null;

      return (
        <tr
          data-line={`${props.lineNumber}-hunk`}
          data-state="hunk"
          class="diff-line diff-line-hunk select-none"
          style={{ backgroundColor: `var(${hunkContentBGName})` }}
        >
          <td
            class="diff-line-num diff-line-num-hunk left-0 w-[1%] min-w-[100px]"
            style={{
              position: enableWrap.value ? "relative" : "sticky",
              backgroundColor: `var(${hunkLineNumberBGName})`,
              color: `var(${plainLineNumberColorName})`,
            }}
          >
            {currentIsEnableAll.value ? (
              <button
                class="w-full hover:bg-blue-300 flex justify-center items-center py-[6px] cursor-pointer rounded-[2px]"
                title="Expand All"
                onClick={() => props.diffFile.onUnifiedHunkExpand("all", props.index)}
              >
                <ExpandAll className="fill-current" />
              </button>
            ) : (
              <>
                <button
                  class="w-full hover:bg-blue-300 flex justify-center items-center py-[2px] cursor-pointer rounded-[2px]"
                  title="Expand Down"
                  onClick={() => props.diffFile.onUnifiedHunkExpand("down", props.index)}
                >
                  <ExpandDown className="fill-current" />
                </button>
                <button
                  class="w-full hover:bg-blue-300 flex justify-center items-center py-[2px] cursor-pointer rounded-[2px]"
                  title="Expand Up"
                  onClick={() => props.diffFile.onUnifiedHunkExpand("up", props.index)}
                >
                  <ExpandUp className="fill-current" />
                </button>
              </>
            )}
          </td>
          <td class="diff-line-content diff-line-content-hunk pr-[10px] align-middle">
            <div
              class="pl-[1.5em]"
              style={{
                whiteSpace: enableWrap.value ? "pre-wrap" : "pre",
                wordBreak: enableWrap.value ? "break-all" : "initial",
                color: `var(${hunkContentColorName})`,
              }}
            >
              {currentHunk.value.unifiedInfo.plainText}
            </div>
          </td>
        </tr>
      );
    };
  },
  { name: "DiffUnifiedHunkLine", props: ["index", "diffFile", "lineNumber"] }
);

export const DiffUnifiedExpandLastLine = defineComponent(
  (props: { diffFile: DiffFile }) => {
    const currentIsShow = ref(props.diffFile.getNeedShowExpandAll("unified"));

    const enableWrap = useEnableWrap();

    useSubscribeDiffFile(props, (diffFile) => (currentIsShow.value = diffFile.getNeedShowExpandAll("unified")));

    return () => {
      if (!currentIsShow.value) return null;

      return (
        <tr data-line="last-hunk" data-state="hunk" class="diff-line diff-line-hunk select-none" style={{ backgroundColor: `var(${hunkContentBGName})` }}>
          <td
            class="diff-line-num diff-line-num-hunk left-0 w-[1%] min-w-[100px]"
            style={{
              position: enableWrap.value ? "relative" : "sticky",
              backgroundColor: `var(${hunkLineNumberBGName})`,
              color: `var(${plainLineNumberColorName})`,
            }}
          >
            <button
              class="w-full hover:bg-blue-300 flex justify-center items-center py-[2px] cursor-pointer rounded-[2px]"
              title="Expand Down"
              onClick={() => props.diffFile.onUnifiedLastExpand()}
            >
              <ExpandDown className="fill-current" />
            </button>
          </td>
          <td class="diff-line-content diff-line-content-hunk pr-[10px] align-middle" />
        </tr>
      );
    };
  },
  { name: "DiffUnifiedExpandLastLine", props: ["diffFile"] }
);
