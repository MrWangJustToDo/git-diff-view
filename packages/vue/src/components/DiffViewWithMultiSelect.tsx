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
  widget: { lineNumber: number; side: SplitSide; diffFile: DiffFile; onClose: () => void };
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
    const multiResult = ref<ReturnType<typeof extendDataToPreselectedLines>>();

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
            } as typeof multiResult.value;
            multiResult.value = finalResult;
          } else {
            multiResult.value = undefined;
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

    watchEffect((onClean) => initManager(onClean));

    watch(
      () => multiResult.value,
      () => {
        if (managerRef.value) {
          if (multiResult.value) {
            managerRef.value.setPreselectedLines(multiResult.value);
          } else {
            managerRef.value.setPreselectedLines({ old: [], new: [] });
          }
        }
      }
    );

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
      if (multiResult.value) {
        const currentSide = SplitSide[side] as unknown as "new" | "old";
        const currentMultiResult = multiResult.value[currentSide] as number[];
        if (currentMultiResult?.length) {
          const max = Math.max(...currentMultiResult);
          if (max === lineNum) {
            const finalResult = { [currentSide]: currentMultiResult };
            multiResult.value = finalResult as typeof multiResult.value;
            options.emit("onAddWidgetClick", {
              lineNumber: max,
              fromLineNumber: Math.min(...currentMultiResult),
              side,
            });
            return;
          }
        }
        multiResult.value = { old: [], new: [] };
        options.emit("onAddWidgetClick", { lineNumber: lineNum, fromLineNumber: lineNum, side });
      } else {
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

    const setPreselectedLines = (lines: { old: number[]; new: number[] }) => {
      multiResult.value = lines;
    };

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
              widget: options.slots.widget,
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
