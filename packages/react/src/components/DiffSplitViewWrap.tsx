/* eslint-disable @typescript-eslint/ban-ts-comment */
import { type DiffFile, getSplitContentLines } from "@git-diff-view/core";
import { diffAsideWidthName, diffFontSizeName, removeAllSelection } from "@git-diff-view/utils";
import { Fragment, memo, useCallback, useMemo } from "react";
import * as React from "react";
// SEE https://github.com/facebook/react/pull/25231
import { useSyncExternalStore } from "use-sync-external-store/shim/index.js";

import { SplitSide } from "..";
import { useTextWidth } from "../hooks/useTextWidth";

import { DiffSplitContentLine } from "./DiffSplitContentLineWrap";
import { DiffSplitExtendLine } from "./DiffSplitExtendLineWrap";
import { DiffSplitHunkLine } from "./DiffSplitHunkLineWrap";
import { DiffSplitWidgetLine } from "./DiffSplitWidgetLineWrap";
import { useDiffViewContext } from "./DiffViewContext";
import { createDiffSplitConfigStore } from "./tools";

import type { MouseEventHandler } from "react";
import type { Ref, UseSelectorWithStore } from "reactivity-store";

const Style = ({
  useSelector,
  id,
}: {
  useSelector: UseSelectorWithStore<{ splitRef: Ref<SplitSide> }>;
  id: string;
}) => {
  const splitRef = useSelector((s) => s.splitRef);

  return (
    <style data-select-style>
      {splitRef === SplitSide.old
        ? `#${id} [data-side="${SplitSide[SplitSide.new]}"] {user-select: none} \n #${id} [data-state="extend"] {user-select: none} \n #${id} [data-state="hunk"] {user-select: none} \n #${id} [data-state="widget"] {user-select: none}`
        : splitRef === SplitSide.new
          ? `#${id} [data-side="${SplitSide[SplitSide.old]}"] {user-select: none} \n #${id} [data-state="extend"] {user-select: none} \n #${id} [data-state="hunk"] {user-select: none} \n #${id} [data-state="widget"] {user-select: none}`
          : ""}
    </style>
  );
};

export const DiffSplitViewWrap = memo(({ diffFile }: { diffFile: DiffFile }) => {
  const splitLineLength = Math.max(diffFile.splitLineLength, diffFile.fileLineLength);

  const { useDiffContext } = useDiffViewContext();

  const useSplitConfig = useMemo(() => createDiffSplitConfigStore(), []);

  const { fontSize, enableAddWidget, enableHighlight } = useDiffContext.useShallowStableSelector((s) => ({
    fontSize: s.fontSize,
    enableAddWidget: s.enableAddWidget,
    enableHighlight: s.enableHighlight,
  }));

  useSyncExternalStore(diffFile.subscribe, diffFile.getUpdateCount, diffFile.getUpdateCount);

  const onMouseDown = useCallback<MouseEventHandler<HTMLTableSectionElement>>((e) => {
    let ele = e.target;

    const setSelectSide = useSplitConfig.getReadonlyState().setSplit;

    // need remove all the selection
    if (ele && ele instanceof HTMLElement && ele.nodeName === "BUTTON") {
      removeAllSelection();
      return;
    }

    while (ele && ele instanceof HTMLElement) {
      const state = ele.getAttribute("data-state");
      const side = ele.getAttribute("data-side");
      if (side) {
        setSelectSide(SplitSide[side]);
        removeAllSelection();
      }
      if (state) {
        if (state === "extend" || state === "hunk" || state === "widget") {
          setSelectSide(undefined);
          removeAllSelection();
          return;
        } else {
          return;
        }
      }

      ele = ele.parentElement;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const font = useMemo(() => ({ fontSize: fontSize + "px", fontFamily: "Menlo, Consolas, monospace" }), [fontSize]);

  const _width = useTextWidth({
    text: splitLineLength.toString(),
    font,
  });

  const width = Math.max(40, _width + 25);

  const lines = getSplitContentLines(diffFile);

  return (
    <div className="split-diff-view split-diff-view-wrap w-full">
      <div
        className="diff-table-wrapper w-full"
        style={{
          // @ts-ignore
          [diffAsideWidthName]: `${Math.round(width)}px`,
          fontFamily: "Menlo, Consolas, monospace",
          fontSize: `var(${diffFontSizeName})`,
        }}
      >
        <Style useSelector={useSplitConfig} id={`diff-root${diffFile.getId()}`} />
        <table className="diff-table w-full table-fixed border-collapse border-spacing-0">
          <colgroup>
            <col className="diff-table-old-num-col" width={Math.round(width)} />
            <col className="diff-table-old-content-col" />
            <col className="diff-table-new-num-col" width={Math.round(width)} />
            <col className="diff-table-new-content-col" />
          </colgroup>
          <thead className="hidden">
            <tr>
              <th scope="col">old line number</th>
              <th scope="col">old line content</th>
              <th scope="col">new line number</th>
              <th scope="col">new line content</th>
            </tr>
          </thead>
          <tbody className="diff-table-body leading-[1.4]" onMouseDownCapture={onMouseDown}>
            {lines.map((line) => (
              <Fragment key={line.index}>
                <DiffSplitHunkLine index={line.index} lineNumber={line.lineNumber} diffFile={diffFile} />
                <DiffSplitContentLine
                  index={line.index}
                  lineNumber={line.lineNumber}
                  diffFile={diffFile}
                  enableAddWidget={enableAddWidget}
                  enableHighlight={enableHighlight}
                />
                <DiffSplitWidgetLine index={line.index} lineNumber={line.lineNumber} diffFile={diffFile} />
                <DiffSplitExtendLine index={line.index} lineNumber={line.lineNumber} diffFile={diffFile} />
              </Fragment>
            ))}
            <DiffSplitHunkLine
              index={diffFile.splitLineLength}
              lineNumber={diffFile.splitLineLength}
              diffFile={diffFile}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
});

DiffSplitViewWrap.displayName = "DiffSplitViewWrap";
