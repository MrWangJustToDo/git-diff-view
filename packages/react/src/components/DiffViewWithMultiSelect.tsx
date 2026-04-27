import { useCallback, useEffect, useMemo, useRef, useImperativeHandle, useState, forwardRef } from "react";

import { multiSelectClassNames, createDiffMultiSelectManager } from "..";
import { useCallbackRef } from "../hooks/useCallbackRef";

import { DiffModeEnum, DiffView, SplitSide } from "./DiffView";

import type {
  MultiSelectResult,
  LineRange,
  MultiSelectState,
  DiffFile,
  DiffMultiSelectManager,
  MultiSelectOptions,
  extendDataToPreselectedLines,
} from "..";
import type { DiffViewProps } from "./DiffView";
import type { ForwardedRef, ReactNode } from "react";

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

export interface DiffViewWithMultiSelectProps<T = unknown> extends Omit<
  DiffViewProps<T>,
  "extendData" | "renderExtendLine" | "onAddWidgetClick"
> {
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
   * Use this to open a comment dialog or handle the selection
   */
  onMultiSelectComplete?: (result: MultiSelectResult) => void;

  /**
   * Callback when selection changes (during drag)
   */
  onMultiSelectChange?: (range: LineRange | null, state: MultiSelectState) => void;

  /**
   * Custom function to scope selection to one hunk
   * Return the scoped range or null to cancel selection
   */
  scopeMultiSelectToHunk?: (range: LineRange) => LineRange | null;

  onAddWidgetClick?: (props: { lineNumber: number; fromLineNumber?: number; side: SplitSide }) => void;

  /**
   * Render function for extended lines (comments)
   * Similar to DiffView's renderExtendLine but with fromLine info
   */
  renderExtendLine?: (props: {
    lineNumber: number;
    fromLineNumber: number;
    side: SplitSide;
    data: T;
    diffFile: DiffFile;
    onUpdate: () => void;
  }) => ReactNode;
}

export interface DiffViewWithMultiSelectRef {
  getDiffFileInstance: () => DiffFile | null;
  getSelectionResult: () => MultiSelectResult | null;
  getSelectionState: () => MultiSelectState;
  clearSelection: () => void;
  setPreselectedLines: (lines: { old: number[]; new: number[] }) => void;
}

/* eslint-disable @typescript-eslint/no-unnecessary-type-constraint */
const InternalDiffViewWithMultiSelect = <T extends unknown>(
  props: DiffViewWithMultiSelectProps<T>,
  ref: ForwardedRef<DiffViewWithMultiSelectRef>
) => {
  const {
    enableMultiSelect = true,
    extendData,
    onMultiSelectComplete,
    onMultiSelectChange,
    scopeMultiSelectToHunk,
    renderExtendLine,
    onAddWidgetClick,
    diffViewMode = DiffModeEnum.SplitGitHub,
    ...restProps
  } = props;

  const memoSelectChange = useCallbackRef(onMultiSelectChange);

  const memoSelectComplete = useCallbackRef(onMultiSelectComplete);

  const memoScopeSelectToHunk = useCallbackRef(scopeMultiSelectToHunk);

  const containerRef = useRef<HTMLDivElement>(null);
  const diffViewRef = useRef<{ getDiffFileInstance: () => DiffFile | null }>(null);
  const managerRef = useRef<DiffMultiSelectManager | null>(null);

  const [multiResult, setMultiResult] = useState<ReturnType<typeof extendDataToPreselectedLines>>();

  const isUnifiedMode = !(diffViewMode & DiffModeEnum.Split);

  const getDiffFile = useCallback(() => {
    return diffViewRef.current?.getDiffFileInstance() ?? null;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const diffFile = getDiffFile();

    if (!container || !diffFile || !enableMultiSelect) {
      managerRef.current?.destroy();
      managerRef.current = null;
      return;
    }

    const managerOptions: MultiSelectOptions = {
      enabled: enableMultiSelect,
      isUnifiedMode,
      selectedClassName: multiSelectClassNames.selected,
      onSelectionChange: (range, state) => {
        if (state.isSelecting) {
          containerRef.current?.classList.add(multiSelectClassNames.selecting);
        } else {
          containerRef.current?.classList.remove(multiSelectClassNames.selecting);
        }
        memoSelectChange?.(range, state);
      },
      onSelectionComplete: (result) => {
        containerRef.current?.classList.remove(multiSelectClassNames.selecting);
        if (result && result.lines.length > 0) {
          memoSelectComplete?.(result);
          const finalResult = {
            [result.range.side as "old" | "new"]: [result.range.startLineNumber, result.range.endLineNumber],
          } as typeof multiResult;
          setMultiResult(finalResult);
        } else {
          setMultiResult(undefined);
        }
      },
      scopeToHunk: memoScopeSelectToHunk,
    };

    if (managerRef.current) {
      managerRef.current.updateContainer(container);
      managerRef.current.updateDiffFile(diffFile);
      managerRef.current.updateOptions(managerOptions);
    } else {
      managerRef.current = createDiffMultiSelectManager(container, diffFile, managerOptions);
    }

    return () => {
      managerRef.current?.destroy();
      managerRef.current = null;
    };
  }, [enableMultiSelect, isUnifiedMode, memoScopeSelectToHunk, memoSelectChange, memoSelectComplete, getDiffFile]);

  useEffect(() => {
    if (managerRef.current) {
      if (multiResult) {
        managerRef.current.setPreselectedLines(multiResult);
      } else {
        managerRef.current.setPreselectedLines({ old: [], new: [] });
      }
    }
  }, [multiResult]);

  const convertedExtendData = useMemo(() => {
    if (!extendData) return undefined;

    const result: { oldFile?: Record<string, { data: T }>; newFile?: Record<string, { data: T }> } = {};

    if (extendData.oldFile) {
      result.oldFile = {};
      for (const [key, value] of Object.entries(extendData.oldFile)) {
        result.oldFile[key] = { data: value.data };
      }
    }

    if (extendData.newFile) {
      result.newFile = {};
      for (const [key, value] of Object.entries(extendData.newFile)) {
        result.newFile[key] = { data: value.data };
      }
    }

    return result;
  }, [extendData]);

  const internalRenderExtendLine = useCallback(
    ({
      lineNumber,
      side,
      data,
      diffFile,
      onUpdate,
    }: {
      lineNumber: number;
      side: SplitSide;
      data: T;
      diffFile: DiffFile;
      onUpdate: () => void;
    }) => {
      if (!renderExtendLine) return null;

      const sideKey = side === SplitSide.old ? "oldFile" : "newFile";
      const extendItem = extendData?.[sideKey]?.[lineNumber];
      const fromLineNumber = extendItem?.fromLine ?? lineNumber;

      return renderExtendLine({
        lineNumber,
        fromLineNumber,
        side,
        data,
        diffFile,
        onUpdate,
      });
    },
    [renderExtendLine, extendData]
  );

  const getSelectionResult = useCallback(() => {
    return managerRef.current?.getSelectionResult() ?? null;
  }, []);

  const getSelectionState = useCallback(() => {
    return (
      managerRef.current?.getState() ?? {
        isSelecting: false,
        startInfo: null,
        currentRange: null,
      }
    );
  }, []);

  const clearSelection = useCallback(() => {
    managerRef.current?.clearSelection();
  }, []);

  const setPreselectedLines = useCallback((lines: { old: number[]; new: number[] }) => {
    setMultiResult(lines);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      getDiffFileInstance: getDiffFile,
      getSelectionResult,
      getSelectionState,
      clearSelection,
      setPreselectedLines,
    }),
    [getDiffFile, getSelectionResult, getSelectionState, clearSelection, setPreselectedLines]
  );

  return (
    <div ref={containerRef} className="diff-multiselect-wrapper">
      <DiffView
        ref={diffViewRef}
        {...restProps}
        diffViewMode={diffViewMode}
        extendData={convertedExtendData}
        onAddWidgetClick={(lineNum: number, side: SplitSide) => {
          managerRef.current?.clearSelection();
          if (multiResult) {
            const currentSide = SplitSide[side] as unknown as "new" | "old";
            const currentMultiResult = multiResult[currentSide] as number[];
            if (currentMultiResult?.length) {
              const max = Math.max(...currentMultiResult);
              if (max === lineNum) {
                const finalResult = { [currentSide]: currentMultiResult };
                setMultiResult(finalResult as typeof multiResult);
                onAddWidgetClick?.({ lineNumber: max, fromLineNumber: Math.min(...currentMultiResult), side });
                return;
              }
            }
            setMultiResult({ old: [], new: [] });
            onAddWidgetClick?.({ lineNumber: lineNum, fromLineNumber: lineNum, side });
          } else {
            onAddWidgetClick?.({ lineNumber: lineNum, fromLineNumber: lineNum, side });
          }
        }}
        renderExtendLine={renderExtendLine ? internalRenderExtendLine : undefined}
      />
    </div>
  );
};

// type helper function
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ReactDiffView<T>(
  _props: DiffViewWithMultiSelectProps<T> & { ref?: ForwardedRef<DiffViewWithMultiSelectRef> }
) {
  return <></>;
}

export const DiffViewWithMultiSelect = forwardRef(InternalDiffViewWithMultiSelect) as typeof ReactDiffView;
