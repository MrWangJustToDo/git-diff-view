/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getSplitContentLines, type DiffFile } from "@git-diff-view/core";
import {
  removeAllSelection,
  syncScroll,
  diffFontSizeName,
  borderColorName,
  diffAsideWidthName,
  getDiffIdFromElement,
} from "@git-diff-view/utils";
import { Fragment, memo, useEffect, useRef } from "octane";
import * as Octane from "octane";
// @ts-ignore
import { useSyncExternalStore } from "octane";

import { useTextWidth } from "../hooks/useTextWidth";

import { DiffSplitContentLine } from "./DiffSplitContentLineNormal.tsrx";
import { DiffSplitExtendLine } from "./DiffSplitExtendLineNormal.tsrx";
import { DiffSplitHunkLine } from "./DiffSplitHunkLineNormal.tsrx";
import { DiffSplitWidgetLine } from "./DiffSplitWidgetLineNormal.tsrx";
import { SplitSide } from "./DiffView.tsrx";
import { useDiffViewContext } from "./DiffViewContext";

import type { NativeMouseEventHandler, OctaneStyle } from "../octane-types";

const DiffSplitViewTable = ({
  side,
  diffFile,
  enableAddWidget,
  enableHighlight,
  onMouseDown,
}: {
  side: SplitSide;
  diffFile: DiffFile;
  enableHighlight: boolean;
  enableAddWidget: boolean;
  onMouseDown?: NativeMouseEventHandler<HTMLTableSectionElement>;
}) => {
  const className = side === SplitSide.new ? "new-diff-table" : "old-diff-table";

  const lines = getSplitContentLines(diffFile);

  return (
    <table className={className + " w-full border-collapse border-spacing-0"} data-mode={SplitSide[side]}>
      <colgroup>
        <col className={`diff-table-${SplitSide[side]}-num-col`} />
        <col className={`diff-table-${SplitSide[side]}-content-col`} />
      </colgroup>
      <thead className="hidden">
        <tr>
          <th scope="col">{SplitSide[side]} line number</th>
          <th scope="col">{SplitSide[side]} line content</th>
        </tr>
      </thead>
      <tbody className="diff-table-body leading-[1.6]" onMouseDownCapture={onMouseDown}>
        {lines.map((line) => (
          <Fragment key={line.index}>
            <DiffSplitHunkLine index={line.index} side={side} lineNumber={line.lineNumber} diffFile={diffFile} />
            <DiffSplitContentLine
              index={line.index}
              side={side}
              lineNumber={line.lineNumber}
              diffFile={diffFile}
              enableAddWidget={enableAddWidget}
              enableHighlight={enableHighlight}
            />
            <DiffSplitWidgetLine index={line.index} side={side} lineNumber={line.lineNumber} diffFile={diffFile} />
            <DiffSplitExtendLine index={line.index} side={side} lineNumber={line.lineNumber} diffFile={diffFile} />
          </Fragment>
        ))}
        <DiffSplitHunkLine
          side={side}
          index={diffFile.splitLineLength}
          lineNumber={diffFile.splitLineLength}
          diffFile={diffFile}
        />
      </tbody>
    </table>
  );
};

export const DiffSplitViewNormal = memo(({ diffFile }: { diffFile: DiffFile }) => {
  const ref1 = useRef<HTMLDivElement | null>(null);

  const ref2 = useRef<HTMLDivElement | null>(null);

  const ref = useRef<HTMLStyleElement | null>(null);

  const tempRef = useRef<SplitSide | undefined>(undefined);

  const splitLineLength = Math.max(diffFile.splitLineLength, diffFile.fileLineLength);

  const { useDiffContext } = useDiffViewContext();

  const { fontSize, enableAddWidget, enableHighlight } = useDiffContext.useShallowStableSelector((s) => ({
    fontSize: s.fontSize,
    enableAddWidget: s.enableAddWidget,
    enableHighlight: s.enableHighlight,
  }));

  useSyncExternalStore(diffFile.subscribe, diffFile.getUpdateCount, diffFile.getUpdateCount);

  useEffect(() => {
    const left = ref1.current;
    const right = ref2.current;
    if (!left || !right) return;
    return syncScroll(left, right);
  }, []);

  const font = Octane.useMemo(
    () => ({ fontSize: fontSize + "px", fontFamily: "Menlo, Consolas, monospace" }),
    [fontSize]
  );

  const _width = useTextWidth({
    text: splitLineLength.toString(),
    font,
  });

  const width = Math.max(40, _width + 25);

  const setStyle = (side?: SplitSide) => {
    if (!ref.current) return;
    if (!side) {
      ref.current.textContent = "";
    } else {
      const id = `diff-root${diffFile.getId()}`;
      ref.current.textContent = `#${id} [data-state="extend"] {user-select: none} \n#${id} [data-state="hunk"] {user-select: none} \n#${id} [data-state="widget"] {user-select: none}`;
    }
  };

  const onMouseDown: NativeMouseEventHandler<HTMLTableSectionElement> = (e) => {
    let ele: Element | null = e.target as Element;

    // need remove all the selection
    if (ele && ele instanceof HTMLElement && ele.nodeName === "BUTTON") {
      removeAllSelection();
      return;
    }

    const id = getDiffIdFromElement(ele as HTMLElement);

    if (id && id !== `diff-root${diffFile.getId()}`) {
      return;
    }

    while (ele && ele instanceof HTMLElement) {
      const state = ele.getAttribute("data-state");
      const side = ele.getAttribute("data-side") as unknown as SplitSide;
      if (side) {
        if (tempRef.current !== (SplitSide[side] as unknown as SplitSide)) {
          tempRef.current = SplitSide[side] as unknown as SplitSide;
          setStyle(SplitSide[side] as unknown as SplitSide);
          removeAllSelection();
        }
      }
      if (state) {
        if (state === "extend" || state === "hunk" || state === "widget") {
          if (tempRef.current !== undefined) {
            tempRef.current = undefined;
            setStyle(undefined);
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

  return (
    <div className="split-diff-view split-diff-view-normal flex w-full basis-[50%]">
      <style data-select-style ref={ref} />
      <div
        className="old-diff-table-wrapper diff-table-scroll-container w-full overflow-x-auto overflow-y-hidden"
        ref={ref1}
        style={{
          [diffAsideWidthName]: `${Math.round(width)}px`,
          overscrollBehaviorX: "none",
          fontFamily: "Menlo, Consolas, monospace",
          fontSize: `var(${diffFontSizeName})`,
        } as OctaneStyle}
      >
        <DiffSplitViewTable
          side={SplitSide.old}
          diffFile={diffFile}
          enableAddWidget={!!enableAddWidget}
          enableHighlight={!!enableHighlight}
          onMouseDown={onMouseDown}
        />
      </div>
      <div className="diff-split-line w-[1.5px]" style={{ backgroundColor: `var(${borderColorName})` }} />
      <div
        className="new-diff-table-wrapper diff-table-scroll-container w-full overflow-x-auto overflow-y-hidden"
        ref={ref2}
        style={{
          [diffAsideWidthName]: `${Math.round(width)}px`,
          overscrollBehaviorX: "none",
          fontFamily: "Menlo, Consolas, monospace",
          fontSize: `var(${diffFontSizeName})`,
        } as OctaneStyle}
      >
        <DiffSplitViewTable
          side={SplitSide.new}
          diffFile={diffFile}
          enableAddWidget={!!enableAddWidget}
          enableHighlight={!!enableHighlight}
          onMouseDown={onMouseDown}
        />
      </div>
    </div>
  );
});
