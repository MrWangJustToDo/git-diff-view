import { composeLen, type DiffFile } from "@git-diff-view/core";
import {
  borderColorName,
  hunkContentBGName,
  hunkContentColorName,
  hunkLineNumberBGName,
  plainLineNumberColorName,
} from "@git-diff-view/utils";
import { computed, defineComponent, ref } from "vue";

import { DiffModeEnum } from "..";
import { useMode } from "../context";
import { useSubscribeDiffFile } from "../hooks/useSubscribeDiffFile";

import { ExpandAll, ExpandDown, ExpandUp } from "./DiffExpand";

const DiffSplitHunkLineGitHub = defineComponent(
  (props: { index: number; diffFile: DiffFile; lineNumber: number }) => {
    const currentHunk = ref(props.diffFile.getSplitHunkLine(props.index));

    const enableExpand = ref(props.diffFile.getExpandEnabled());

    const couldExpand = computed(() => enableExpand.value && currentHunk.value && currentHunk.value.splitInfo);

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

    const currentIsFirstLine = ref(currentHunk.value && currentHunk.value.isFirst);

    const currentIsPureHunk = ref(currentHunk.value && !currentHunk.value.splitInfo);

    const currentIsLastLine = ref(currentHunk.value && currentHunk.value.isLast);

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

      currentIsFirstLine.value = currentHunk.value && currentHunk.value.isFirst;

      currentIsLastLine.value = currentHunk.value && currentHunk.value.isLast;

      currentIsPureHunk.value = currentHunk.value && diffFile._getIsPureDiffRender() && !currentHunk.value.splitInfo;
    });

    return () => {
      if (!currentIsShow.value && !currentIsPureHunk.value) return null;

      return (
        <tr data-line={`${props.lineNumber}-hunk`} data-state="hunk" class="diff-line diff-line-hunk select-none">
          <td
            class="diff-line-hunk-action relative w-[1%] min-w-[40px] select-none p-[1px]"
            style={{
              backgroundColor: `var(${hunkLineNumberBGName})`,
              color: `var(${plainLineNumberColorName})`,
            }}
          >
            {couldExpand.value ? (
              currentIsFirstLine.value ? (
                <button
                  class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]"
                  title="Expand Up"
                  data-title="Expand Up"
                  onClick={() => props.diffFile.onSplitHunkExpand("up", props.index)}
                >
                  <ExpandUp className="fill-current" />
                </button>
              ) : currentIsLastLine.value ? (
                <button
                  class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]"
                  title="Expand Down"
                  data-title="Expand Down"
                  onClick={() => props.diffFile.onSplitHunkExpand("down", props.index)}
                >
                  <ExpandDown className="fill-current" />
                </button>
              ) : currentShowExpandAll.value ? (
                <button
                  class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]"
                  title="Expand All"
                  data-title="Expand All"
                  onClick={() => props.diffFile.onSplitHunkExpand("all", props.index)}
                >
                  <ExpandAll className="fill-current" />
                </button>
              ) : (
                <>
                  <button
                    class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[2px]"
                    title="Expand Down"
                    data-title="Expand Down"
                    onClick={() => props.diffFile.onSplitHunkExpand("down", props.index)}
                  >
                    <ExpandDown className="fill-current" />
                  </button>
                  <button
                    class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[2px]"
                    title="Expand Up"
                    data-title="Expand Up"
                    onClick={() => props.diffFile.onSplitHunkExpand("up", props.index)}
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
            colspan={3}
          >
            <div
              class="pl-[1.5em]"
              style={{
                color: `var(${hunkContentColorName})`,
              }}
            >
              {currentHunk.value.splitInfo?.plainText || currentHunk.value.text}
            </div>
          </td>
        </tr>
      );
    };
  },
  { name: "DiffSplitHunkLine", props: ["diffFile", "index", "lineNumber"] }
);

const DiffSplitHunkLineGitLab = defineComponent(
  (props: { index: number; diffFile: DiffFile; lineNumber: number }) => {
    const currentHunk = ref(props.diffFile.getSplitHunkLine(props.index));

    const enableExpand = ref(props.diffFile.getExpandEnabled());

    const couldExpand = computed(() => enableExpand.value && currentHunk.value && currentHunk.value.splitInfo);

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

    const currentIsFirstLine = ref(currentHunk.value && currentHunk.value.isFirst);

    const currentIsPureHunk = ref(currentHunk.value && !currentHunk.value.splitInfo);

    const currentIsLastLine = ref(currentHunk.value && currentHunk.value.isLast);

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

      currentIsFirstLine.value = currentHunk.value && currentHunk.value.isFirst;

      currentIsLastLine.value = currentHunk.value && currentHunk.value.isLast;

      currentIsPureHunk.value = currentHunk.value && diffFile._getIsPureDiffRender() && !currentHunk.value.splitInfo;
    });

    return () => {
      if (!currentIsShow.value && !currentIsPureHunk.value) return null;

      return (
        <tr data-line={`${props.lineNumber}-hunk`} data-state="hunk" class="diff-line diff-line-hunk select-none">
          <td
            class="diff-line-hunk-action relative w-[1%] min-w-[40px] select-none p-[1px]"
            style={{
              backgroundColor: `var(${hunkLineNumberBGName})`,
              color: `var(${plainLineNumberColorName})`,
            }}
          >
            {couldExpand.value ? (
              currentIsFirstLine.value ? (
                <button
                  class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]"
                  title="Expand Up"
                  data-title="Expand Up"
                  onClick={() => props.diffFile.onSplitHunkExpand("up", props.index)}
                >
                  <ExpandUp className="fill-current" />
                </button>
              ) : currentIsLastLine.value ? (
                <button
                  class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]"
                  title="Expand Down"
                  data-title="Expand Down"
                  onClick={() => props.diffFile.onSplitHunkExpand("down", props.index)}
                >
                  <ExpandDown className="fill-current" />
                </button>
              ) : currentShowExpandAll.value ? (
                <button
                  class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]"
                  title="Expand All"
                  data-title="Expand All"
                  onClick={() => props.diffFile.onSplitHunkExpand("all", props.index)}
                >
                  <ExpandAll className="fill-current" />
                </button>
              ) : (
                <>
                  <button
                    class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[2px]"
                    title="Expand Down"
                    data-title="Expand Down"
                    onClick={() => props.diffFile.onSplitHunkExpand("down", props.index)}
                  >
                    <ExpandDown className="fill-current" />
                  </button>
                  <button
                    class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[2px]"
                    title="Expand Up"
                    data-title="Expand Up"
                    onClick={() => props.diffFile.onSplitHunkExpand("up", props.index)}
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
                color: `var(${hunkContentColorName})`,
              }}
            >
              {currentHunk.value.splitInfo?.plainText || currentHunk.value.text}
            </div>
          </td>
          <td
            class="diff-line-hunk-action relative w-[1%] min-w-[40px] select-none border-l-[1px] p-[1px]"
            style={{
              backgroundColor: `var(${hunkLineNumberBGName})`,
              color: `var(${plainLineNumberColorName})`,
              borderLeftColor: `var(${borderColorName})`,
            }}
          >
            {couldExpand.value ? (
              currentIsFirstLine.value ? (
                <button
                  class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]"
                  title="Expand Up"
                  data-title="Expand Up"
                  onClick={() => props.diffFile.onSplitHunkExpand("up", props.index)}
                >
                  <ExpandUp className="fill-current" />
                </button>
              ) : currentIsLastLine.value ? (
                <button
                  class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]"
                  title="Expand Down"
                  data-title="Expand Down"
                  onClick={() => props.diffFile.onSplitHunkExpand("down", props.index)}
                >
                  <ExpandDown className="fill-current" />
                </button>
              ) : currentShowExpandAll.value ? (
                <button
                  class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]"
                  title="Expand All"
                  data-title="Expand All"
                  onClick={() => props.diffFile.onSplitHunkExpand("all", props.index)}
                >
                  <ExpandAll className="fill-current" />
                </button>
              ) : (
                <>
                  <button
                    class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[2px]"
                    title="Expand Down"
                    data-title="Expand Down"
                    onClick={() => props.diffFile.onSplitHunkExpand("down", props.index)}
                  >
                    <ExpandDown className="fill-current" />
                  </button>
                  <button
                    class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[2px]"
                    title="Expand Up"
                    data-title="Expand Up"
                    onClick={() => props.diffFile.onSplitHunkExpand("up", props.index)}
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
            class="diff-line-hunk-content relative pr-[10px] align-middle"
            style={{ backgroundColor: `var(${hunkContentBGName})` }}
          >
            <div
              class="pl-[1.5em]"
              style={{
                color: `var(${hunkContentColorName})`,
              }}
            >
              {currentHunk.value.splitInfo?.plainText || currentHunk.value.text}
            </div>
          </td>
        </tr>
      );
    };
  },
  { name: "DiffSplitHunkLine", props: ["diffFile", "index", "lineNumber"] }
);

export const DiffSplitHunkLine = defineComponent(
  (props: { index: number; diffFile: DiffFile; lineNumber: number }) => {
    const diffViewMode = useMode();

    return () => {
      if (diffViewMode.value === DiffModeEnum.SplitGitHub || diffViewMode.value === DiffModeEnum.Split) {
        return <DiffSplitHunkLineGitHub index={props.index} diffFile={props.diffFile} lineNumber={props.lineNumber} />;
      } else {
        return <DiffSplitHunkLineGitLab index={props.index} diffFile={props.diffFile} lineNumber={props.lineNumber} />;
      }
    };
  },
  { name: "DiffSplitHunkLine", props: ["diffFile", "index", "lineNumber"] }
);
