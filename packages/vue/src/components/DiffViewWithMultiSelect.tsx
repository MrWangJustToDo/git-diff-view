import { createDiffMultiSelectManager, multiSelectClassNames, getMatchedMultiSelectLine } from "@git-diff-view/core";
import { DiffModeEnum } from "@git-diff-view/utils";
import { defineComponent, ref, watch, computed, onUnmounted, watchEffect } from "vue";

import { DiffView } from "./DiffView";

import type { DiffViewProps } from "./DiffView";
import type {
  DiffFile,
  MultiSelectResult,
  LineRange,
  MultiSelectState,
  DiffMultiSelectManager,
  MultiSelectOptions,
  extendDataToPreselectedLines,
  SplitSide,
} from "@git-diff-view/core";
import type { CSSProperties, SlotsType, VNode } from "vue";

type MultiResult = ReturnType<typeof extendDataToPreselectedLines>;

export type DiffViewWithMultiSelectProps<T> = Omit<DiffViewProps<T>, "onAddWidgetClick"> & {
  /**
   * Enable multi-select feature
   * @default true
   */
  enableMultiSelect?: boolean;

  /**
   * Callback when multi-line selection is complete
   */
  onMultiSelectComplete?: (result: MultiSelectResult) => void;

  /**
   * Callback when selection changes (during drag)
   */
  onMultiSelectChange?: (range: LineRange | null, state: MultiSelectState) => void;

  /**
   * Custom function to scope selection to one hunk
   */
  scopeMultiSelectToHunk?: (range: LineRange) => LineRange | null;
};

type multiSelectTypeSlots = SlotsType<{
  widget: { lineNumber: number; fromLineNumber: number; side: SplitSide; diffFile: DiffFile; onClose: () => void };
  extend: { lineNumber: number; side: SplitSide; data: any; diffFile: DiffFile; onUpdate: () => void };
}>;

export const DiffViewWithMultiSelect = defineComponent<
  DiffViewWithMultiSelectProps<any>,
  {
    onAddWidgetClick: (props: { lineNumber: number; fromLineNumber?: number; side: SplitSide }) => void;
    onMultiSelectComplete: (result: MultiSelectResult) => void;
    onMultiSelectChange: (range: LineRange | null, state: MultiSelectState) => void;
  },
  "onAddWidgetClick" | "onMultiSelectComplete" | "onMultiSelectChange",
  multiSelectTypeSlots
>(
  (props, options) => {
    const containerRef = ref<HTMLDivElement>();
    const diffViewRef = ref<{ getDiffFileInstance: () => DiffFile | null }>();
    const managerRef = ref<DiffMultiSelectManager | null>(null);
    let multiResultRef: MultiResult | undefined;

    const updateMultiResult = (result?: MultiResult) => {
      multiResultRef = result;
      managerRef.value?.setPreselectedLines(result || { old: [], new: [] });
    };

    const enableMultiSelect = computed(() => props.enableMultiSelect ?? true);
    const isUnifiedMode = computed(() => !((props.diffViewMode ?? DiffModeEnum.SplitGitHub) & DiffModeEnum.Split));

    const getDiffFile = () => {
      return diffViewRef.value?.getDiffFileInstance() ?? null;
    };

    const initManager = (onClean: (cb: () => void) => void) => {
      const container = containerRef.value;
      const diffFile = getDiffFile();

      if (!container || !diffFile || !enableMultiSelect.value) {
        managerRef.value?.destroy();
        managerRef.value = null;
        return;
      }

      const managerOptions: MultiSelectOptions = {
        enabled: enableMultiSelect.value,
        isUnifiedMode: isUnifiedMode.value,
        selectedClassName: multiSelectClassNames.selected,
        onSelectionChange: (range, state) => {
          if (state.isSelecting) {
            containerRef.value?.classList.add(multiSelectClassNames.selecting);
          } else {
            containerRef.value?.classList.remove(multiSelectClassNames.selecting);
          }
          if (state.isSelecting && multiResultRef) {
            updateMultiResult(undefined);
          }
          options.emit("onMultiSelectChange", range, state);
        },
        onSelectionComplete: (result) => {
          containerRef.value?.classList.remove(multiSelectClassNames.selecting);
          if (result && result.lines.length > 0) {
            options.emit("onMultiSelectComplete", result);
            const finalResult = {
              [result.range.side as "old" | "new"]: [result.range.startLineNumber, result.range.endLineNumber],
            } as MultiResult;
            updateMultiResult(finalResult);
          } else {
            updateMultiResult(undefined);
          }
        },
        scopeToHunk: props.scopeMultiSelectToHunk,
      };

      if (managerRef.value) {
        managerRef.value.updateContainer(container);
        managerRef.value.updateDiffFile(diffFile);
        managerRef.value.updateOptions(managerOptions);
      } else {
        managerRef.value = createDiffMultiSelectManager(container, diffFile, managerOptions);
      }

      onClean(() => {
        managerRef.value?.destroy();
        managerRef.value = null;
      });
    };

    watch(
      () => [props.diffViewWrap, props.diffViewMode],
      () => {
        updateMultiResult(undefined);
      }
    );

    watchEffect((onClean) => initManager(onClean));

    const getMatchedMultiResult = (lineNum: number, side: SplitSide, diffFile?: DiffFile | null) =>
      getMatchedMultiSelectLine({
        multiResult: multiResultRef,
        lineNumber: lineNum,
        side,
        isUnifiedMode: isUnifiedMode.value,
        diffFile: diffFile || getDiffFile(),
      });

    const handleAddWidgetClick = (lineNum: number, side: SplitSide) => {
      managerRef.value?.clearSelection();
      // the clicked line may belong to the selection of the other side (unified mode only)
      const matched = getMatchedMultiResult(lineNum, side);
      if (matched) {
        updateMultiResult({ [matched.sideKey]: matched.lineNumbers } as MultiResult);
        options.emit("onAddWidgetClick", {
          lineNumber: matched.max,
          fromLineNumber: Math.min(...matched.lineNumbers),
          side: matched.side,
        });
        return;
      }
      updateMultiResult(undefined);
      options.emit("onAddWidgetClick", { lineNumber: lineNum, fromLineNumber: lineNum, side });
    };

    const getSelectionResult = () => {
      return managerRef.value?.getSelectionResult() ?? null;
    };

    const getSelectionState = () => {
      return (
        managerRef.value?.getState() ?? {
          isSelecting: false,
          startInfo: null,
          currentRange: null,
        }
      );
    };

    const clearSelection = () => {
      managerRef.value?.clearSelection();
    };

    const setPreselectedLines = updateMultiResult;

    onUnmounted(() => {
      managerRef.value?.destroy();
      managerRef.value = null;
    });

    options.expose({
      getDiffFileInstance: getDiffFile,
      getSelectionResult,
      getSelectionState,
      clearSelection,
      setPreselectedLines,
    });

    return () => {
      const widgetSlot = options.slots.widget;

      const internalWidgetSlot = widgetSlot
        ? ({
            lineNumber,
            side,
            diffFile,
            onClose,
          }: {
            lineNumber: number;
            side: SplitSide;
            diffFile: DiffFile;
            onClose: () => void;
          }): VNode[] => {
            const matched = getMatchedMultiResult(lineNumber, side, diffFile);

            const fromLineNumber = matched ? Math.min(...matched.lineNumbers) : lineNumber;
            const toLineNumber = matched ? matched.max : lineNumber;

            return widgetSlot({
              lineNumber: toLineNumber,
              fromLineNumber,
              side: matched?.side ?? side,
              diffFile,
              onClose,
            });
          }
        : undefined;

      return (
        <div ref={containerRef} class="diff-multiselect-wrapper">
          <DiffView
            ref={diffViewRef}
            data={props.data}
            diffFile={props.diffFile}
            class={props.class}
            style={props.style as CSSProperties}
            registerHighlighter={props.registerHighlighter}
            diffViewMode={props.diffViewMode}
            diffViewWrap={props.diffViewWrap}
            diffViewTheme={props.diffViewTheme}
            diffViewFontSize={props.diffViewFontSize}
            diffViewHighlight={props.diffViewHighlight}
            diffViewAddWidget={props.diffViewAddWidget}
            initialWidgetState={props.initialWidgetState}
            extendData={props.extendData}
            onOnAddWidgetClick={handleAddWidgetClick}
            v-slots={{
              widget: internalWidgetSlot,
              extend: options.slots.extend,
            }}
          />
        </div>
      );
    };
  },
  {
    name: "DiffViewWithMultiSelect",
    props: [
      "data",
      "class",
      "diffFile",
      "diffViewAddWidget",
      "diffViewFontSize",
      "diffViewHighlight",
      "diffViewMode",
      "diffViewWrap",
      "diffViewTheme",
      "extendData",
      "registerHighlighter",
      "initialWidgetState",
      "style",
      "enableMultiSelect",
      "scopeMultiSelectToHunk",
    ],
    slots: Object as multiSelectTypeSlots,
  }
);
