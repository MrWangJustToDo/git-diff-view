/* eslint-disable @typescript-eslint/ban-ts-comment */
import { type DiffFile, getSplitLines } from "@git-diff-view/core";
import { memo, useCallback, useMemo } from "react";
import * as React from "react";
// SEE https://github.com/facebook/react/pull/25231
import { useSyncExternalStore } from "use-sync-external-store/shim/index.js";

import { useTextWidth } from "../../hooks/useTextWidth";
import { SplitSide } from "../DiffView";
import { useDiffViewContext } from "../DiffViewContext";
import { createDiffSplitConfigStore, removeAllSelection, diffFontSizeName, diffAsideWidthName } from "../tools";

import { DiffSplitViewLine } from "./DiffSplitViewLineWrap_v2";

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
  const splitLineLength = Math.max(diffFile.splitLineLength, diffFile.fileLineLength);

  const { useDiffContext } = useDiffViewContext();

  const useSplitConfig = useMemo(() => createDiffSplitConfigStore(), []);

  const fontSize = useDiffContext(useCallback((s) => s.fontSize, []));

  useSyncExternalStore(diffFile.subscribe, diffFile.getUpdateCount);

  const onMouseDown = useCallback<MouseEventHandler<HTMLTableSectionElement>>((e) => {
    let ele = e.target;

    const setSelectSide = useSplitConfig.getReadonlyState().setSplit;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const font = useMemo(() => ({ fontSize: fontSize + "px", fontFamily: "Menlo, Consolas, monospace" }), [fontSize]);

  const _width = useTextWidth({
    text: splitLineLength.toString(),
    font,
  });

  const width = Math.max(40, _width + 25);

  const lines = getSplitLines(diffFile);

  return (
    <div className="split-diff-view split-diff-view-normal w-full">
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
        <div className="diff-table w-full table-fixed border-collapse">
          <div className="diff-table-body leading-[1.6]" onMouseDownCapture={onMouseDown}>
            {lines.map((line, index) => (
              <DiffSplitViewLine key={line.index + index} line={line} diffFile={diffFile} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

DiffSplitViewWrap.displayName = "DiffSplitViewWrap";
