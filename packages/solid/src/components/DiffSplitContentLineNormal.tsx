import { checkDiffLineIncludeChange, DiffLineType, SplitSide } from "@git-diff-view/core";
import {
  diffAsideWidthName,
  emptyBGName,
  expandLineNumberColorName,
  getContentBG,
  getLineNumberBG,
  plainLineNumberColorName,
} from "@git-diff-view/utils";
import { createEffect, createSignal, onCleanup, Show } from "solid-js";

import { useEnableAddWidget, useEnableHighlight, useOnAddWidgetClick } from "../hooks";

import { DiffSplitAddWidget } from "./DiffAddWidget";
import { DiffContent } from "./DiffContent";
import { useDiffWidgetContext } from "./DiffWidgetContext";

import type { DiffFile } from "@git-diff-view/core";

export const DiffSplitContentLine = (props: {
  index: number;
  side: SplitSide;
  diffFile: DiffFile;
  lineNumber: number;
}) => {
  const [_, setWidget] = useDiffWidgetContext() || [];

  const enableAddWidget = useEnableAddWidget();

  const enableHighlight = useEnableHighlight();

  const onAddWidgetClick = useOnAddWidgetClick();

  const [currentLine, setCurrentLine] = createSignal(
    props.side === SplitSide.old
      ? props.diffFile.getSplitLeftLine(props.index)
      : props.diffFile.getSplitRightLine(props.index)
  );

  const [currentLineHasDiff, setCurrentLineHasDiff] = createSignal(!!currentLine()?.diff);

  const [currentLineHasChange, setCurrentLineHasChange] = createSignal(checkDiffLineIncludeChange(currentLine()?.diff));

  const [currentLineHasHidden, setCurrentLineHasHidden] = createSignal(currentLine()?.isHidden);

  const [currentLineHasContent, setCurrentLineHasContent] = createSignal(currentLine()?.lineNumber);

  const [currentSyntaxLine, setCurrentSyntaxLine] = createSignal(
    props.side === SplitSide.old
      ? props.diffFile.getOldSyntaxLine(currentLine()?.lineNumber || 0)
      : props.diffFile.getNewSyntaxLine(currentLine()?.lineNumber || 0)
  );

  const [currentPlainLine, setCurrentPlainLine] = createSignal(
    props.side === SplitSide.old
      ? props.diffFile.getOldPlainLine(currentLine()?.lineNumber || 0)
      : props.diffFile.getNewPlainLine(currentLine()?.lineNumber || 0)
  );

  const init = () => {
    setCurrentLine(
      props.side === SplitSide.old
        ? props.diffFile.getSplitLeftLine(props.index)
        : props.diffFile.getSplitRightLine(props.index)
    );
    setCurrentSyntaxLine(
      props.side === SplitSide.old
        ? props.diffFile.getOldSyntaxLine(currentLine()?.lineNumber || 0)
        : props.diffFile.getNewSyntaxLine(currentLine()?.lineNumber || 0)
    );
    setCurrentPlainLine(
      props.side === SplitSide.old
        ? props.diffFile.getOldPlainLine(currentLine()?.lineNumber || 0)
        : props.diffFile.getNewPlainLine(currentLine()?.lineNumber || 0)
    );
    setCurrentLineHasDiff(() => !!currentLine()?.diff);
    setCurrentLineHasChange(() => checkDiffLineIncludeChange(currentLine()?.diff));
    setCurrentLineHasHidden(() => currentLine()?.isHidden);
    setCurrentLineHasContent(() => currentLine()?.lineNumber);
  };

  createEffect(() => {
    init();

    const cb = props.diffFile.subscribe(init);

    onCleanup(cb);
  });

  const onOpenAddWidget = (lineNumber: number, side: SplitSide) => setWidget?.({ side: side, lineNumber: lineNumber });

  const isAdded = () => currentLine()?.diff?.type === DiffLineType.Add;

  const isDelete = () => currentLine()?.diff?.type === DiffLineType.Delete;

  return (
    <Show when={!currentLineHasHidden()}>
      <tr
        data-line={props.lineNumber}
        data-state={currentLineHasDiff() || !currentLineHasContent() ? "diff" : "plain"}
        data-side={SplitSide[props.side]}
        class={"diff-line" + (currentLineHasContent() ? " group" : "")}
      >
        {currentLineHasContent() ? (
          <>
            <td
              class={`diff-line-${SplitSide[props.side]}-num sticky left-0 z-[1] w-[1%] min-w-[40px] select-none pl-[10px] pr-[10px] text-right align-top`}
              style={{
                "background-color": getLineNumberBG(isAdded(), isDelete(), currentLineHasDiff()),
                color: `var(${currentLineHasDiff() ? plainLineNumberColorName : expandLineNumberColorName})`,
                width: `var(${diffAsideWidthName})`,
                "min-width": `var(${diffAsideWidthName})`,
                "max-width": `var(${diffAsideWidthName})`,
              }}
            >
              {currentLineHasDiff() && enableAddWidget() && (
                <DiffSplitAddWidget
                  index={props.index}
                  lineNumber={currentLine()?.lineNumber || 0}
                  side={props.side}
                  diffFile={props.diffFile}
                  onWidgetClick={onAddWidgetClick}
                  class="absolute left-[100%] z-[1] translate-x-[-50%]"
                  onOpenAddWidget={onOpenAddWidget}
                />
              )}
              <span
                data-line-num={currentLine()?.lineNumber}
                style={{ opacity: currentLineHasChange() ? undefined : 0.5 }}
              >
                {currentLine()?.lineNumber}
              </span>
            </td>
            <td
              class={`diff-line-${SplitSide[props.side]}-content pr-[10px] align-top`}
              style={{ "background-color": getContentBG(isAdded(), isDelete(), currentLineHasDiff()) }}
            >
              <DiffContent
                enableWrap={false}
                diffFile={props.diffFile}
                rawLine={currentLine()?.value || ""}
                diffLine={currentLine()?.diff}
                plainLine={currentPlainLine()}
                syntaxLine={currentSyntaxLine()}
                enableHighlight={!!enableHighlight()}
              />
            </td>
          </>
        ) : (
          <td
            class={`diff-line-${SplitSide[props.side]}-placeholder select-none`}
            style={{ "background-color": `var(${emptyBGName})` }}
            colspan={2}
          >
            <span>&ensp;</span>
          </td>
        )}
      </tr>
    </Show>
  );
};
