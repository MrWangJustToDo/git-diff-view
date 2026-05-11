import { SplitSide, createDiffMultiSelectManager, multiSelectClassNames } from "@git-diff-view/core";
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
} from "@git-diff-view/core";
import type { CSSProperties, SlotsType, VNode } from "vue";

type MultiResult = ReturnType<typeof extendDataToPreselectedLines>;

/**
 * Extended data item with fromLine support for multi-line comments
 */
export interface MultiSelectExtendDataItem<T = unknown> {
  data: T;
  /**
   * Starting line number for multi-line selection
   * If not provided, defaults to the key (end line number)
   */
  fromLine?: number;
}

/**
 * Extended data format for multi-select diff view
 */
export type MultiSelectExtendData<T = unknown> = {
  oldFile?: Record<string, MultiSelectExtendDataItem<T>>;
  newFile?: Record<string, MultiSelectExtendDataItem<T>>;
};

export type DiffViewWithMultiSelectProps<T> = Omit<DiffViewProps<T>, "extendData"> & {
  /**
   * Enable multi-select feature
   * @default true
   */
  enableMultiSelect?: boolean;

  /**
   * Extended data with fromLine support for multi-line comments
   */
  extendData?: MultiSelectExtendData<T>;

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
  extend: {
    lineNumber: number;
    fromLineNumber: number;
    side: SplitSide;
    data: any;
    diffFile: DiffFile;
    onUpdate: () => void;
  };
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
    const isUnifiedMode = computed(() => !(props.diffViewMode ?? DiffModeEnum.SplitGitHub & DiffModeEnum.Split));

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

    const convertedExtendData = computed(() => {
      if (!props.extendData) return undefined;

      const result: { oldFile?: Record<string, { data: any }>; newFile?: Record<string, { data: any }> } = {};

      if (props.extendData.oldFile) {
        result.oldFile = {};
        for (const [key, value] of Object.entries(props.extendData.oldFile)) {
          result.oldFile[key] = { data: value.data };
        }
      }

      if (props.extendData.newFile) {
        result.newFile = {};
        for (const [key, value] of Object.entries(props.extendData.newFile)) {
          result.newFile[key] = { data: value.data };
        }
      }

      return result;
    });

    const handleAddWidgetClick = (lineNum: number, side: SplitSide) => {
      managerRef.value?.clearSelection();
      const multiResult = multiResultRef;
      if (multiResult) {
        const currentSide = SplitSide[side] as unknown as "new" | "old";
        const currentMultiResult = multiResult[currentSide] as number[];
        const otherSide = currentSide === "new" ? "old" : "new";
        const otherMultiResult = multiResult[otherSide] as number[];
        if (currentMultiResult?.length) {
          const max = Math.max(...currentMultiResult);
          if (max === lineNum) {
            const finalResult = { [currentSide]: currentMultiResult };
            updateMultiResult(finalResult as MultiResult);
            options.emit("onAddWidgetClick", {
              lineNumber: max,
              fromLineNumber: Math.min(...currentMultiResult),
              side,
            });
            return;
          }
        }
        if (isUnifiedMode.value && otherMultiResult?.length) {
          const max = Math.max(...otherMultiResult);
          const diffFile = getDiffFile();
          const index = diffFile?.getUnifiedLineIndexByLineNumber(lineNum, side) ?? -1;
          const unifiedItem = diffFile?.getUnifiedLine(index);
          const otherSideLineNum = side === SplitSide.old ? unifiedItem?.newLineNumber : unifiedItem?.oldLineNumber;
          if (max === otherSideLineNum) {
            const finalResult = { [otherSide]: otherMultiResult };
            updateMultiResult(finalResult as MultiResult);
            options.emit("onAddWidgetClick", {
              lineNumber: max,
              fromLineNumber: Math.min(...otherMultiResult),
              side: otherSide === "old" ? SplitSide.old : SplitSide.new,
            });
            return;
          }
        }
        updateMultiResult(undefined);
        options.emit("onAddWidgetClick", { lineNumber: lineNum, fromLineNumber: lineNum, side });
      } else {
        updateMultiResult(undefined);
        options.emit("onAddWidgetClick", { lineNumber: lineNum, fromLineNumber: lineNum, side });
      }
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
      const extendSlot = options.slots.extend;

      const internalExtendSlot = extendSlot
        ? ({
            lineNumber,
            side,
            data,
            diffFile,
            onUpdate,
          }: {
            lineNumber: number;
            side: SplitSide;
            data: any;
            diffFile: DiffFile;
            onUpdate: () => void;
          }): VNode[] => {
            const sideKey = side === SplitSide.old ? "oldFile" : "newFile";
            const extendItem = props.extendData?.[sideKey]?.[lineNumber];
            const fromLineNumber = extendItem?.fromLine ?? lineNumber;

            return extendSlot({
              lineNumber,
              fromLineNumber,
              side,
              data,
              diffFile,
              onUpdate,
            });
          }
        : undefined;

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
            const sideKey = side === SplitSide.old ? "old" : "new";
            const multiResultItem = multiResultRef?.[sideKey] as number[];
            const fromLineNumber = multiResultItem ? Math.min(...multiResultItem) : lineNumber;
            const toLineNumber = multiResultItem ? Math.max(...multiResultItem) : lineNumber;

            return widgetSlot({
              lineNumber: toLineNumber,
              fromLineNumber,
              side,
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
            extendData={convertedExtendData.value}
            onOnAddWidgetClick={handleAddWidgetClick}
            v-slots={{
              widget: internalWidgetSlot,
              extend: internalExtendSlot,
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
