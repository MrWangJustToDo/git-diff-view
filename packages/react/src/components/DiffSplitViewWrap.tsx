import { type DiffFile, getSplitContentLines } from "@git-diff-view/core";
import { Fragment, memo, useCallback, useMemo } from "react";
import * as React from "react";
import { flushSync } from "react-dom";
import { createStore, ref } from "reactivity-store";
import { useSyncExternalStore } from "use-sync-external-store/shim";

import { useDiffViewContext, SplitSide } from "..";
import { useTextWidth } from "../hooks/useTextWidth";

import { DiffSplitExtendLine } from "./DiffSplitExtendLineWrap";
import { DiffSplitHunkLine } from "./DiffSplitHunkLineWrap";
import { DiffSplitLine } from "./DiffSplitLineWrap";
import { DiffSplitWidgetLine } from "./DiffSplitWidgetLineWrap";
import { removeAllSelection } from "./tools";

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
        ? `#${id} td[data-side="${SplitSide[SplitSide.new]}"] {user-select: none}`
        : splitRef === SplitSide.new
          ? `#${id} td[data-side="${SplitSide[SplitSide.old]}"] {user-select: none}`
          : ""}
    </style>
  );
};

export const DiffSplitViewWrap = memo(({ diffFile }: { diffFile: DiffFile }) => {
  const splitLineLength = diffFile.splitLineLength;

  const { useDiffContext } = useDiffViewContext();

  const splitSideInfo = useMemo(
    () =>
      createStore(() => {
        const splitRef = ref<SplitSide>(undefined);

        const setSplit = (side: SplitSide | undefined) => {
          flushSync(() => {
            splitRef.value = side;
          });
        };

        return { splitRef, setSplit };
      }),
    []
  );

  const setSelectSide = splitSideInfo.getReadonlyState().setSplit;

  const fontSize = useDiffContext(useCallback((s) => s.fontSize, []));

  useSyncExternalStore(diffFile.subscribe, diffFile.getUpdateCount);

  const onMouseDown = useCallback<MouseEventHandler<HTMLTableSectionElement>>(
    (e) => {
      let ele = e.target;

      // need remove all the selection
      if (ele && ele instanceof HTMLElement && ele.nodeName === "BUTTON") {
        removeAllSelection();
        return;
      }

      while (ele && ele instanceof HTMLElement && ele.nodeName !== "TD") {
        ele = ele.parentElement;
      }

      if (ele instanceof HTMLElement) {
        const side = ele.getAttribute("data-side");
        if (side) {
          setSelectSide(SplitSide[side]);
          removeAllSelection();
        }
      }
    },
    [setSelectSide]
  );

  const font = useMemo(() => ({ fontSize: fontSize + "px", fontFamily: "Menlo, Consolas, monospace" }), [fontSize]);

  const _width = useTextWidth({
    text: splitLineLength.toString(),
    font,
  });

  const width = Math.max(40, _width + 25);

  const lines = getSplitContentLines(diffFile);

  return (
    <div className="split-diff-view split-diff-view-normal w-full">
      <div
        className="diff-table-wrapper w-full"
        style={{
          fontFamily: "Menlo, Consolas, monospace",
          fontSize: "var(--diff-font-size--)",
        }}
      >
        <Style useSelector={splitSideInfo} id={`diff-root${diffFile.getId()}`} />
        <table className="diff-table border-collapse table-fixed w-full">
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
                <DiffSplitLine index={line.index} lineNumber={line.lineNumber} diffFile={diffFile} />
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
