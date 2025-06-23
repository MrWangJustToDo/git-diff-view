import { getUnifiedContentLine, type DiffFile } from "@git-diff-view/core";
import { diffAsideWidthName, diffFontSizeName, removeAllSelection } from "@git-diff-view/utils";
import { createEffect, createMemo, createSignal, onCleanup, For } from "solid-js";

import { useEnableWrap, useFontSize, useTextWidth } from "../hooks";

import { DiffUnifiedContentLine } from "./DiffUnifiedContentLine";
import { DiffUnifiedExtendLine } from "./DiffUnifiedExtendLine";
import { DiffUnifiedHunkLine } from "./DiffUnifiedHunkLine";
import { DiffUnifiedWidgetLine } from "./DiffUnifiedWidgetLine";

export const DiffUnifiedView = (props: { diffFile: DiffFile }) => {
  const [lines, setLines] = createSignal(getUnifiedContentLine(props.diffFile));

  const [maxText, setMaxText] = createSignal(props.diffFile.unifiedLineLength.toString());

  createEffect(() => {
    const init = () => {
      setLines(getUnifiedContentLine(props.diffFile));
      setMaxText(props.diffFile.unifiedLineLength.toString());
    };

    init();

    const unsubscribe = props.diffFile.subscribe(init);

    onCleanup(unsubscribe);
  });

  const fontSize = useFontSize();

  const enableWrap = useEnableWrap();

  const [state, setState] = createSignal<boolean>();

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
          setState(false);
          removeAllSelection();
        } else {
          setState(true);
          removeAllSelection();
        }
        return;
      }
      ele = ele.parentElement;
    }
  };

  const font = createMemo(() => ({ fontSize: fontSize() + "px", fontFamily: "Menlo, Consolas, monospace" }));

  const width = useTextWidth({ text: maxText, font });

  const computedWidth = createMemo(() => Math.max(40, width() + 10));

  const getId = () => `diff-root${props.diffFile.getId()}`;

  return (
    <div class={`unified-diff-view ${enableWrap() ? "unified-diff-view-wrap" : "unified-diff-view-normal"} w-full`}>
      <style data-select-style>
        {state()
          ? `#${getId()} [data-state="extend"] {user-select: none} \n#${getId()} [data-state="hunk"] {user-select: none} \n#${getId()} [data-state="widget"] {user-select: none}`
          : ""}
      </style>
      <div
        class="unified-diff-table-wrapper diff-table-scroll-container w-full overflow-x-auto overflow-y-hidden"
        style={{
          [diffAsideWidthName]: `${Math.round(computedWidth())}px`,
          "font-family": "Menlo, Consolas, monospace",
          "font-size": `var(${diffFontSizeName})`,
        }}
      >
        <table
          class={`unified-diff-table w-full border-collapse border-spacing-0 ${enableWrap() ? "table-fixed" : ""}`}
        >
          <colgroup>
            <col class="unified-diff-table-num-col" />
            <col class="unified-diff-table-content-col" />
          </colgroup>
          <thead class="hidden">
            <tr>
              <th scope="col">line number</th>
              <th scope="col">line content</th>
            </tr>
          </thead>
          <tbody class="diff-table-body leading-[1.4]" onMouseDown={onMouseDown}>
            <For each={lines()}>
              {(item) => (
                <>
                  <DiffUnifiedHunkLine index={item.index} lineNumber={item.lineNumber} diffFile={props.diffFile} />
                  <DiffUnifiedContentLine index={item.index} lineNumber={item.lineNumber} diffFile={props.diffFile} />
                  <DiffUnifiedWidgetLine index={item.index} lineNumber={item.lineNumber} diffFile={props.diffFile} />
                  <DiffUnifiedExtendLine index={item.index} lineNumber={item.lineNumber} diffFile={props.diffFile} />
                </>
              )}
            </For>
            <DiffUnifiedHunkLine
              index={props.diffFile.unifiedLineLength}
              lineNumber={props.diffFile.unifiedLineLength}
              diffFile={props.diffFile}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
};
