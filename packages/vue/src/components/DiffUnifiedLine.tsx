import { defineComponent, ref } from "vue";

import { SplitSide } from "..";
import { useEnableAddWidget, useEnableHighlight, useEnableWrap, useOnAddWidgetClick } from "../context";
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

import type { DiffFileExtends } from "../utils";
import type { DiffFile, SyntaxLine, DiffLine } from "@git-diff-view/core";

const DiffUnifiedOldLine = ({
  index,
  diffLine,
  rawLine,
  syntaxLine,
  lineNumber,
  diffFile,
  enableWrap,
  enableHighlight,
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
  onAddWidgetClick?: (event: "onAddWidgetClick", lineNumber: number, side: SplitSide) => void;
}) => {
  return (
    <tr data-line={index} data-state="diff" data-mode="del" class="diff-line group" style={{ backgroundColor: `var(${delContentBGName})` }}>
      <td
        class="diff-line-num left-0 pl-[10px] pr-[10px] text-left select-none w-[1%] min-w-[60px] whitespace-nowrap align-top"
        style={{
          position: enableWrap ? "relative" : "sticky",
          color: `var(${plainLineNumberColorName})`,
          backgroundColor: `var(${delLineNumberBGName})`,
        }}
      >
        <DiffUnifiedAddWidget
          index={index - 1}
          lineNumber={lineNumber}
          diffFile={diffFile as DiffFileExtends}
          side={SplitSide.old}
          onWidgetClick={onAddWidgetClick}
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
  onAddWidgetClick?: (event: "onAddWidgetClick", lineNumber: number, side: SplitSide) => void;
}) => {
  return (
    <tr data-line={index} data-state="diff" data-mode="add" class="diff-line group" style={{ backgroundColor: `var(${addContentBGName})` }}>
      <td
        class="diff-line-num left-0 pl-[10px] pr-[10px] text-left select-none w-[1%] min-w-[60px] whitespace-nowrap align-top"
        style={{
          position: enableWrap ? "relative" : "sticky",
          color: `var(${plainLineNumberColorName})`,
          backgroundColor: `var(${addLineNumberBGName})`,
        }}
      >
        <DiffUnifiedAddWidget
          index={index - 1}
          lineNumber={lineNumber}
          diffFile={diffFile as DiffFileExtends}
          side={SplitSide.new}
          onWidgetClick={onAddWidgetClick}
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

    const onAddWidgetClick = useOnAddWidgetClick();

    const enableHighlight = useEnableHighlight();

    const enableAddWidget = useEnableAddWidget();

    const currentItemHasHidden = ref(unifiedItem.value?.isHidden);

    const currentItemHasChange = ref(unifiedItem.value?.diff?.isIncludeableLine());

    const currentSyntaxItem = ref(
      unifiedItem.value?.newLineNumber
        ? props.diffFile.getNewSyntaxLine(unifiedItem.value.newLineNumber)
        : unifiedItem.value?.oldLineNumber
          ? props.diffFile.getOldSyntaxLine(unifiedItem.value.oldLineNumber)
          : undefined
    );

    useSubscribeDiffFile(props, (diffFile) => (unifiedItem.value = diffFile.getUnifiedLine(props.index)));

    useSubscribeDiffFile(props, () => (currentItemHasHidden.value = unifiedItem.value?.isHidden));

    useSubscribeDiffFile(props, () => (currentItemHasChange.value = unifiedItem.value?.diff?.isIncludeableLine()));

    useSubscribeDiffFile(
      props,
      (diffFile) =>
        (currentSyntaxItem.value = unifiedItem.value?.newLineNumber
          ? diffFile.getNewSyntaxLine(unifiedItem.value.newLineNumber)
          : unifiedItem.value?.oldLineNumber
            ? diffFile.getOldSyntaxLine(unifiedItem.value.oldLineNumber)
            : undefined)
    );

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
              class="diff-line-num left-0 pl-[10px] pr-[10px] text-left select-none w-[1%] min-w-[60px] whitespace-nowrap align-top"
              style={{
                position: enableWrap.value ? "relative" : "sticky",
                color: `var(${plainLineNumberColorName})`,
                backgroundColor: unifiedItem.value.diff ? `var(${plainLineNumberBGName})` : `var(${expandContentBGName})`,
              }}
            >
              {enableAddWidget.value && unifiedItem.value.diff && (
                <DiffUnifiedAddWidget
                  index={props.index}
                  diffFile={props.diffFile as DiffFileExtends}
                  lineNumber={unifiedItem.value.newLineNumber}
                  side={SplitSide.new}
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
