import { DiffLineType, type DiffFile, checkDiffLineIncludeChange } from "@git-diff-view/core";
import { computed, defineComponent, ref } from "vue";

import { useEnableAddWidget, useEnableHighlight, useEnableWrap, useOnAddWidgetClick, useSetWidget } from "../context";
import { useSubscribeDiffFile } from "../hooks/useSubscribeDiffFile";
import { useSyncHeight } from "../hooks/useSyncHeight";

import { emptyBGName, getContentBG, getLineNumberBG, plainLineNumberColorName } from "./color";
import { DiffSplitAddWidget } from "./DiffAddWidget";
import { DiffContent } from "./DiffContent";
import { SplitSide } from "./DiffView";

export const DiffSplitLine = defineComponent(
  (props: { index: number; side: SplitSide; diffFile: DiffFile; lineNumber: number }) => {
    const enableWrap = useEnableWrap();

    const setWidget = useSetWidget();

    const enableAddWidget = useEnableAddWidget();

    const enableHighlight = useEnableHighlight();

    const onAddWidgetClick = useOnAddWidgetClick();

    const currentItem = ref(
      props.side === SplitSide.old
        ? props.diffFile.getSplitLeftLine(props.index)
        : props.diffFile.getSplitRightLine(props.index)
    );

    const currentItemHasDiff = ref(!!currentItem.value?.diff);

    const currentItemHasChange = ref(checkDiffLineIncludeChange(currentItem.value?.diff));

    const currentItemHasHidden = ref(currentItem.value?.isHidden);

    const currentSyntaxItem = ref(
      props.side === SplitSide.old
        ? props.diffFile.getOldSyntaxLine(currentItem.value?.lineNumber)
        : props.diffFile.getNewSyntaxLine(currentItem.value?.lineNumber)
    );

    useSubscribeDiffFile(props, (diffFile) => {
      currentItem.value =
        props.side === SplitSide.old
          ? diffFile.getSplitLeftLine(props.index)
          : diffFile.getSplitRightLine(props.index);

      currentSyntaxItem.value =
        props.side === SplitSide.old
          ? diffFile.getOldSyntaxLine(currentItem.value?.lineNumber)
          : diffFile.getNewSyntaxLine(currentItem.value?.lineNumber);

      currentItemHasDiff.value = !!currentItem.value?.diff;

      currentItemHasChange.value = checkDiffLineIncludeChange(currentItem.value?.diff);

      currentItemHasHidden.value = currentItem.value?.isHidden;
    })

    const lineSelector = computed(() => `tr[data-line="${props.lineNumber}"]`);

    const side = computed(() => (props.side === SplitSide.old ? "left" : "right"));

    useSyncHeight({
      selector: lineSelector,
      enable: currentItemHasDiff,
      side: side,
    });

    return () => {
      if (currentItemHasHidden.value) return null;

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
              class="diff-line-num left-0 pl-[10px] pr-[10px] text-right align-top select-none w-[1%] min-w-[50px]"
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
                  diffFile={props.diffFile}
                  onOpenAddWidget={(lineNumber, side) => setWidget({ side: side, lineNumber: lineNumber })}
                  onWidgetClick={onAddWidgetClick}
                />
              )}
              <span
                data-line-num={currentItem.value.lineNumber}
                style={{ opacity: currentItemHasChange.value ? undefined : 0.5 }}
              >
                {currentItem.value.lineNumber}
              </span>
            </td>
            <td class="diff-line-content pr-[10px] align-top">
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
              class="diff-line-num diff-line-num-placeholder pl-[10px] pr-[10px] left-0 w-[1%] min-w-[50px]"
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
