import { getSplitContentLines, SplitSide } from "@git-diff-view/core";
import { diffAsideWidthName, diffFontSizeName, removeAllSelection } from "@git-diff-view/utils";
import { createEffect, createMemo, createSignal, onCleanup, For } from "solid-js";

import { useFontSize, useTextWidth } from "../hooks";

import type { DiffFile } from "@git-diff-view/core";

const Style = (props: { splitSideInfo: { side?: SplitSide }; id: string }) => {
  return (
    <style data-select-style>
      {props.splitSideInfo.side === SplitSide.old
        ? `#${props.id} [data-side="${SplitSide[SplitSide.new]}"] {user-select: none} \n#${props.id} [data-state="extend"] {user-select: none} \n#${props.id} [data-state="hunk"] {user-select: none} \n#${props.id} [data-state="widget"] {user-select: none}`
        : props.splitSideInfo.side === SplitSide.new
          ? `#${props.id} [data-side="${SplitSide[SplitSide.old]}"] {user-select: none} \n#${props.id} [data-state="extend"] {user-select: none} \n#${props.id} [data-state="hunk"] {user-select: none} \n#${props.id} [data-state="widget"] {user-select: none}`
          : ""}
    </style>
  );
};

export const DiffSplitViewWrap = (props: { diffFile: DiffFile }) => {
  const [lines, setLines] = createSignal(getSplitContentLines(props.diffFile));

  const [maxText, setMaxText] = createSignal(props.diffFile.splitLineLength.toString());

  const [splitSideInfo, setSplitInfo] = createSignal<{ side?: SplitSide }>({ side: undefined });

  const fontSize = useFontSize();

  const font = createMemo(() => ({ fontSize: `${fontSize() || 14}px`, fontFamily: "Menlo, Consolas, monospace" }));

  createEffect(() => {
    const init = () => {
      setLines(getSplitContentLines(props.diffFile));
      setMaxText(props.diffFile.splitLineLength.toString());
    };

    init();

    const cb = props.diffFile.subscribe(init);

    onCleanup(cb);
  });

  const onMouseDown = (e: MouseEvent) => {
    let ele = e.target;

    // need remove all the selection
    if (ele && ele instanceof HTMLElement && ele.nodeName === "BUTTON") {
      removeAllSelection();
      return;
    }

    while (ele && ele instanceof HTMLElement) {
      const state = ele.getAttribute("data-state");
      const side = ele.getAttribute("data-side");
      if (side) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        setSplitInfo({ side: SplitSide[side] });
        removeAllSelection();
      }
      if (state) {
        if (state === "extend" || state === "hunk" || state === "widget") {
          setSplitInfo({ side: undefined });
          removeAllSelection();
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
        <Style splitSideInfo={splitSideInfo()} id={`diff-root${props.diffFile.getId()}`} />
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
          <tbody class="diff-table-body leading-[1.4]" onMouseDown={onMouseDown}>
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
