import { checkDiffLineIncludeChange, SplitSide, type DiffLine, type DiffFile, type File } from "@git-diff-view/core";
import {
  addContentBGName,
  addLineNumberBGName,
  delContentBGName,
  delLineNumberBGName,
  diffAsideWidthName,
  expandContentBGName,
  expandLineNumberColorName,
  plainContentBGName,
  plainLineNumberBGName,
  plainLineNumberColorName,
} from "@git-diff-view/utils";
import { createEffect, createSignal, onCleanup, Show } from "solid-js";

import { useEnableAddWidget, useEnableHighlight, useEnableWrap, useOnAddWidgetClick } from "../hooks";

import { DiffUnifiedAddWidget } from "./DiffAddWidget";
import { DiffContent } from "./DiffContent";
import { useDiffWidgetContext } from "./DiffWidgetContext";

import type { Accessor } from "solid-js";

const DiffUnifiedOldLine = (props: {
  index: number;
  lineNumber: number;
  rawLine: string;
  plainLine?: File["plainFile"][number];
  syntaxLine?: File["syntaxFile"][number];
  diffLine?: DiffLine;
  diffFile: DiffFile;
  enableWrap: boolean;
  enableAddWidget: boolean;
  enableHighlight: boolean;
  onOpenAddWidget: (lineNumber: number, side: SplitSide) => void;
  onAddWidgetClick?: Accessor<{ current?: (lineNumber: number, side: SplitSide) => void }>;
}) => {
  return (
    <tr data-line={props.index} data-state="diff" class="diff-line group">
      <td
        class="diff-line-num sticky left-0 z-[1] w-[1%] min-w-[100px] select-none whitespace-nowrap pl-[10px] pr-[10px] text-right align-top"
        style={{
          color: `var(${plainLineNumberColorName})`,
          "background-color": `var(${delLineNumberBGName})`,
          width: `calc(calc(var(${diffAsideWidthName}) + 5px) * 2)`,
          "max-width": `calc(calc(var(${diffAsideWidthName}) + 5px) * 2)`,
          "min-width": `calc(calc(var(${diffAsideWidthName}) + 5px) * 2)`,
        }}
      >
        {props.enableAddWidget && (
          <DiffUnifiedAddWidget
            index={props.index - 1}
            lineNumber={props.lineNumber}
            diffFile={props.diffFile}
            side={SplitSide.old}
            onWidgetClick={props.onAddWidgetClick}
            onOpenAddWidget={props.onOpenAddWidget}
          />
        )}
        <div class="flex">
          <span data-line-old-num={props.lineNumber} class="inline-block w-[50%]">
            {props.lineNumber}
          </span>
          <span class="w-[10px] shrink-0" />
          <span class="inline-block w-[50%]" />
        </div>
      </td>
      <td class="diff-line-content pr-[10px] align-top" style={{ "background-color": `var(${delContentBGName})` }}>
        <DiffContent
          enableWrap={props.enableWrap}
          diffFile={props.diffFile}
          enableHighlight={props.enableHighlight}
          rawLine={props.rawLine}
          diffLine={props.diffLine}
          plainLine={props.plainLine}
          syntaxLine={props.syntaxLine}
        />
      </td>
    </tr>
  );
};

const DiffUnifiedNewLine = (props: {
  index: number;
  lineNumber: number;
  rawLine: string;
  plainLine?: File["plainFile"][number];
  syntaxLine?: File["syntaxFile"][number];
  diffLine?: DiffLine;
  diffFile: DiffFile;
  enableWrap: boolean;
  enableAddWidget: boolean;
  enableHighlight: boolean;
  onOpenAddWidget: (lineNumber: number, side: SplitSide) => void;
  onAddWidgetClick?: Accessor<{ current?: (lineNumber: number, side: SplitSide) => void }>;
}) => {
  return (
    <tr data-line={props.index} data-state="diff" class="diff-line group">
      <td
        class="diff-line-num sticky left-0 z-[1] w-[1%] min-w-[100px] select-none whitespace-nowrap pl-[10px] pr-[10px] text-right align-top"
        style={{
          color: `var(${plainLineNumberColorName})`,
          "background-color": `var(${addLineNumberBGName})`,
          width: `calc(calc(var(${diffAsideWidthName}) + 5px) * 2)`,
          "max-width": `calc(calc(var(${diffAsideWidthName}) + 5px) * 2)`,
          "min-width": `calc(calc(var(${diffAsideWidthName}) + 5px) * 2)`,
        }}
      >
        {props.enableAddWidget && (
          <DiffUnifiedAddWidget
            index={props.index - 1}
            lineNumber={props.lineNumber}
            diffFile={props.diffFile}
            side={SplitSide.new}
            onWidgetClick={props.onAddWidgetClick}
            onOpenAddWidget={props.onOpenAddWidget}
          />
        )}
        <div class="flex">
          <span class="inline-block w-[50%]" />
          <span class="w-[10px] shrink-0" />
          <span data-line-new-num={props.lineNumber} class="inline-block w-[50%]">
            {props.lineNumber}
          </span>
        </div>
      </td>
      <td class="diff-line-content pr-[10px] align-top" style={{ "background-color": `var(${addContentBGName})` }}>
        <DiffContent
          enableWrap={props.enableWrap}
          diffFile={props.diffFile}
          enableHighlight={props.enableHighlight}
          rawLine={props.rawLine}
          diffLine={props.diffLine}
          plainLine={props.plainLine}
          syntaxLine={props.syntaxLine}
        />
      </td>
    </tr>
  );
};

export const DiffUnifiedContentLine = (props: { index: number; diffFile: DiffFile; lineNumber: number }) => {
  const [unifiedItem, setUnifiedItem] = createSignal(props.diffFile.getUnifiedLine(props.index));

  const enableWrap = useEnableWrap();

  const [_, setWidget] = useDiffWidgetContext() || [];

  const onAddWidgetClick = useOnAddWidgetClick();

  const enableHighlight = useEnableHighlight();

  const enableAddWidget = useEnableAddWidget();

  const [currentItemHasHidden, setCurrentItemHasHidden] = createSignal(unifiedItem()?.isHidden);

  const [currentItemHasChange, setCurrentItemHasChange] = createSignal(checkDiffLineIncludeChange(unifiedItem()?.diff));

  const [currentSyntaxLine, setCurrentSyntaxLine] = createSignal(
    unifiedItem()?.newLineNumber
      ? props.diffFile.getNewSyntaxLine(unifiedItem()?.newLineNumber || 0)
      : unifiedItem()?.oldLineNumber
        ? props.diffFile.getOldSyntaxLine(unifiedItem()?.oldLineNumber || 0)
        : undefined
  );

  const [currentPlainLine, setCurrentPlainLine] = createSignal(
    unifiedItem()?.newLineNumber
      ? props.diffFile.getNewPlainLine(unifiedItem()?.newLineNumber || 0)
      : unifiedItem()?.oldLineNumber
        ? props.diffFile.getOldPlainLine(unifiedItem()?.oldLineNumber || 0)
        : undefined
  );

  createEffect(() => {
    const init = () => {
      setUnifiedItem(props.diffFile.getUnifiedLine(props.index));
      setCurrentItemHasHidden(() => unifiedItem()?.isHidden);
      setCurrentItemHasChange(() => checkDiffLineIncludeChange(unifiedItem()?.diff));
      setCurrentSyntaxLine(() =>
        unifiedItem()?.newLineNumber
          ? props.diffFile.getNewSyntaxLine(unifiedItem()?.newLineNumber || 0)
          : unifiedItem()?.oldLineNumber
            ? props.diffFile.getOldSyntaxLine(unifiedItem()?.oldLineNumber || 0)
            : undefined
      );
      setCurrentPlainLine(() =>
        unifiedItem()?.newLineNumber
          ? props.diffFile.getNewPlainLine(unifiedItem()?.newLineNumber || 0)
          : unifiedItem()?.oldLineNumber
            ? props.diffFile.getOldPlainLine(unifiedItem()?.oldLineNumber || 0)
            : undefined
      );
    };

    init();

    const unsubscribe = props.diffFile.subscribe(init);

    onCleanup(unsubscribe);
  });

  const onClickAddWidget = (lineNumber: number, side: SplitSide) => setWidget?.({ side, lineNumber });

  return (
    <Show when={!currentItemHasHidden()}>
      <Show
        when={currentItemHasChange()}
        fallback={
          <tr data-line={props.lineNumber} data-state={unifiedItem()?.diff ? "diff" : "plain"} class="diff-line group">
            <td
              class="diff-line-num sticky left-0 z-[1] w-[1%] min-w-[100px] select-none whitespace-nowrap pl-[10px] pr-[10px] text-right align-top"
              style={{
                color: `var(${unifiedItem()?.diff ? plainLineNumberColorName : expandLineNumberColorName})`,
                "background-color": unifiedItem()?.diff
                  ? `var(${plainLineNumberBGName})`
                  : `var(${expandContentBGName})`,
                width: `calc(calc(var(${diffAsideWidthName}) + 5px) * 2)`,
                "max-width": `calc(calc(var(${diffAsideWidthName}) + 5px) * 2)`,
                "min-width": `calc(calc(var(${diffAsideWidthName}) + 5px) * 2)`,
              }}
            >
              {enableAddWidget() && unifiedItem()?.diff && (
                <DiffUnifiedAddWidget
                  index={props.index}
                  diffFile={props.diffFile}
                  lineNumber={unifiedItem()?.newLineNumber || 0}
                  side={SplitSide.new}
                  onOpenAddWidget={onClickAddWidget}
                  onWidgetClick={onAddWidgetClick}
                />
              )}
              <div class="flex opacity-[0.5]">
                <span data-line-old-num={unifiedItem()?.oldLineNumber || 0} class="inline-block w-[50%]">
                  {unifiedItem()?.oldLineNumber || 0}
                </span>
                <span class="w-[10px] shrink-0" />
                <span data-line-new-num={unifiedItem()?.newLineNumber || 0} class="inline-block w-[50%]">
                  {unifiedItem()?.newLineNumber || 0}
                </span>
              </div>
            </td>
            <td
              class="diff-line-content pr-[10px] align-top"
              style={{
                "background-color": unifiedItem()?.diff ? `var(${plainContentBGName})` : `var(${expandContentBGName})`,
              }}
            >
              <DiffContent
                enableWrap={!!enableWrap()}
                diffFile={props.diffFile}
                enableHighlight={!!enableHighlight()}
                rawLine={unifiedItem()?.value || ""}
                diffLine={unifiedItem()?.diff}
                plainLine={currentPlainLine()}
                syntaxLine={currentSyntaxLine()}
              />
            </td>
          </tr>
        }
      >
        <Show
          when={unifiedItem()?.oldLineNumber}
          fallback={
            <DiffUnifiedNewLine
              index={props.lineNumber}
              enableWrap={!!enableWrap()}
              diffFile={props.diffFile}
              rawLine={unifiedItem()?.value || ""}
              diffLine={unifiedItem()?.diff}
              plainLine={currentPlainLine()}
              syntaxLine={currentSyntaxLine()}
              enableHighlight={!!enableHighlight()}
              enableAddWidget={!!enableAddWidget()}
              lineNumber={unifiedItem().newLineNumber || 0}
              onAddWidgetClick={onAddWidgetClick}
              onOpenAddWidget={onClickAddWidget}
            />
          }
        >
          <DiffUnifiedOldLine
            index={props.lineNumber}
            enableWrap={!!enableWrap()}
            diffFile={props.diffFile}
            rawLine={unifiedItem()?.value || ""}
            diffLine={unifiedItem()?.diff}
            plainLine={currentPlainLine()}
            syntaxLine={currentSyntaxLine()}
            enableHighlight={!!enableHighlight()}
            enableAddWidget={!!enableAddWidget()}
            lineNumber={unifiedItem().oldLineNumber || 0}
            onAddWidgetClick={onAddWidgetClick}
            onOpenAddWidget={onClickAddWidget}
          />
        </Show>
      </Show>
    </Show>
  );
};
