import { type DiffFile, type SyntaxLine, type DiffLine, checkDiffLineIncludeChange } from "@git-diff-view/core";
import { defineComponent, ref } from "vue";

import { SplitSide } from "..";
import { useEnableAddWidget, useEnableHighlight, useEnableWrap, useOnAddWidgetClick, useSetWidget } from "../context";
import { useSubscribeDiffFile } from "../hooks/useSubscribeDiffFile";

import {
  addContentBGName,
  addLineNumberBGName,
  delContentBGName,
  delLineNumberBGName,
  expandContentBGName,
  plainContentBGName,
  plainLineNumberBGName,
  plainLineNumberColorName,
} from "./color";
import { DiffUnifiedAddWidget } from "./DiffAddWidget";
import { DiffContent } from "./DiffContent";

const DiffUnifiedOldLine = ({
  index,
  diffLine,
  rawLine,
  syntaxLine,
  lineNumber,
  diffFile,
  enableWrap,
  enableHighlight,
  onOpenAddWidget,
  onAddWidgetClick,
}: {
  index: number;
  lineNumber: number;
  rawLine: string;
  syntaxLine?: SyntaxLine;
  diffLine?: DiffLine;
  diffFile: DiffFile;
  enableWrap: boolean;
  enableHighlight: boolean;
  onOpenAddWidget: (lineNumber: number, side: SplitSide) => void;
  onAddWidgetClick?: (event: "onAddWidgetClick", lineNumber: number, side: SplitSide) => void;
}) => {
  return (
    <tr
      data-line={index}
      data-state="diff"
      data-mode="del"
      class="diff-line group"
      style={{ backgroundColor: `var(${delContentBGName})` }}
    >
      <td
        class="diff-line-num left-0 pl-[10px] pr-[10px] text-right select-none w-[1%] min-w-[100px] whitespace-nowrap align-top"
        style={{
          position: enableWrap ? "relative" : "sticky",
          color: `var(${plainLineNumberColorName})`,
          backgroundColor: `var(${delLineNumberBGName})`,
        }}
      >
        <DiffUnifiedAddWidget
          index={index - 1}
          lineNumber={lineNumber}
          diffFile={diffFile}
          side={SplitSide.old}
          onWidgetClick={onAddWidgetClick}
          onOpenAddWidget={onOpenAddWidget}
        />
        <div class="flex">
          <span data-line-num-old={lineNumber} class="inline-block w-[50%]">
            {lineNumber}
          </span>
          <span class="w-[10px] shrink-0" />
          <span class="inline-block w-[50%]" />
        </div>
      </td>
      <td class="diff-line-content pr-[10px] align-top">
        <DiffContent
          enableWrap={enableWrap}
          diffFile={diffFile}
          enableHighlight={enableHighlight}
          rawLine={rawLine}
          diffLine={diffLine}
          syntaxLine={syntaxLine}
        />
      </td>
    </tr>
  );
};

const DiffUnifiedNewLine = ({
  index,
  diffLine,
  rawLine,
  syntaxLine,
  lineNumber,
  diffFile,
  enableWrap,
  enableHighlight,
  onOpenAddWidget,
  onAddWidgetClick,
}: {
  index: number;
  lineNumber: number;
  rawLine: string;
  syntaxLine?: SyntaxLine;
  diffLine?: DiffLine;
  diffFile: DiffFile;
  enableWrap: boolean;
  enableHighlight: boolean;
  onOpenAddWidget: (lineNumber: number, side: SplitSide) => void;
  onAddWidgetClick?: (event: "onAddWidgetClick", lineNumber: number, side: SplitSide) => void;
}) => {
  return (
    <tr
      data-line={index}
      data-state="diff"
      data-mode="add"
      class="diff-line group"
      style={{ backgroundColor: `var(${addContentBGName})` }}
    >
      <td
        class="diff-line-num left-0 pl-[10px] pr-[10px] text-right select-none w-[1%] min-w-[100px] whitespace-nowrap align-top"
        style={{
          position: enableWrap ? "relative" : "sticky",
          color: `var(${plainLineNumberColorName})`,
          backgroundColor: `var(${addLineNumberBGName})`,
        }}
      >
        <DiffUnifiedAddWidget
          index={index - 1}
          lineNumber={lineNumber}
          diffFile={diffFile}
          side={SplitSide.new}
          onWidgetClick={onAddWidgetClick}
          onOpenAddWidget={onOpenAddWidget}
        />
        <div class="flex">
          <span class="inline-block w-[50%]" />
          <span class="shrink-0 w-[10px]" />
          <span data-line-num-new={lineNumber} class="inline-block w-[50%]">
            {lineNumber}
          </span>
        </div>
      </td>
      <td class="diff-line-content pr-[10px] align-top">
        <DiffContent
          enableWrap={enableWrap}
          diffFile={diffFile}
          enableHighlight={enableHighlight}
          rawLine={rawLine}
          diffLine={diffLine}
          syntaxLine={syntaxLine}
        />
      </td>
    </tr>
  );
};

export const DiffUnifiedLine = defineComponent(
  (props: { index: number; diffFile: DiffFile; lineNumber: number }) => {
    const unifiedItem = ref(props.diffFile.getUnifiedLine(props.index));

    const enableWrap = useEnableWrap();

    const setWidget = useSetWidget();

    const onAddWidgetClick = useOnAddWidgetClick();

    const enableHighlight = useEnableHighlight();

    const enableAddWidget = useEnableAddWidget();

    const currentItemHasHidden = ref(unifiedItem.value?.isHidden);

    const currentItemHasChange = ref(checkDiffLineIncludeChange(unifiedItem.value?.diff));

    const currentSyntaxItem = ref(
      unifiedItem.value?.newLineNumber
        ? props.diffFile.getNewSyntaxLine(unifiedItem.value.newLineNumber)
        : unifiedItem.value?.oldLineNumber
          ? props.diffFile.getOldSyntaxLine(unifiedItem.value.oldLineNumber)
          : undefined
    );

    useSubscribeDiffFile(props, (diffFile) => {
      unifiedItem.value = diffFile.getUnifiedLine(props.index);

      currentSyntaxItem.value = unifiedItem.value?.newLineNumber
        ? diffFile.getNewSyntaxLine(unifiedItem.value.newLineNumber)
        : unifiedItem.value?.oldLineNumber
          ? diffFile.getOldSyntaxLine(unifiedItem.value.oldLineNumber)
          : undefined;

      currentItemHasHidden.value = unifiedItem.value?.isHidden;

      currentItemHasChange.value = checkDiffLineIncludeChange(unifiedItem.value?.diff);
    });

    const onOpenAddWidget = (lineNumber, side) => setWidget({ side: side, lineNumber: lineNumber });

    return () => {
      if (currentItemHasHidden.value) return null;

      if (currentItemHasChange.value) {
        if (unifiedItem.value.oldLineNumber) {
          return (
            <DiffUnifiedOldLine
              index={props.lineNumber}
              enableWrap={enableWrap.value}
              diffFile={props.diffFile}
              rawLine={unifiedItem.value.value || ""}
              diffLine={unifiedItem.value.diff}
              syntaxLine={currentSyntaxItem.value}
              enableHighlight={enableHighlight.value}
              lineNumber={unifiedItem.value.oldLineNumber}
              onAddWidgetClick={onAddWidgetClick}
              onOpenAddWidget={onOpenAddWidget}
            />
          );
        } else {
          return (
            <DiffUnifiedNewLine
              index={props.lineNumber}
              enableWrap={enableWrap.value}
              diffFile={props.diffFile}
              rawLine={unifiedItem.value.value || ""}
              diffLine={unifiedItem.value.diff}
              syntaxLine={currentSyntaxItem.value}
              enableHighlight={enableHighlight.value}
              lineNumber={unifiedItem.value.newLineNumber!}
              onAddWidgetClick={onAddWidgetClick}
              onOpenAddWidget={onOpenAddWidget}
            />
          );
        }
      } else {
        return (
          <tr
            data-line={props.lineNumber}
            data-state={unifiedItem.value.diff ? "diff" : "plain"}
            class="diff-line group"
            style={{
              backgroundColor: unifiedItem.value.diff ? `var(${plainContentBGName})` : `var(${expandContentBGName})`,
            }}
          >
            <td
              class="diff-line-num left-0 pl-[10px] pr-[10px] text-right select-none w-[1%] min-w-[100px] whitespace-nowrap align-top"
              style={{
                position: enableWrap.value ? "relative" : "sticky",
                color: `var(${plainLineNumberColorName})`,
                backgroundColor: unifiedItem.value.diff
                  ? `var(${plainLineNumberBGName})`
                  : `var(${expandContentBGName})`,
              }}
            >
              {enableAddWidget.value && unifiedItem.value.diff && (
                <DiffUnifiedAddWidget
                  index={props.index}
                  diffFile={props.diffFile}
                  lineNumber={unifiedItem.value.newLineNumber}
                  side={SplitSide.new}
                  onOpenAddWidget={onOpenAddWidget}
                  onWidgetClick={onAddWidgetClick}
                />
              )}
              <div class="flex opacity-[0.5]">
                <span data-line-num-old={unifiedItem.value.oldLineNumber} class="inline-block w-[50%]">
                  {unifiedItem.value.oldLineNumber}
                </span>
                <span class="w-[10px] shrink-0" />
                <span data-line-num-new={unifiedItem.value.newLineNumber} class="inline-block w-[50%]">
                  {unifiedItem.value.newLineNumber}
                </span>
              </div>
            </td>
            <td class="diff-line-content pr-[10px] align-top">
              <DiffContent
                enableWrap={enableWrap.value}
                diffFile={props.diffFile}
                enableHighlight={enableHighlight.value}
                rawLine={unifiedItem.value.value || ""}
                diffLine={unifiedItem.value.diff}
                syntaxLine={currentSyntaxItem.value}
              />
            </td>
          </tr>
        );
      }
    };
  },
  { name: "DiffUnifiedLine", props: ["diffFile", "index", "lineNumber"] }
);
