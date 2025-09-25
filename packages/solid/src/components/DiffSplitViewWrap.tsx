/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getSplitContentLines, SplitSide } from "@git-diff-view/core";
import { diffAsideWidthName, diffFontSizeName, getDiffIdFromElement, removeAllSelection } from "@git-diff-view/utils";
import { createEffect, createMemo, createSignal, onCleanup, For } from "solid-js";

import { useFontSize, useTextWidth } from "../hooks";

import { DiffSplitContentLine } from "./DiffSplitContentLineWrap";
import { DiffSplitExtendLine } from "./DiffSplitExtendLineWrap";
import { DiffSplitHunkLine } from "./DiffSplitHunkLineWrap";
import { DiffSplitWidgetLine } from "./DiffSplitWidgetLineWrap";

import type { DiffFile } from "@git-diff-view/core";

export const DiffSplitViewWrap = (props: { diffFile: DiffFile }) => {
  const getAllLines = () => getSplitContentLines(props.diffFile);

  const [lines, setLines] = createSignal(getAllLines());

  const [styleRef, setStyleRef] = createSignal<HTMLStyleElement | null>();

  const maxText = createMemo(() => Math.max(props.diffFile.splitLineLength, props.diffFile.fileLineLength).toString());

  const fontSize = useFontSize();

  const font = createMemo(() => ({ fontSize: `${fontSize() || 14}px`, fontFamily: "Menlo, Consolas, monospace" }));

  createEffect(() => {
    const init = () => setLines(getAllLines);

    init();

    const cb = props.diffFile.subscribe(init);

    onCleanup(cb);
  });

  const selectState = { current: undefined as SplitSide | undefined };

  const onSelect = (side?: SplitSide) => {
    const ele = styleRef();

    if (!ele) return;

    if (side) {
      const targetSide = side === SplitSide.old ? SplitSide.new : SplitSide.old;
      ele.textContent = `#diff-root${props.diffFile.getId()} [data-side="${SplitSide[targetSide]}"] {user-select: none} \n#diff-root${props.diffFile.getId()} [data-state="extend"] {user-select: none} \n#diff-root${props.diffFile.getId()} [data-state="hunk"] {user-select: none} \n#diff-root${props.diffFile.getId()} [data-state="widget"] {user-select: none}`;
    } else {
      ele.textContent = "";
    }
  };

  const onMouseDown = (e: MouseEvent) => {
    let ele = e.target;

    // need remove all the selection
    if (ele && ele instanceof HTMLElement && ele.nodeName === "BUTTON") {
      removeAllSelection();
      return;
    }

    const id = getDiffIdFromElement(ele as HTMLElement);

    if (id && id !== `diff-root${props.diffFile.getId()}`) {
      return;
    }

    while (ele && ele instanceof HTMLElement) {
      const state = ele.getAttribute("data-state");
      const side = ele.getAttribute("data-side");
      if (side) {
        // @ts-ignore
        if (selectState.current !== SplitSide[side]) {
          // @ts-ignore
          selectState.current = SplitSide[side];
          // @ts-ignore
          onSelect(SplitSide[side]);
          removeAllSelection();
        }
      }
      if (state) {
        if (state === "extend" || state === "hunk" || state === "widget") {
          if (selectState.current !== undefined) {
            selectState.current = undefined;
            onSelect(undefined);
            removeAllSelection();
          }
          return;
        } else {
          return;
        }
      }

      ele = ele.parentElement;
    }
  };

  const width = useTextWidth({ text: maxText, font });

  const memoWidth = createMemo(() => Math.max(40, width() + 25));

  return (
    <div class="split-diff-view split-diff-view-warp w-full">
      <div
        class="diff-table-wrapper w-full"
        style={{
          [diffAsideWidthName]: `${Math.round(memoWidth())}px`,
          "font-family": "Menlo, Consolas, monospace",
          "font-size": `var(${diffFontSizeName})`,
        }}
      >
        <style data-select-style ref={setStyleRef} />
        <table class="diff-table w-full table-fixed border-collapse border-spacing-0">
          <colgroup>
            <col class="diff-table-old-num-col" width={Math.round(memoWidth())} />
            <col class="diff-table-old-content-col" />
            <col class="diff-table-new-num-col" width={Math.round(memoWidth())} />
            <col class="diff-table-new-content-col" />
          </colgroup>
          <thead class="hidden">
            <tr>
              <th scope="col">old line number</th>
              <th scope="col">old line content</th>
              <th scope="col">new line number</th>
              <th scope="col">new line content</th>
            </tr>
          </thead>
          <tbody class="diff-table-body leading-[1.6]" onMouseDown={onMouseDown}>
            <For each={lines()}>
              {(item) => (
                <>
                  <DiffSplitHunkLine index={item.index} lineNumber={item.lineNumber} diffFile={props.diffFile} />
                  <DiffSplitContentLine index={item.index} lineNumber={item.lineNumber} diffFile={props.diffFile} />
                  <DiffSplitWidgetLine index={item.index} lineNumber={item.lineNumber} diffFile={props.diffFile} />
                  <DiffSplitExtendLine index={item.index} lineNumber={item.lineNumber} diffFile={props.diffFile} />
                </>
              )}
            </For>
            <DiffSplitHunkLine
              index={props.diffFile.splitLineLength}
              lineNumber={props.diffFile.splitLineLength}
              diffFile={props.diffFile}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
};
