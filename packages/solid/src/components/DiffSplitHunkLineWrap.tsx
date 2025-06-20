import { composeLen, type DiffFile } from "@git-diff-view/core";
import {
  borderColorName,
  DiffModeEnum,
  hunkContentBGName,
  hunkContentColorName,
  hunkLineNumberBGName,
  plainLineNumberColorName,
} from "@git-diff-view/utils";
import { createEffect, createMemo, createSignal, Show } from "solid-js";

import { useMode } from "../hooks";

import { ExpandAll, ExpandDown, ExpandUp } from "./DiffExpand";

const DiffSplitHunkLineGitHub = (props: { index: number; diffFile: DiffFile; lineNumber: number }) => {
  const [currentHunk, setCurrentHunk] = createSignal(props.diffFile.getSplitHunkLine(props.index));

  const [enableExpand, setEnableExpand] = createSignal(props.diffFile.getExpandEnabled());

  const [couldExpand, setCouldExpand] = createSignal(enableExpand() && currentHunk()?.splitInfo);

  const checkCurrentShowExpandAll = () => {
    const hunk = currentHunk();
    return hunk && hunk.splitInfo && hunk.splitInfo.endHiddenIndex - hunk.splitInfo.startHiddenIndex >= composeLen;
  };

  const [currentShowExpandAll, setCurrentShowExpandAll] = createSignal(checkCurrentShowExpandAll());

  const checkCurrentIsShow = () => {
    const hunk = currentHunk();
    return hunk && hunk.splitInfo && hunk.splitInfo.startHiddenIndex < hunk.splitInfo.endHiddenIndex;
  };

  const [currentIsShow, setCurrentIsShow] = createSignal(checkCurrentIsShow());

  const currentIsFirstLine = createMemo(() => {
    const hunk = currentHunk();
    return hunk && hunk.isFirst;
  });

  const currentIsPureHunk = createMemo(() => {
    const hunk = currentHunk();
    return hunk && !hunk.splitInfo;
  });

  const currentIsLastLine = createMemo(() => {
    const hunk = currentHunk();
    return hunk && hunk.isLast;
  });

  createEffect(() => {
    const init = () => {
      setCurrentHunk(props.diffFile.getSplitHunkLine(props.index));
      setEnableExpand(props.diffFile.getExpandEnabled());
      setCouldExpand(enableExpand() && currentHunk()?.splitInfo);
      setCurrentShowExpandAll(checkCurrentShowExpandAll());
      setCurrentIsShow(checkCurrentIsShow());
    };

    init();

    const cb = props.diffFile.subscribe(init);

    return () => {
      cb();
    };
  });

  return (
    <Show when={currentIsShow() || currentIsPureHunk()}>
      <tr data-line={`${props.lineNumber}-hunk`} data-state="hunk" class="diff-line diff-line-hunk">
        <td
          class="diff-line-hunk-action relative w-[1%] min-w-[40px] select-none p-[1px]"
          style={{
            "background-color": `var(${hunkLineNumberBGName})`,
            color: `var(${plainLineNumberColorName})`,
          }}
        >
          {couldExpand() ? (
            currentIsFirstLine() ? (
              <button
                class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]"
                title="Expand Up"
                data-title="Expand Up"
                onClick={() => props.diffFile.onSplitHunkExpand("up", props.index)}
              >
                <ExpandUp class="fill-current" />
              </button>
            ) : currentIsLastLine() ? (
              <button
                class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]"
                title="Expand Down"
                data-title="Expand Down"
                onClick={() => props.diffFile.onSplitHunkExpand("down", props.index)}
              >
                <ExpandDown class="fill-current" />
              </button>
            ) : currentShowExpandAll() ? (
              <button
                class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]"
                title="Expand All"
                data-title="Expand All"
                onClick={() => props.diffFile.onSplitHunkExpand("all", props.index)}
              >
                <ExpandAll class="fill-current" />
              </button>
            ) : (
              <>
                <button
                  class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[2px]"
                  title="Expand Down"
                  data-title="Expand Down"
                  onClick={() => props.diffFile.onSplitHunkExpand("down", props.index)}
                >
                  <ExpandDown class="fill-current" />
                </button>
                <button
                  class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[2px]"
                  title="Expand Up"
                  data-title="Expand Up"
                  onClick={() => props.diffFile.onSplitHunkExpand("up", props.index)}
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
          colspan={3}
        >
          <div
            class="pl-[1.5em]"
            style={{
              color: `var(${hunkContentColorName})`,
            }}
          >
            {currentHunk().splitInfo?.plainText || currentHunk().text}
          </div>
        </td>
      </tr>
    </Show>
  );
};

const DiffSplitHunkLineGitLab = (props: { index: number; diffFile: DiffFile; lineNumber: number }) => {
  const [currentHunk, setCurrentHunk] = createSignal(props.diffFile.getSplitHunkLine(props.index));

  const [enableExpand, setEnableExpand] = createSignal(props.diffFile.getExpandEnabled());

  const [couldExpand, setCouldExpand] = createSignal(enableExpand() && currentHunk()?.splitInfo);

  const checkCurrentShowExpandAll = () => {
    const hunk = currentHunk();
    return hunk && hunk.splitInfo && hunk.splitInfo.endHiddenIndex - hunk.splitInfo.startHiddenIndex >= composeLen;
  };

  const [currentShowExpandAll, setCurrentShowExpandAll] = createSignal(checkCurrentShowExpandAll());

  const checkCurrentIsShow = () => {
    const hunk = currentHunk();
    return hunk && hunk.splitInfo && hunk.splitInfo.startHiddenIndex < hunk.splitInfo.endHiddenIndex;
  };

  const [currentIsShow, setCurrentIsShow] = createSignal(checkCurrentIsShow());

  const currentIsFirstLine = createMemo(() => {
    const hunk = currentHunk();
    return hunk && hunk.isFirst;
  });

  const currentIsPureHunk = createMemo(() => {
    const hunk = currentHunk();
    return hunk && !hunk.splitInfo;
  });

  const currentIsLastLine = createMemo(() => {
    const hunk = currentHunk();
    return hunk && hunk.isLast;
  });

  createEffect(() => {
    const init = () => {
      setCurrentHunk(props.diffFile.getSplitHunkLine(props.index));
      setEnableExpand(props.diffFile.getExpandEnabled());
      setCouldExpand(enableExpand() && currentHunk()?.splitInfo);
      setCurrentShowExpandAll(checkCurrentShowExpandAll());
      setCurrentIsShow(checkCurrentIsShow());
    };

    init();

    const cb = props.diffFile.subscribe(init);

    return () => {
      cb();
    };
  });

  return (
    <Show when={currentIsShow() || currentIsPureHunk()}>
      <tr data-line={`${props.lineNumber}-hunk`} data-state="hunk" class="diff-line diff-line-hunk">
        <td
          class="diff-line-hunk-action relative w-[1%] min-w-[40px] select-none p-[1px]"
          style={{
            "background-color": `var(${hunkLineNumberBGName})`,
            color: `var(${plainLineNumberColorName})`,
          }}
        >
          {couldExpand() ? (
            currentIsFirstLine() ? (
              <button
                class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]"
                title="Expand Up"
                data-title="Expand Up"
                onClick={() => props.diffFile.onSplitHunkExpand("up", props.index)}
              >
                <ExpandUp class="fill-current" />
              </button>
            ) : currentIsLastLine() ? (
              <button
                class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]"
                title="Expand Down"
                data-title="Expand Down"
                onClick={() => props.diffFile.onSplitHunkExpand("down", props.index)}
              >
                <ExpandDown class="fill-current" />
              </button>
            ) : currentShowExpandAll() ? (
              <button
                class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]"
                title="Expand All"
                data-title="Expand All"
                onClick={() => props.diffFile.onSplitHunkExpand("all", props.index)}
              >
                <ExpandAll class="fill-current" />
              </button>
            ) : (
              <>
                <button
                  class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[2px]"
                  title="Expand Down"
                  data-title="Expand Down"
                  onClick={() => props.diffFile.onSplitHunkExpand("down", props.index)}
                >
                  <ExpandDown class="fill-current" />
                </button>
                <button
                  class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[2px]"
                  title="Expand Up"
                  data-title="Expand Up"
                  onClick={() => props.diffFile.onSplitHunkExpand("up", props.index)}
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
              color: `var(${hunkContentColorName})`,
            }}
          >
            {currentHunk().splitInfo?.plainText || currentHunk().text}
          </div>
        </td>
        <td
          class="diff-line-hunk-action relative z-[1] w-[1%] min-w-[40px] select-none border-l-[1px] p-[1px]"
          style={{
            "background-color": `var(${hunkLineNumberBGName})`,
            color: `var(${plainLineNumberColorName})`,
            "border-left-color": `var(${borderColorName})`,
            "border-left-style": "solid",
          }}
        >
          {couldExpand() ? (
            currentIsFirstLine() ? (
              <button
                class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]"
                title="Expand Up"
                data-title="Expand Up"
                onClick={() => props.diffFile.onSplitHunkExpand("up", props.index)}
              >
                <ExpandUp class="fill-current" />
              </button>
            ) : currentIsLastLine() ? (
              <button
                class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]"
                title="Expand Down"
                data-title="Expand Down"
                onClick={() => props.diffFile.onSplitHunkExpand("down", props.index)}
              >
                <ExpandDown class="fill-current" />
              </button>
            ) : currentShowExpandAll() ? (
              <button
                class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]"
                title="Expand All"
                data-title="Expand All"
                onClick={() => props.diffFile.onSplitHunkExpand("all", props.index)}
              >
                <ExpandAll class="fill-current" />
              </button>
            ) : (
              <>
                <button
                  class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[2px]"
                  title="Expand Down"
                  data-title="Expand Down"
                  onClick={() => props.diffFile.onSplitHunkExpand("down", props.index)}
                >
                  <ExpandDown class="fill-current" />
                </button>
                <button
                  class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[2px]"
                  title="Expand Up"
                  data-title="Expand Up"
                  onClick={() => props.diffFile.onSplitHunkExpand("up", props.index)}
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
          class="diff-line-hunk-content relative pr-[10px] align-middle"
          style={{ "background-color": `var(${hunkContentBGName})` }}
        >
          <div
            class="pl-[1.5em]"
            style={{
              color: `var(${hunkContentColorName})`,
            }}
          >
            {currentHunk().splitInfo?.plainText || currentHunk().text}
          </div>
        </td>
      </tr>
    </Show>
  );
};

export const DiffSplitHunkLine = (props: { index: number; diffFile: DiffFile; lineNumber: number }) => {
  const mode = useMode();

  return (
    <Show
      when={mode() === DiffModeEnum.SplitGitHub || mode() === DiffModeEnum.Split}
      fallback={<DiffSplitHunkLineGitLab {...props} />}
    >
      <DiffSplitHunkLineGitHub index={props.index} diffFile={props.diffFile} lineNumber={props.lineNumber} />
    </Show>
  );
};
