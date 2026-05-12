import { useCallback, useEffect, useMemo, useRef, useImperativeHandle, forwardRef } from "react";

import { multiSelectClassNames, createDiffMultiSelectManager } from "..";
import { useCallbackRef } from "../hooks/useCallbackRef";
import { useUpdateEffect } from "../hooks/useUpdateEffect";

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

export interface DiffViewWithMultiSelectProps<T = unknown> extends Omit<
  DiffViewProps<T>,
  "renderWidgetLine" | "onAddWidgetClick"
> {
  /**
   * Enable multi-select feature
   * @default true
   */
  enableMultiSelect?: boolean;

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

  renderWidgetLine?: (props: {
    lineNumber: number;
    fromLineNumber: number;
    side: SplitSide;
    diffFile: DiffFile;
    onClose: () => void;
  }) => ReactNode;
}

export interface DiffViewWithMultiSelectRef {
  getDiffFileInstance: () => DiffFile | null;
  getSelectionResult: () => MultiSelectResult | null;
  getSelectionState: () => MultiSelectState;
  clearSelection: () => void;
  setPreselectedLines: (lines: { old: number[]; new: number[] }) => void;
}

type MultiResult = ReturnType<typeof extendDataToPreselectedLines>;

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
    renderWidgetLine,
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

  const multiResultRef = useRef<MultiResult>(undefined);

  const isUnifiedMode = !(diffViewMode & DiffModeEnum.Split);

  const updateMultiResult = useCallback((result?: MultiResult) => {
    multiResultRef.current = result;
    managerRef.current?.setPreselectedLines(result || { old: [], new: [] });
  }, []);

  useUpdateEffect(() => {
    updateMultiResult(undefined);
  }, [props.diffViewWrap, diffViewMode]);

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
          } as MultiResult;
          updateMultiResult(finalResult);
        } else {
          updateMultiResult(undefined);
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
  }, [
    enableMultiSelect,
    isUnifiedMode,
    memoScopeSelectToHunk,
    memoSelectChange,
    memoSelectComplete,
    getDiffFile,
    updateMultiResult,
  ]);

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

  const internalRenderWidgetLine = useCallback(
    ({
      lineNumber,
      side,
      diffFile,
      onClose,
    }: {
      lineNumber: number;
      side: SplitSide;
      diffFile: DiffFile;
      onClose: () => void;
    }) => {
      if (!renderWidgetLine) return null;

      const sideKey = side === SplitSide.old ? "old" : "new";
      const multiResultItem = multiResultRef.current?.[sideKey] as number[];
      const fromLineNumber = multiResultItem ? Math.min(...multiResultItem) : lineNumber;
      const toLineNumber = multiResultItem ? Math.max(...multiResultItem) : lineNumber;

      return renderWidgetLine({
        lineNumber: toLineNumber,
        fromLineNumber,
        side,
        diffFile,
        onClose,
      });
    },
    [renderWidgetLine]
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

  const setPreselectedLines = updateMultiResult;

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
          const multiResult = multiResultRef.current;
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
                onAddWidgetClick?.({ lineNumber: max, fromLineNumber: Math.min(...currentMultiResult), side });
                return;
              }
            }
            if (isUnifiedMode && otherMultiResult?.length) {
              const max = Math.max(...otherMultiResult);
              const diffFile = getDiffFile();
              const index = diffFile.getUnifiedLineIndexByLineNumber(lineNum, side);
              const unifiedItem = diffFile.getUnifiedLine(index);
              const otherSideLineNum = side === SplitSide.old ? unifiedItem.newLineNumber : unifiedItem.oldLineNumber;
              if (max === otherSideLineNum) {
                const finalResult = { [otherSide]: otherMultiResult };
                updateMultiResult(finalResult as MultiResult);
                onAddWidgetClick?.({
                  lineNumber: max,
                  fromLineNumber: Math.min(...otherMultiResult),
                  side: otherSide === "old" ? SplitSide.old : SplitSide.new,
                });
                return;
              }
            }
            updateMultiResult(undefined);
            onAddWidgetClick?.({ lineNumber: lineNum, fromLineNumber: lineNum, side });
          } else {
            updateMultiResult(undefined);
            onAddWidgetClick?.({ lineNumber: lineNum, fromLineNumber: lineNum, side });
          }
        }}
        renderWidgetLine={renderWidgetLine ? internalRenderWidgetLine : undefined}
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
