import { checkDiffLineIncludeChange, DiffLineType, SplitSide, type DiffFile } from "@git-diff-view/core";
import {
  borderColorName,
  emptyBGName,
  expandLineNumberColorName,
  getContentBG,
  getLineNumberBG,
  plainLineNumberColorName,
} from "@git-diff-view/utils";
import { createEffect, createMemo, createSignal, onCleanup, Show } from "solid-js";

import { useEnableAddWidget, useEnableHighlight, useOnAddWidgetClick } from "../hooks";

import { DiffSplitAddWidget } from "./DiffAddWidget";
import { DiffContent } from "./DiffContent";
import { useDiffWidgetContext } from "./DiffWidgetContext";

export const DiffSplitContentLine = (props: { index: number; diffFile: DiffFile; lineNumber: number }) => {
  const [_, setWidget] = useDiffWidgetContext() || [];

  const enableAddWidget = useEnableAddWidget();

  const enableHighlight = useEnableHighlight();

  const onAddWidgetClick = useOnAddWidgetClick();

  const oldLine = createMemo(() => props.diffFile.getSplitLeftLine(props.index));

  const newLine = createMemo(() => props.diffFile.getSplitRightLine(props.index));

  const getOldSyntaxLine = () => props.diffFile.getOldSyntaxLine(oldLine()?.lineNumber || 0);

  const getNewSyntaxLine = () => props.diffFile.getNewSyntaxLine(newLine()?.lineNumber || 0);

  const [oldSyntaxLine, setOldSyntaxLine] = createSignal(getOldSyntaxLine());

  const [newSyntaxLine, setNewSyntaxLine] = createSignal(getNewSyntaxLine());

  const getOldPlainLine = () => props.diffFile.getOldPlainLine(oldLine()?.lineNumber || 0);

  const getNewPlainLine = () => props.diffFile.getNewPlainLine(newLine()?.lineNumber || 0);

  const [oldPlainLine, setOldPlainLine] = createSignal(getOldPlainLine());

  const [newPlainLine, setNewPlainLine] = createSignal(getNewPlainLine());

  const checkHasDiff = () => !!oldLine()?.diff || !!newLine()?.diff;

  const hasDiff = createMemo(checkHasDiff);

  const checkHasChange = () =>
    checkDiffLineIncludeChange(oldLine()?.diff) || checkDiffLineIncludeChange(newLine()?.diff);

  const hasChange = createMemo(checkHasChange);

  const checkHasHidden = () => oldLine()?.isHidden && newLine()?.isHidden;

  const hasHidden = createMemo(checkHasHidden);

  const oldLineIsDelete = () => oldLine()?.diff?.type === DiffLineType.Delete;

  const newLineIsAdded = () => newLine()?.diff?.type === DiffLineType.Add;

  createEffect(() => {
    const init = () => {
      setOldSyntaxLine(getOldSyntaxLine);
      setNewSyntaxLine(getNewSyntaxLine);
      setOldPlainLine(getOldPlainLine);
      setNewPlainLine(getNewPlainLine);
    };

    init();

    const cb = props.diffFile.subscribe(init);

    onCleanup(cb);
  });

  const onOpenAddWidget = (lineNumber: number, side: SplitSide) => setWidget?.({ side: side, lineNumber: lineNumber });

  return (
    <Show when={!hasHidden()}>
      <tr data-line={props.lineNumber} data-state={hasDiff() ? "diff" : "plain"} class="diff-line">
        {oldLine()?.lineNumber ? (
          <>
            <td
              class="diff-line-old-num group relative w-[1%] min-w-[40px] select-none pl-[10px] pr-[10px] text-right align-top"
              style={{
                "background-color": getLineNumberBG(false, oldLineIsDelete(), hasDiff()),
                color: `var(${hasDiff() ? plainLineNumberColorName : expandLineNumberColorName})`,
              }}
            >
              {hasDiff() && enableAddWidget() && (
                <DiffSplitAddWidget
                  index={props.index}
                  lineNumber={oldLine()?.lineNumber || 0}
                  side={SplitSide.old}
                  diffFile={props.diffFile}
                  onWidgetClick={onAddWidgetClick}
                  class="absolute left-[100%] z-[1] translate-x-[-50%]"
                  onOpenAddWidget={onOpenAddWidget}
                />
              )}
              <span data-line-num={oldLine()?.lineNumber} style={{ opacity: hasChange() ? undefined : 0.5 }}>
                {oldLine()?.lineNumber}
              </span>
            </td>
            <td
              class="diff-line-old-content group relative pr-[10px] align-top"
              style={{ "background-color": getContentBG(false, oldLineIsDelete(), hasDiff()) }}
              data-side={SplitSide[SplitSide.old]}
            >
              {hasDiff() && enableAddWidget() && (
                <DiffSplitAddWidget
                  index={props.index}
                  lineNumber={oldLine()?.lineNumber || 0}
                  side={SplitSide.old}
                  diffFile={props.diffFile}
                  onWidgetClick={onAddWidgetClick}
                  class="absolute right-[100%] z-[1] translate-x-[50%]"
                  onOpenAddWidget={onOpenAddWidget}
                />
              )}
              <DiffContent
                enableWrap={true}
                diffFile={props.diffFile}
                rawLine={oldLine()?.value || ""}
                diffLine={oldLine()?.diff}
                plainLine={oldPlainLine()}
                syntaxLine={oldSyntaxLine()}
                enableHighlight={!!enableHighlight()}
              />
            </td>
          </>
        ) : (
          <td
            class="diff-line-old-placeholder select-none"
            style={{ "background-color": `var(${emptyBGName})` }}
            colspan={2}
          >
            <span>&ensp;</span>
          </td>
        )}
        {newLine()?.lineNumber ? (
          <>
            <td
              class="diff-line-new-num group relative w-[1%] min-w-[40px] select-none border-l-[1px] pl-[10px] pr-[10px] text-right align-top"
              style={{
                "background-color": getLineNumberBG(newLineIsAdded(), false, hasDiff()),
                color: `var(${hasDiff() ? plainLineNumberColorName : expandLineNumberColorName})`,
                "border-left-color": `var(${borderColorName})`,
                "border-left-style": "solid",
              }}
            >
              {hasDiff() && enableAddWidget() && (
                <DiffSplitAddWidget
                  index={props.index}
                  lineNumber={newLine()?.lineNumber || 0}
                  side={SplitSide.new}
                  diffFile={props.diffFile}
                  onWidgetClick={onAddWidgetClick}
                  class="absolute left-[100%] z-[1] translate-x-[-50%]"
                  onOpenAddWidget={onOpenAddWidget}
                />
              )}
              <span data-line-num={newLine()?.lineNumber} style={{ opacity: hasChange() ? undefined : 0.5 }}>
                {newLine()?.lineNumber}
              </span>
            </td>
            <td
              class="diff-line-new-content group relative pr-[10px] align-top"
              style={{ "background-color": getContentBG(newLineIsAdded(), false, hasDiff()) }}
              data-side={SplitSide[SplitSide.new]}
            >
              {hasDiff() && enableAddWidget() && (
                <DiffSplitAddWidget
                  index={props.index}
                  lineNumber={newLine()?.lineNumber || 0}
                  side={SplitSide.new}
                  diffFile={props.diffFile}
                  onWidgetClick={onAddWidgetClick}
                  class="absolute right-[100%] z-[1] translate-x-[50%]"
                  onOpenAddWidget={onOpenAddWidget}
                />
              )}
              <DiffContent
                enableWrap={true}
                diffFile={props.diffFile}
                rawLine={newLine()?.value || ""}
                diffLine={newLine()?.diff}
                plainLine={newPlainLine()}
                syntaxLine={newSyntaxLine()}
                enableHighlight={!!enableHighlight()}
              />
            </td>
          </>
        ) : (
          <td
            class="diff-line-new-placeholder select-none border-l-[1px]"
            style={{
              "background-color": `var(${emptyBGName})`,
              "border-left-color": `var(${borderColorName})`,
              "border-left-style": "solid",
            }}
            colspan={2}
          >
            <span>&ensp;</span>
          </td>
        )}
      </tr>
    </Show>
  );
};
