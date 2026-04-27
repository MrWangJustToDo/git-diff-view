import { createDiffMultiSelectManager, multiSelectClassNames } from "@git-diff-view/core";
import { useCallback, useEffect, useRef } from "react";

import type {
  DiffFile,
  DiffMultiSelectManager,
  LineRange,
  MultiSelectOptions,
  MultiSelectResult,
  MultiSelectState,
} from "@git-diff-view/core";

export interface UseMultiSelectOptions {
  /**
   * Enable multi-select feature
   * @default true
   */
  enabled?: boolean;
  /**
   * Whether it's unified mode
   * @default false
   */
  isUnifiedMode?: boolean;
  /**
   * Callback when selection changes (for visual updates)
   */
  onSelectionChange?: (range: LineRange | null, state: MultiSelectState) => void;
  /**
   * Callback when selection is complete (mouseup)
   * Provides the selected range and line data from DiffFile
   */
  onSelectionComplete?: (result: MultiSelectResult | null) => void;
  /**
   * Custom function to scope selection to one hunk
   */
  scopeToHunk?: (range: LineRange) => LineRange | null;
  /**
   * CSS class to add to selected cells
   * @default "diff-multi-select-active"
   */
  selectedClassName?: string;
  /**
   * Preselected lines from existing comments/annotations
   */
  preselectedLines?: { old: number[]; new: number[] };
}

/**
 * React hook for multi-line selection in diff views
 *
 * @example
 * ```tsx
 * import { DiffView } from "@git-diff-view/react";
 * import { useMultiSelect } from "@git-diff-view/react";
 *
 * function MyDiffView({ diffFile }) {
 *   const containerRef = useRef<HTMLDivElement>(null);
 *
 *   const { getSelectionResult, clearSelection } = useMultiSelect(
 *     containerRef,
 *     diffFile,
 *     {
 *       enabled: true,
 *       onSelectionComplete: (result) => {
 *         if (result) {
 *           console.log("Selected lines:", result.range);
 *           // Open comment dialog with result.range
 *         }
 *       },
 *     }
 *   );
 *
 *   return (
 *     <div ref={containerRef}>
 *       <DiffView diffFile={diffFile} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useMultiSelect(
  containerRef: React.RefObject<HTMLElement | null>,
  diffFile: DiffFile | null,
  options: UseMultiSelectOptions = {}
) {
  const managerRef = useRef<DiffMultiSelectManager | null>(null);
  const optionsRef = useRef(options);
  // eslint-disable-next-line react-hooks/refs
  optionsRef.current = options;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !diffFile) {
      managerRef.current?.destroy();
      managerRef.current = null;
      return;
    }

    const managerOptions: MultiSelectOptions = {
      enabled: optionsRef.current.enabled ?? true,
      isUnifiedMode: optionsRef.current.isUnifiedMode ?? false,
      selectedClassName: optionsRef.current.selectedClassName ?? multiSelectClassNames.selected,
      onSelectionChange: (range, state) => {
        if (state.isSelecting) {
          containerRef.current?.classList.add(multiSelectClassNames.selecting);
        } else {
          containerRef.current?.classList.remove(multiSelectClassNames.selecting);
        }
        optionsRef.current.onSelectionChange?.(range, state);
      },
      onSelectionComplete: (result) => {
        containerRef.current?.classList.remove(multiSelectClassNames.selecting);
        optionsRef.current.onSelectionComplete?.(result);
      },
      scopeToHunk: optionsRef.current.scopeToHunk,
    };

    if (managerRef.current) {
      managerRef.current.updateContainer(container);
      managerRef.current.updateDiffFile(diffFile);
      managerRef.current.updateOptions(managerOptions);
    } else {
      managerRef.current = createDiffMultiSelectManager(container, diffFile, managerOptions);
    }

    if (optionsRef.current.preselectedLines) {
      managerRef.current.setPreselectedLines(optionsRef.current.preselectedLines);
    }

    return () => {
      managerRef.current?.destroy();
      managerRef.current = null;
    };
  }, [containerRef, diffFile]);

  useEffect(() => {
    if (managerRef.current && options.preselectedLines) {
      managerRef.current.setPreselectedLines(options.preselectedLines);
    }
  }, [options.preselectedLines]);

  useEffect(() => {
    if (managerRef.current) {
      managerRef.current.updateOptions({
        enabled: options.enabled,
        isUnifiedMode: options.isUnifiedMode,
        selectedClassName: options.selectedClassName,
        scopeToHunk: options.scopeToHunk,
      });
    }
  }, [options.enabled, options.isUnifiedMode, options.selectedClassName, options.scopeToHunk]);

  const getSelectionResult = useCallback(() => {
    return managerRef.current?.getSelectionResult() ?? null;
  }, []);

  const getState = useCallback(() => {
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
    managerRef.current?.setPreselectedLines(lines);
  }, []);

  return {
    getSelectionResult,
    getState,
    clearSelection,
    setPreselectedLines,
  };
}
