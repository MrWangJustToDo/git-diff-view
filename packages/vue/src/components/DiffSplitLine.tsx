import { DiffLineType, type DiffFile } from "@git-diff-view/core";
import { computed, defineComponent, ref } from "vue";

import { useEnableAddWidget, useEnableHighlight, useEnableWrap, useOnAddWidgetClick } from "../context";
import { useForceUpdate } from "../hooks/useForceUpdate";
import { useSubscribeDiffFile } from "../hooks/useSubscribeDiffFile";
import { useSyncHeight } from "../hooks/useSyncHeight";

import { emptyBGName, getContentBG, getLineNumberBG, plainLineNumberColorName } from "./color";
import { DiffSplitAddWidget } from "./DiffAddWidget";
import { DiffContent } from "./DiffContent";
import { SplitSide } from "./DiffView";

import type { DiffFileExtends } from "../utils";

export const DiffSplitLine = defineComponent(
  (props: { index: number; side: SplitSide; diffFile: DiffFile; lineNumber: number }) => {
    const enableWrap = useEnableWrap();

    const enableAddWidget = useEnableAddWidget();

    const enableHighlight = useEnableHighlight();

    const onAddWidgetClick = useOnAddWidgetClick();

    const currentItem = ref(props.side === SplitSide.old ? props.diffFile.getSplitLeftLine(props.index) : props.diffFile.getSplitRightLine(props.index));

    const currentItemHasDiff = ref(!!currentItem.value.diff);

    const currentItemHasChange = ref(currentItem.value?.diff?.isIncludeableLine());

    const currentSyntaxItem = ref(props.side === SplitSide.old ? props.diffFile.getOldSyntaxLine(currentItem.value.lineNumber) : props.diffFile.getNewSyntaxLine(currentItem.value.lineNumber));

    useSubscribeDiffFile(
      props,
      (diffFile) => (currentItem.value = props.side === SplitSide.old ? diffFile.getSplitLeftLine(props.index) : diffFile.getSplitRightLine(props.index))
    );

    useSubscribeDiffFile(
      props,
      (diffFile) => (currentSyntaxItem.value = props.side === SplitSide.old ? diffFile.getOldSyntaxLine(currentItem.value.lineNumber) : diffFile.getNewSyntaxLine(currentItem.value.lineNumber))
    );

    useSubscribeDiffFile(props, () => (currentItemHasDiff.value = !!currentItem.value.diff));

    useSubscribeDiffFile(props, () => (currentItemHasChange.value = currentItem.value.diff?.isIncludeableLine()));

    const count = useForceUpdate(props);

    const lineSelector = computed(() => `tr[data-line="${props.lineNumber}"]`);

    const side = computed(() => (props.side === SplitSide.old ? "left" : "right"));

    useSyncHeight({
      selector: lineSelector,
      enable: currentItemHasDiff,
      side: side,
    });

    return () => {
      count.value;

      if (currentItem.value?.isHidden) return null;

      const isAdded = currentItem.value?.diff?.type === DiffLineType.Add;

      const isDelete = currentItem.value?.diff?.type === DiffLineType.Delete;

      const contentBG = getContentBG(isAdded, isDelete, currentItemHasDiff.value);

      const lineNumberBG = getLineNumberBG(isAdded, isDelete, currentItemHasDiff.value);

      if (currentItem.value?.lineNumber) {
        return (
          <tr
            data-line={props.lineNumber}
            data-state={currentItemHasDiff.value ? "diff" : "plain"}
            data-side={props.side === SplitSide.old ? "left" : "right"}
            data-mode={isAdded ? "add" : isDelete ? "del" : undefined}
            class="diff-line group"
            style={{
              backgroundColor: contentBG,
            }}
          >
            <td
              class="diff-line-num left-0 pl-[10px] pr-[10px] text-right align-top select-none z-[1]"
              style={{
                position: enableWrap.value ? "relative" : "sticky",
                backgroundColor: lineNumberBG,
                color: `var(${plainLineNumberColorName})`,
              }}
            >
              {currentItemHasDiff.value && enableAddWidget.value && (
                <DiffSplitAddWidget
                  index={props.index}
                  lineNumber={currentItem.value.lineNumber}
                  side={props.side}
                  diffFile={props.diffFile as DiffFileExtends}
                  onWidgetClick={onAddWidgetClick}
                />
              )}
              <span data-line-num={currentItem.value.lineNumber} style={{ opacity: currentItemHasChange.value ? undefined : 0.5 }}>
                {currentItem.value.lineNumber}
              </span>
            </td>
            <td class="diff-line-content pr-[10px] align-top relative">
              <DiffContent
                enableWrap={enableWrap.value}
                diffFile={props.diffFile}
                rawLine={currentItem.value.value!}
                diffLine={currentItem.value.diff}
                syntaxLine={currentSyntaxItem.value}
                enableHighlight={enableHighlight.value}
              />
            </td>
          </tr>
        );
      } else {
        return (
          <tr
            data-line={props.lineNumber}
            data-state="diff"
            data-side={props.side === SplitSide.old ? "left" : "right"}
            style={{ backgroundColor: `var(${emptyBGName})` }}
            class="diff-line diff-line-empty select-none"
          >
            <td
              class="diff-line-num diff-line-num-placeholder pl-[10px] pr-[10px] left-0 z-[1]"
              style={{
                position: enableWrap.value ? "relative" : "sticky",
              }}
            />
            <td class="diff-line-content diff-line-content-placeholder pr-[10px] align-top" />
          </tr>
        );
      }
    };
  },
  { name: "DiffSplitLine", props: ["diffFile", "index", "lineNumber", "side"] }
);
