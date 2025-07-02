import { getSplitContentLines, SplitSide } from "@git-diff-view/core";
import {
  borderColorName,
  diffAsideWidthName,
  diffFontSizeName,
  removeAllSelection,
  syncScroll,
} from "@git-diff-view/utils";
import { createEffect, createMemo, createSignal, onCleanup, For } from "solid-js";

import { useFontSize, useIsMounted, useTextWidth } from "../hooks";

import { DiffSplitContentLine } from "./DiffSplitContentLineNormal";
import { DiffSplitExtendLine } from "./DiffSplitExtendLineNormal";
import { DiffSplitHunkLine } from "./DiffSplitHunkLineNormal";
import { DiffSplitWidgetLine } from "./DiffSplitWidgetLineNormal";

import type { DiffFile } from "@git-diff-view/core";

const DiffSplitViewTable = (props: {
  side: SplitSide;
  diffFile: DiffFile;
  onSelect?: (side?: SplitSide) => void;
  selectState: { current?: SplitSide };
}) => {
  const className = createMemo(() => (props.side === SplitSide.new ? "new-diff-table" : "old-diff-table"));

  const getAllLines = () => getSplitContentLines(props.diffFile);

  const [lines, setLines] = createSignal(getAllLines());

  const selectState = props.selectState;

  createEffect(() => {
    const init = () => setLines(getAllLines);

    init();

    const cb = props.diffFile.subscribe(init);

    onCleanup(cb);
  });

  const onMouseDown = (e: MouseEvent) => {
    let ele = e.target as HTMLElement | null;

    if (ele && ele?.nodeName === "BUTTON") {
      removeAllSelection();
      return;
    }

    while (ele && ele instanceof HTMLElement) {
      const state = ele.getAttribute("data-state");
      if (state) {
        if (state === "extend" || state === "hunk" || state === "widget") {
          if (selectState.current !== undefined) {
            selectState.current = undefined;
            props.onSelect?.(undefined);
            removeAllSelection();
          }
        } else {
          if (selectState.current !== props.side) {
            selectState.current = props.side;
            props.onSelect?.(props.side);
            removeAllSelection();
          }
        }
        return;
      }
      ele = ele.parentElement;
    }
  };

  return (
    <table class={`${className()} w-full border-collapse border-spacing-0`} data-mode={SplitSide[props.side]}>
      <colgroup>
        <col class={`diff-table-${SplitSide[props.side]}-num-col`} />
        <col class={`diff-table-${SplitSide[props.side]}-content-col`} />
      </colgroup>
      <thead class="hidden">
        <tr>
          <th scope="col">{SplitSide[props.side]} line number</th>
          <th scope="col">{SplitSide[props.side]} line content</th>
        </tr>
      </thead>
      <tbody class="diff-table-body leading-[1.4]" onMouseDown={onMouseDown}>
        <For each={lines()}>
          {(item) => (
            <>
              <DiffSplitHunkLine
                index={item.index}
                side={props.side}
                lineNumber={item.lineNumber}
                diffFile={props.diffFile}
              />
              <DiffSplitContentLine
                index={item.index}
                side={props.side}
                lineNumber={item.lineNumber}
                diffFile={props.diffFile}
              />
              <DiffSplitWidgetLine
                index={item.index}
                side={props.side}
                lineNumber={item.lineNumber}
                diffFile={props.diffFile}
              />
              <DiffSplitExtendLine
                index={item.index}
                side={props.side}
                lineNumber={item.lineNumber}
                diffFile={props.diffFile}
              />
            </>
          )}
        </For>
        <DiffSplitHunkLine
          side={props.side}
          index={props.diffFile.splitLineLength}
          lineNumber={props.diffFile.splitLineLength}
          diffFile={props.diffFile}
        />
      </tbody>
    </table>
  );
};

export const DiffSplitViewNormal = (props: { diffFile: DiffFile }) => {
  const isMounted = useIsMounted();

  const [ref1, setRef1] = createSignal<HTMLDivElement | null>(null);

  const [ref2, setRef2] = createSignal<HTMLDivElement | null>(null);

  const [styleRef, setStyleRef] = createSignal<HTMLStyleElement | null>(null);

  const maxText = createMemo(() => Math.max(props.diffFile.fileLineLength, props.diffFile.splitLineLength).toString());

  const initSyncScroll = () => {
    if (!isMounted()) return;
    const left = ref1();
    const right = ref2();
    if (!left || !right) return;
    const clean = syncScroll(left, right);
    onCleanup(clean);
  };

  createEffect(initSyncScroll);

  const selectState = { current: undefined as SplitSide | undefined };

  const onSelect = (side?: SplitSide) => {
    const ele = styleRef();

    if (!ele) return;

    if (!side) {
      ele.textContent = "";
    } else {
      ele.textContent = `#${getId()} [data-state="extend"] {user-select: none} \n#${getId()} [data-state="hunk"] {user-select: none} \n#${getId()} [data-state="widget"] {user-select: none}`;
    }
  };

  const fontSize = useFontSize();

  const font = createMemo(() => ({ fontSize: `${fontSize() || 14}px`, fontFamily: "Menlo, Consolas, monospace" }));

  const width = useTextWidth({ text: maxText, font });

  const computedWidth = createMemo(() => Math.max(40, width() + 25));

  const getId = () => `diff-split-view-${props.diffFile.getId()}`;

  return (
    <div class="split-diff-view split-diff-view-normal flex w-full basis-[50%]">
      <style data-select-style ref={setStyleRef} />
      <div
        class="old-diff-table-wrapper diff-table-scroll-container w-full overflow-x-auto overflow-y-hidden"
        ref={setRef1}
        style={{
          [diffAsideWidthName]: `${Math.round(computedWidth())}px`,
          "overscroll-behavior-x": "none",
          "font-family": "Menlo, Consolas, monospace",
          "font-size": `var(${diffFontSizeName})`,
        }}
      >
        <DiffSplitViewTable
          side={SplitSide.old}
          diffFile={props.diffFile}
          onSelect={onSelect}
          selectState={selectState}
        />
      </div>
      <div class="diff-split-line w-[1.5px]" style={{ "background-color": `var(${borderColorName})` }} />
      <div
        class="new-diff-table-wrapper diff-table-scroll-container w-full overflow-x-auto overflow-y-hidden"
        ref={setRef2}
        style={{
          [diffAsideWidthName]: `${Math.round(computedWidth())}px`,
          "overscroll-behavior-x": "none",
          "font-family": "Menlo, Consolas, monospace",
          "font-size": `var(${diffFontSizeName})`,
        }}
      >
        <DiffSplitViewTable
          side={SplitSide.new}
          diffFile={props.diffFile}
          onSelect={onSelect}
          selectState={selectState}
        />
      </div>
    </div>
  );
};
