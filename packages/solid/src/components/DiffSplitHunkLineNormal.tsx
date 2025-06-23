import { composeLen, SplitSide, type DiffFile } from "@git-diff-view/core";
import {
  diffAsideWidthName,
  DiffModeEnum,
  hunkContentBGName,
  hunkContentColorName,
  hunkLineNumberBGName,
  plainLineNumberColorName,
} from "@git-diff-view/utils";
import { createEffect, createMemo, createSignal, Show } from "solid-js";

import { useMode, useSyncHeight } from "../hooks";

import { ExpandAll, ExpandDown, ExpandUp } from "./DiffExpand";

const DiffSplitHunkLineGitHub = (props: { index: number; side: SplitSide; diffFile: DiffFile; lineNumber: number }) => {
  const [currentHunk, setCurrentHunk] = createSignal(props.diffFile.getSplitHunkLine(props.index));

  const [enableExpand, setEnableExpand] = createSignal(props.diffFile.getExpandEnabled());

  const [couldExpand, setCouldExpand] = createSignal(enableExpand() && currentHunk()?.splitInfo);

  const lineSelector = createMemo(() => `tr[data-line="${props.lineNumber}-hunk"]`);

  const currentShowExpand = createMemo(() => props.side === SplitSide.old);

  const checkCurrentShowExpandAll = () => {
    const hunk = currentHunk();
    return hunk && hunk.splitInfo && hunk.splitInfo.endHiddenIndex - hunk.splitInfo.startHiddenIndex < composeLen;
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
      setCurrentIsShow(checkCurrentIsShow());
      setCurrentShowExpandAll(checkCurrentShowExpandAll());
    };

    init();

    const cb = props.diffFile.subscribe(init);

    return () => {
      cb();
    };
  });

  const currentSyncHeightSide = createMemo(() => SplitSide[SplitSide.old]);

  const currentEnableSyncHeight = createMemo(() => props.side === SplitSide.new && !!currentIsShow());

  useSyncHeight({
    selector: lineSelector,
    wrapper: lineSelector,
    side: currentSyncHeightSide,
    enable: currentEnableSyncHeight,
  });

  return (
    <Show when={currentIsShow() || currentIsPureHunk()}>
      <tr
        data-line={`${props.lineNumber}-hunk`}
        data-state="hunk"
        data-side={SplitSide[props.side]}
        style={{ "background-color": `var(${hunkContentBGName})` }}
        class="diff-line diff-line-hunk"
      >
        {currentShowExpand() ? (
          <>
            <td
              class="diff-line-hunk-action sticky left-0 w-[1%] min-w-[40px] select-none p-[1px]"
              style={{
                "background-color": `var(${hunkLineNumberBGName})`,
                color: `var(${plainLineNumberColorName})`,
                width: `var(${diffAsideWidthName})`,
                "min-width": `var(${diffAsideWidthName})`,
                "max-width": `var(${diffAsideWidthName})`,
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
                {currentHunk()?.splitInfo?.plainText || currentHunk()?.text}
              </div>
            </td>
          </>
        ) : (
          <td
            class="diff-line-hunk-placeholder select-none"
            colspan={2}
            style={{ "background-color": `var(${hunkContentBGName})` }}
          >
            <div class="min-h-[28px]">&ensp;</div>
          </td>
        )}
      </tr>
    </Show>
  );
};

const DiffSplitHunkLineGitLab = (props: { index: number; side: SplitSide; diffFile: DiffFile; lineNumber: number }) => {
  const [currentHunk, setCurrentHunk] = createSignal(props.diffFile.getSplitHunkLine(props.index));

  const [enableExpand, setEnableExpand] = createSignal(props.diffFile.getExpandEnabled());

  const [couldExpand, setCouldExpand] = createSignal(enableExpand() && currentHunk()?.splitInfo);

  const lineSelector = createMemo(() => `tr[data-line="${props.lineNumber}-hunk"]`);

  const checkCurrentShowExpandAll = () => {
    const hunk = currentHunk();
    return hunk && hunk.splitInfo && hunk.splitInfo.endHiddenIndex - hunk.splitInfo.startHiddenIndex < composeLen;
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

  const currentSyncHeightSide = createMemo(() => SplitSide[SplitSide.old]);

  const currentEnableSyncHeight = createMemo(() => props.side === SplitSide.new && !!currentIsShow());

  createEffect(() => {
    const init = () => {
      setCurrentHunk(props.diffFile.getSplitHunkLine(props.index));
      setEnableExpand(props.diffFile.getExpandEnabled());
      setCouldExpand(enableExpand() && currentHunk()?.splitInfo);
      setCurrentIsShow(checkCurrentIsShow());
      setCurrentShowExpandAll(checkCurrentShowExpandAll());
    };

    init();

    const cb = props.diffFile.subscribe(init);

    return () => {
      cb();
    };
  });

  useSyncHeight({
    selector: lineSelector,
    wrapper: lineSelector,
    side: currentSyncHeightSide,
    enable: currentEnableSyncHeight,
  });

  return (
    <Show when={currentIsShow() || currentIsPureHunk()}>
      <tr
        data-line={`${props.lineNumber}-hunk`}
        data-state="hunk"
        data-side={SplitSide[props.side]}
        style={{ "background-color": `var(${hunkContentBGName})` }}
        class="diff-line diff-line-hunk"
      >
        <td
          class="diff-line-hunk-action sticky left-0 w-[1%] min-w-[40px] select-none p-[1px]"
          style={{
            "background-color": `var(${hunkLineNumberBGName})`,
            color: `var(${plainLineNumberColorName})`,
            width: `var(${diffAsideWidthName})`,
            "min-width": `var(${diffAsideWidthName})`,
            "max-width": `var(${diffAsideWidthName})`,
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
            {currentHunk()?.splitInfo?.plainText || currentHunk()?.text}
          </div>
        </td>
      </tr>
    </Show>
  );
};

export const DiffSplitHunkLine = (props: {
  index: number;
  side: SplitSide;
  diffFile: DiffFile;
  lineNumber: number;
}) => {
  const mode = useMode();

  return (
    <Show
      when={mode() === DiffModeEnum.SplitGitHub || mode() === DiffModeEnum.Split}
      fallback={
        <DiffSplitHunkLineGitLab
          index={props.index}
          side={props.side}
          diffFile={props.diffFile}
          lineNumber={props.lineNumber}
        />
      }
    >
      <DiffSplitHunkLineGitHub
        index={props.index}
        side={props.side}
        diffFile={props.diffFile}
        lineNumber={props.lineNumber}
      />
    </Show>
  );
};
