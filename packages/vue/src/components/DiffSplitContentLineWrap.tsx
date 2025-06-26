import { DiffLineType, type DiffFile, checkDiffLineIncludeChange } from "@git-diff-view/core";
import {
  borderColorName,
  emptyBGName,
  expandLineNumberColorName,
  getContentBG,
  getLineNumberBG,
  plainLineNumberColorName,
} from "@git-diff-view/utils";
import { computed, defineComponent, ref } from "vue";

import { useEnableAddWidget, useEnableHighlight, useOnAddWidgetClick, useSetWidget } from "../context";
import { useSubscribeDiffFile } from "../hooks/useSubscribeDiffFile";

import { DiffSplitAddWidget } from "./DiffAddWidget";
import { DiffContent } from "./DiffContent";
import { SplitSide } from "./DiffView";

export const DiffSplitContentLine = defineComponent(
  (props: { index: number; diffFile: DiffFile; lineNumber: number }) => {
    const setWidget = useSetWidget();

    const enableAddWidget = useEnableAddWidget();

    const enableHighlight = useEnableHighlight();

    const onAddWidgetClick = useOnAddWidgetClick();

    const oldLine = computed(() => props.diffFile.getSplitLeftLine(props.index));

    const newLine = computed(() => props.diffFile.getSplitRightLine(props.index));

    const oldSyntaxLine = ref(props.diffFile.getOldSyntaxLine(oldLine.value?.lineNumber));

    const newSyntaxLine = ref(props.diffFile.getNewSyntaxLine(newLine.value?.lineNumber));

    const oldPlainLine = ref(props.diffFile.getOldPlainLine(oldLine.value.lineNumber));

    const newPlainLine = ref(props.diffFile.getNewPlainLine(newLine.value.lineNumber));

    const hasDiff = computed(() => !!oldLine.value?.diff || !!newLine.value?.diff);

    const hasChange = computed(
      () => checkDiffLineIncludeChange(oldLine.value?.diff) || checkDiffLineIncludeChange(newLine.value?.diff)
    );

    const hasHidden = computed(() => oldLine.value?.isHidden && newLine.value?.isHidden);

    useSubscribeDiffFile(props, (diffFile) => {
      oldSyntaxLine.value = diffFile.getOldSyntaxLine(oldLine.value?.lineNumber);

      newSyntaxLine.value = diffFile.getNewSyntaxLine(newLine.value?.lineNumber);

      oldPlainLine.value = diffFile.getOldPlainLine(oldLine.value.lineNumber);

      newPlainLine.value = diffFile.getNewPlainLine(newLine.value.lineNumber);
    });

    const onOpenAddWidget = (lineNumber: number, side: SplitSide) => setWidget({ side: side, lineNumber: lineNumber });

    return () => {
      if (hasHidden.value) return null;

      const hasOldLine = !!oldLine.value?.lineNumber;

      const hasNewLine = !!newLine.value?.lineNumber;

      const oldLineIsDelete = oldLine.value?.diff?.type === DiffLineType.Delete;

      const newLineIsAdded = newLine.value?.diff?.type === DiffLineType.Add;

      const oldLineContentBG = getContentBG(false, oldLineIsDelete, hasDiff.value);

      const oldLineNumberBG = getLineNumberBG(false, oldLineIsDelete, hasDiff.value);

      const newLineContentBG = getContentBG(newLineIsAdded, false, hasDiff.value);

      const newLineNumberBG = getLineNumberBG(newLineIsAdded, false, hasDiff.value);

      return (
        <tr data-line={props.lineNumber} data-state={hasDiff.value ? "diff" : "plain"} class="diff-line">
          {hasOldLine ? (
            <>
              <td
                class="diff-line-old-num group relative w-[1%] min-w-[40px] select-none pl-[10px] pr-[10px] text-right align-top"
                style={{
                  backgroundColor: oldLineNumberBG,
                  color: `var(${hasDiff.value ? plainLineNumberColorName : expandLineNumberColorName})`,
                }}
              >
                {hasDiff.value && enableAddWidget.value && (
                  <DiffSplitAddWidget
                    index={props.index}
                    lineNumber={oldLine.value.lineNumber}
                    side={SplitSide.old}
                    diffFile={props.diffFile}
                    onWidgetClick={onAddWidgetClick}
                    className="absolute left-[100%] z-[1] translate-x-[-50%]"
                    onOpenAddWidget={onOpenAddWidget}
                  />
                )}
                <span data-line-num={oldLine.value.lineNumber} style={{ opacity: hasChange.value ? undefined : 0.5 }}>
                  {oldLine.value.lineNumber}
                </span>
              </td>
              <td
                class="diff-line-old-content group relative pr-[10px] align-top"
                style={{ backgroundColor: oldLineContentBG }}
                data-side={SplitSide[SplitSide.old]}
              >
                {hasDiff.value && enableAddWidget.value && (
                  <DiffSplitAddWidget
                    index={props.index}
                    lineNumber={oldLine.value.lineNumber}
                    side={SplitSide.old}
                    diffFile={props.diffFile}
                    onWidgetClick={onAddWidgetClick}
                    className="absolute right-[100%] z-[1] translate-x-[50%]"
                    onOpenAddWidget={onOpenAddWidget}
                  />
                )}
                <DiffContent
                  enableWrap={true}
                  diffFile={props.diffFile}
                  rawLine={oldLine.value?.value}
                  diffLine={oldLine.value?.diff}
                  plainLine={oldPlainLine.value}
                  syntaxLine={oldSyntaxLine.value}
                  enableHighlight={enableHighlight.value}
                />
              </td>
            </>
          ) : (
            <td
              class="diff-line-old-placeholder select-none"
              style={{ backgroundColor: `var(${emptyBGName})` }}
              colspan={2}
            >
              <span>&ensp;</span>
            </td>
          )}
          {hasNewLine ? (
            <>
              <td
                class="diff-line-new-num group relative w-[1%] min-w-[40px] select-none border-l-[1px] pl-[10px] pr-[10px] text-right align-top"
                style={{
                  backgroundColor: newLineNumberBG,
                  color: `var(${hasDiff.value ? plainLineNumberColorName : expandLineNumberColorName})`,
                  borderLeftColor: `var(${borderColorName})`,
                  borderLeftStyle: "solid",
                }}
              >
                {hasDiff.value && enableAddWidget.value && (
                  <DiffSplitAddWidget
                    index={props.index}
                    lineNumber={newLine.value.lineNumber}
                    side={SplitSide.new}
                    diffFile={props.diffFile}
                    onWidgetClick={onAddWidgetClick}
                    className="absolute left-[100%] z-[1] translate-x-[-50%]"
                    onOpenAddWidget={onOpenAddWidget}
                  />
                )}
                <span data-line-num={newLine.value.lineNumber} style={{ opacity: hasChange.value ? undefined : 0.5 }}>
                  {newLine.value.lineNumber}
                </span>
              </td>
              <td
                class="diff-line-new-content group relative pr-[10px] align-top"
                style={{ backgroundColor: newLineContentBG }}
                data-side={SplitSide[SplitSide.new]}
              >
                {hasDiff.value && enableAddWidget.value && (
                  <DiffSplitAddWidget
                    index={props.index}
                    lineNumber={newLine.value.lineNumber}
                    side={SplitSide.new}
                    diffFile={props.diffFile}
                    onWidgetClick={onAddWidgetClick}
                    className="absolute right-[100%] z-[1] translate-x-[50%]"
                    onOpenAddWidget={onOpenAddWidget}
                  />
                )}
                <DiffContent
                  enableWrap={true}
                  diffFile={props.diffFile}
                  rawLine={newLine.value?.value || ""}
                  diffLine={newLine.value?.diff}
                  plainLine={newPlainLine.value}
                  syntaxLine={newSyntaxLine.value}
                  enableHighlight={enableHighlight.value}
                />
              </td>
            </>
          ) : (
            <td
              class="diff-line-new-placeholder select-none border-l-[1px]"
              style={{
                backgroundColor: `var(${emptyBGName})`,
                borderLeftColor: `var(${borderColorName})`,
                borderLeftStyle: "solid",
              }}
              colspan={2}
            >
              <span>&ensp;</span>
            </td>
          )}
        </tr>
      );
    };
  },
  { name: "DiffSplitContentLine", props: ["diffFile", "index", "lineNumber"] }
);
