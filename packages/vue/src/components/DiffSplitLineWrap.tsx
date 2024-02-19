import { DiffLineType, type DiffFile, checkDiffLineIncludeChange } from "@git-diff-view/core";
import { defineComponent, ref } from "vue";

import { useEnableAddWidget, useEnableHighlight, useOnAddWidgetClick, useSetWidget } from "../context";
import { useSubscribeDiffFile } from "../hooks/useSubscribeDiffFile";

import { emptyBGName, getContentBG, getLineNumberBG, plainLineNumberColorName } from "./color";
import { DiffSplitAddWidget } from "./DiffAddWidget";
import { DiffContent } from "./DiffContent";
import { SplitSide } from "./DiffView";

export const DiffSplitLine = defineComponent(
  (props: { index: number; diffFile: DiffFile; lineNumber: number }) => {
    const setWidget = useSetWidget();

    const enableAddWidget = useEnableAddWidget();

    const enableHighlight = useEnableHighlight();

    const onAddWidgetClick = useOnAddWidgetClick();

    const oldLine = ref(props.diffFile.getSplitLeftLine(props.index));

    const newLine = ref(props.diffFile.getSplitRightLine(props.index));

    const oldSyntaxLine = ref(props.diffFile.getOldSyntaxLine(oldLine.value?.lineNumber));

    const newSyntaxLine = ref(props.diffFile.getNewSyntaxLine(newLine.value?.lineNumber));

    const hasDiff = ref(!!oldLine.value?.diff || !!newLine.value?.diff);

    const hasChange = ref(
      checkDiffLineIncludeChange(oldLine.value?.diff) || checkDiffLineIncludeChange(newLine.value?.diff)
    );

    const hasHidden = ref(oldLine.value?.isHidden && newLine.value?.isHidden);

    const oldLineIsDelete = ref(oldLine.value?.diff?.type === DiffLineType.Delete);

    const newLineIsAdded = ref(newLine.value?.diff?.type === DiffLineType.Add);

    useSubscribeDiffFile(props, (diffFile) => {
      oldLine.value = diffFile.getSplitLeftLine(props.index);

      newLine.value = diffFile.getSplitRightLine(props.index);

      oldSyntaxLine.value = diffFile.getOldSyntaxLine(oldLine.value?.lineNumber);

      newSyntaxLine.value = diffFile.getNewSyntaxLine(newLine.value?.lineNumber);

      hasDiff.value = !!oldLine.value?.diff || !!newLine.value?.diff;

      hasChange.value =
        checkDiffLineIncludeChange(oldLine.value?.diff) || checkDiffLineIncludeChange(newLine.value?.diff);

      hasHidden.value = oldLine.value?.isHidden && newLine.value?.isHidden;

      oldLineIsDelete.value = oldLine.value?.diff?.type === DiffLineType.Delete;

      newLineIsAdded.value = newLine.value?.diff?.type === DiffLineType.Add;
    });

    return () => {
      if (hasHidden.value) return null;

      const hasOldLine = !!oldLine.value?.lineNumber;

      const hasNewLine = !!newLine.value?.lineNumber;

      const oldLineContentBG = getContentBG(false, oldLineIsDelete.value, hasDiff.value);

      const oldLineNumberBG = getLineNumberBG(false, oldLineIsDelete.value, hasDiff.value);

      const newLineContentBG = getContentBG(newLineIsAdded.value, false, hasDiff.value);

      const newLineNumberBG = getLineNumberBG(newLineIsAdded.value, false, hasDiff.value);

      return (
        <tr data-line={props.lineNumber} data-state={hasDiff.value ? "diff" : "plain"} class="diff-line">
          {hasOldLine ? (
            <>
              <td
                class="diff-line-old-num group relative pl-[10px] pr-[10px] text-right align-top select-none w-[1%] min-w-[40px]"
                style={{ backgroundColor: oldLineNumberBG, color: `var(${plainLineNumberColorName})` }}
              >
                {hasDiff && enableAddWidget && (
                  <DiffSplitAddWidget
                    index={props.index}
                    lineNumber={oldLine.value.lineNumber}
                    side={SplitSide.old}
                    diffFile={props.diffFile}
                    onWidgetClick={onAddWidgetClick}
                    className="absolute left-[100%] translate-x-[-50%] z-[1]"
                    onOpenAddWidget={(lineNumber, side) => setWidget({ lineNumber: lineNumber, side: side })}
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
                {hasDiff && enableAddWidget && (
                  <DiffSplitAddWidget
                    index={props.index}
                    lineNumber={oldLine.value.lineNumber}
                    side={SplitSide.old}
                    diffFile={props.diffFile}
                    onWidgetClick={onAddWidgetClick}
                    className="absolute right-[100%] translate-x-[50%] z-[1] select-none"
                    onOpenAddWidget={(lineNumber, side) => setWidget({ lineNumber: lineNumber, side: side })}
                  />
                )}
                <DiffContent
                  enableWrap={true}
                  diffFile={props.diffFile}
                  rawLine={oldLine.value.value}
                  diffLine={oldLine.value.diff}
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
                class="diff-line-new-num group relative pl-[10px] pr-[10px] text-right align-top select-none w-[1%] min-w-[40px] border-l-[1px] border-l-[#ccc]"
                style={{ backgroundColor: newLineNumberBG, color: `var(${plainLineNumberColorName})` }}
              >
                {hasDiff && enableAddWidget && (
                  <DiffSplitAddWidget
                    index={props.index}
                    lineNumber={newLine.value.lineNumber}
                    side={SplitSide.new}
                    diffFile={props.diffFile}
                    onWidgetClick={onAddWidgetClick}
                    className="absolute left-[100%] translate-x-[-50%] z-[1]"
                    onOpenAddWidget={(lineNumber, side) => setWidget({ lineNumber: lineNumber, side: side })}
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
                {hasDiff && enableAddWidget && (
                  <DiffSplitAddWidget
                    index={props.index}
                    lineNumber={newLine.value.lineNumber}
                    side={SplitSide.new}
                    diffFile={props.diffFile}
                    onWidgetClick={onAddWidgetClick}
                    className="absolute right-[100%] translate-x-[50%] z-[1] select-none"
                    onOpenAddWidget={(lineNumber, side) => setWidget({ lineNumber: lineNumber, side: side })}
                  />
                )}
                <DiffContent
                  enableWrap={true}
                  diffFile={props.diffFile}
                  rawLine={newLine.value.value || ""}
                  diffLine={newLine.value.diff}
                  syntaxLine={newSyntaxLine.value}
                  enableHighlight={enableHighlight.value}
                />
              </td>
            </>
          ) : (
            <td
              class="diff-line-new-placeholder border-l-[1px] border-l-[#ccc] select-none"
              style={{ backgroundColor: `var(${emptyBGName})` }}
              colspan={2}
            >
              <span>&ensp;</span>
            </td>
          )}
        </tr>
      );
    };
  },
  { name: "DiffSplitLine", props: ["diffFile", "index", "lineNumber"] }
);
