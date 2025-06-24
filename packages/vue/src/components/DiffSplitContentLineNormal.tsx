import { DiffLineType, type DiffFile, checkDiffLineIncludeChange } from "@git-diff-view/core";
import {
  getContentBG,
  getLineNumberBG,
  plainLineNumberColorName,
  diffAsideWidthName,
  emptyBGName,
  expandLineNumberColorName,
} from "@git-diff-view/utils";
import { defineComponent, ref } from "vue";

import { useEnableAddWidget, useEnableHighlight, useOnAddWidgetClick, useSetWidget } from "../context";
import { useSubscribeDiffFile } from "../hooks/useSubscribeDiffFile";

import { DiffSplitAddWidget } from "./DiffAddWidget";
import { DiffContent } from "./DiffContent";
import { SplitSide } from "./DiffView";

export const DiffSplitContentLine = defineComponent(
  (props: { index: number; side: SplitSide; diffFile: DiffFile; lineNumber: number }) => {
    const setWidget = useSetWidget();

    const enableAddWidget = useEnableAddWidget();

    const enableHighlight = useEnableHighlight();

    const onAddWidgetClick = useOnAddWidgetClick();

    const currentLine = ref(
      props.side === SplitSide.old
        ? props.diffFile.getSplitLeftLine(props.index)
        : props.diffFile.getSplitRightLine(props.index)
    );

    const currentLineHasDiff = ref(!!currentLine.value?.diff);

    const currentLineHasChange = ref(checkDiffLineIncludeChange(currentLine.value?.diff));

    const currentLineHasHidden = ref(currentLine.value?.isHidden);

    const currentLineHasContent = ref(currentLine.value?.lineNumber);

    const currentSyntaxLine = ref(
      props.side === SplitSide.old
        ? props.diffFile.getOldSyntaxLine(currentLine.value?.lineNumber)
        : props.diffFile.getNewSyntaxLine(currentLine.value?.lineNumber)
    );

    const currentPlainLine = ref(
      props.side === SplitSide.old
        ? props.diffFile.getOldPlainLine(currentLine.value?.lineNumber)
        : props.diffFile.getNewPlainLine(currentLine.value?.lineNumber)
    );

    useSubscribeDiffFile(props, (diffFile) => {
      currentLine.value =
        props.side === SplitSide.old ? diffFile.getSplitLeftLine(props.index) : diffFile.getSplitRightLine(props.index);

      currentSyntaxLine.value =
        props.side === SplitSide.old
          ? diffFile.getOldSyntaxLine(currentLine.value?.lineNumber)
          : diffFile.getNewSyntaxLine(currentLine.value?.lineNumber);

      currentPlainLine.value =
        props.side === SplitSide.old
          ? diffFile.getOldPlainLine(currentLine.value?.lineNumber)
          : diffFile.getNewPlainLine(currentLine.value?.lineNumber);

      currentLineHasDiff.value = !!currentLine.value?.diff;

      currentLineHasChange.value = checkDiffLineIncludeChange(currentLine.value?.diff);

      currentLineHasHidden.value = currentLine.value?.isHidden;

      currentLineHasContent.value = currentLine.value?.lineNumber;
    });

    const onOpenAddWidget = (lineNumber: number, side: SplitSide) => setWidget({ side: side, lineNumber: lineNumber });

    return () => {
      if (currentLineHasHidden.value) return null;

      const isAdded = currentLine.value?.diff?.type === DiffLineType.Add;

      const isDelete = currentLine.value?.diff?.type === DiffLineType.Delete;

      const contentBG = getContentBG(isAdded, isDelete, currentLineHasDiff.value);

      const lineNumberBG = getLineNumberBG(isAdded, isDelete, currentLineHasDiff.value);

      return (
        <tr
          data-line={props.lineNumber}
          data-state={currentLineHasDiff.value || !currentLineHasContent.value ? "diff" : "plain"}
          data-side={SplitSide[props.side]}
          class={"diff-line" + (currentLineHasContent.value ? " group" : "")}
        >
          {currentLineHasContent.value ? (
            <>
              <td
                class={`diff-line-${SplitSide[props.side]}-num sticky z-[1] left-0 w-[1%] min-w-[40px] select-none pl-[10px] pr-[10px] text-right align-top`}
                style={{
                  backgroundColor: lineNumberBG,
                  color: `var(${currentLineHasDiff.value ? plainLineNumberColorName : expandLineNumberColorName})`,
                  width: `var(${diffAsideWidthName})`,
                  minWidth: `var(${diffAsideWidthName})`,
                  maxWidth: `var(${diffAsideWidthName})`,
                }}
              >
                {currentLineHasDiff.value && enableAddWidget.value && (
                  <DiffSplitAddWidget
                    index={props.index}
                    lineNumber={currentLine.value.lineNumber}
                    side={props.side}
                    diffFile={props.diffFile}
                    onWidgetClick={onAddWidgetClick}
                    className="absolute left-[100%] z-[1] translate-x-[-50%]"
                    onOpenAddWidget={onOpenAddWidget}
                  />
                )}
                <span
                  data-line-num={currentLine.value.lineNumber}
                  style={{ opacity: currentLineHasChange.value ? undefined : 0.5 }}
                >
                  {currentLine.value.lineNumber}
                </span>
              </td>
              <td
                class={`diff-line-${SplitSide[props.side]}-content pr-[10px] align-top`}
                style={{ backgroundColor: contentBG }}
              >
                <DiffContent
                  enableWrap={false}
                  diffFile={props.diffFile}
                  rawLine={currentLine.value?.value || ''}
                  diffLine={currentLine.value?.diff}
                  plainLine={currentPlainLine.value}
                  syntaxLine={currentSyntaxLine.value}
                  enableHighlight={enableHighlight.value}
                />
              </td>
            </>
          ) : (
            <td
              class={`diff-line-${SplitSide[props.side]}-placeholder select-none`}
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
  { name: "DiffSplitContentLine", props: ["diffFile", "index", "lineNumber", "side"] }
);
