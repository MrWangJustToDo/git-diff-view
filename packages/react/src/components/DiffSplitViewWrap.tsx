/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { type DiffFile, getSplitContentLines } from "@git-diff-view/core";
import { Fragment, memo, useState, useCallback } from "react";
import * as React from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim";

import { useDiffViewContext, SplitSide } from "..";
import { useTextWidth } from "../hooks/useTextWidth";

import { DiffSplitExtendLine } from "./DiffSplitExtendLineWrap";
import { DiffSplitLastHunkLine, DiffSplitHunkLine } from "./DiffSplitHunkLineWrap";
import { DiffSplitLine } from "./DiffSplitLineWrap";
import { DiffSplitWidgetLine } from "./DiffSplitWidgetLineWrap";

import type { MouseEventHandler } from "react";

const removeAllSelection = () => {
  const selection = window.getSelection();
  for (let i = 0; i < selection.rangeCount; i++) {
    selection.removeRange(selection.getRangeAt(i));
  }
};

export const DiffSplitViewWrap = memo(({ diffFile }: { diffFile: DiffFile }) => {
  const splitLineLength = diffFile.splitLineLength;

  const { useDiffContext } = useDiffViewContext();

  const [selectSide, setSelectSide] = useState<SplitSide>();

  const fontSize = useDiffContext(useCallback((s) => s.fontSize, []));

  useSyncExternalStore(diffFile.subscribe, diffFile.getUpdateCount);

  const onMouseDown = useCallback<MouseEventHandler<HTMLTableSectionElement>>((e) => {
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
  }, []);

  const width = useTextWidth({
    text: splitLineLength.toString(),
    font: { fontSize: fontSize + "px", fontFamily: "Menlo, Consolas, monospace" },
  });

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
        <style>
          {selectSide === SplitSide.old
            ? `td[data-side="${SplitSide[SplitSide.new]}"] {user-select: none}`
            : selectSide === SplitSide.new
              ? `td[data-side="${SplitSide[SplitSide.old]}"] {user-select: none}`
              : ""}
        </style>
        <table className="diff-table border-collapse table-fixed w-full">
          <colgroup>
            <col className="diff-table-old-num-col" width={Math.round(width) + 25} />
            <col className="diff-table-old-content-col" />
            <col className="diff-table-new-num-col" width={Math.round(width) + 25} />
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
            <DiffSplitLastHunkLine diffFile={diffFile} />
          </tbody>
        </table>
      </div>
    </div>
  );
});

DiffSplitViewWrap.displayName = "DiffSplitViewWrap";
