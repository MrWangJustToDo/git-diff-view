/* eslint-disable @typescript-eslint/no-unnecessary-type-constraint */
import { SplitSide, createDiffMultiSelectManager, multiSelectClassNames } from "@git-diff-view/core";
import { DiffModeEnum } from "@git-diff-view/utils";
import { type JSXElement, type JSX, createSignal, createEffect, onCleanup, on } from "solid-js";

import { DiffView } from "./DiffView";

import type {
  DiffFile,
  MultiSelectResult,
  LineRange,
  MultiSelectState,
  DiffMultiSelectManager,
  MultiSelectOptions,
  DiffHighlighter,
  DiffHighlighterLang,
  extendDataToPreselectedLines,
} from "@git-diff-view/core";

type MultiResult = ReturnType<typeof extendDataToPreselectedLines>;

export type DiffViewWithMultiSelectProps<T> = {
  data?: {
    oldFile?: { fileName?: string | null; fileLang?: DiffHighlighterLang | string | null; content?: string | null };
    newFile?: { fileName?: string | null; fileLang?: DiffHighlighterLang | string | null; content?: string | null };
    hunks: string[];
  };
  extendData?: { oldFile?: Record<string, { data: T }>; newFile?: Record<string, { data: T }> };
  initialWidgetState?: { side: SplitSide; lineNumber: number };
  diffFile?: DiffFile;
  class?: string;
  style?: JSX.CSSProperties;
  registerHighlighter?: Omit<DiffHighlighter, "getHighlighterEngine">;
  diffViewMode?: DiffModeEnum;
  diffViewWrap?: boolean;
  diffViewTheme?: "light" | "dark";
  diffViewFontSize?: number;
  diffViewHighlight?: boolean;
  diffViewAddWidget?: boolean;
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
  onAddWidgetClick?: (props: { lineNumber: number; fromLineNumber?: number; side: SplitSide }) => void;
  renderWidgetLine?: ({
    diffFile,
    side,
    lineNumber,
    fromLineNumber,
    onClose,
  }: {
    lineNumber: number;
    fromLineNumber: number;
    side: SplitSide;
    diffFile: DiffFile;
    onClose: () => void;
  }) => JSXElement;
  renderExtendLine?: ({
    diffFile,
    side,
    data,
    lineNumber,
    onUpdate,
  }: {
    lineNumber: number;
    side: SplitSide;
    data: T;
    diffFile: DiffFile;
    onUpdate: () => void;
  }) => JSXElement;
  onInstanceCreated?: (instance: DiffViewWithMultiSelectRef) => void;
};

export interface DiffViewWithMultiSelectRef {
  getDiffFileInstance: () => DiffFile | null;
  getSelectionResult: () => MultiSelectResult | null;
  getSelectionState: () => MultiSelectState;
  clearSelection: () => void;
  setPreselectedLines: (lines: { old: number[]; new: number[] }) => void;
}

const InternalDiffViewWithMultiSelect = <T extends unknown>(props: DiffViewWithMultiSelectProps<T>) => {
  const [containerRef, setContainerRef] = createSignal<HTMLDivElement | null>(null);
  const [innerDiffFile, setInnerDiffFile] = createSignal<DiffFile | null>(null);
  let managerRef: DiffMultiSelectManager | null = null;
  let multiResultRef: MultiResult | undefined;

  const updateMultiResult = (result?: MultiResult) => {
    multiResultRef = result;
    managerRef?.setPreselectedLines(result || { old: [], new: [] });
  };

  const enableMultiSelect = () => props.enableMultiSelect ?? true;
  const isUnifiedMode = () => !((props.diffViewMode ?? DiffModeEnum.SplitGitHub) & DiffModeEnum.Split);

  createEffect(
    on(
      () => [props.diffViewWrap, props.diffViewMode],
      () => {
        updateMultiResult(undefined);
      },
      { defer: true }
    )
  );

  createEffect(() => {
    const container = containerRef();
    const diffFile = innerDiffFile();
    const enabled = enableMultiSelect();
    const unified = isUnifiedMode();

    if (!container || !diffFile || !enabled) {
      managerRef?.destroy();
      managerRef = null;
      return;
    }

    const managerOptions: MultiSelectOptions = {
      enabled: enabled,
      isUnifiedMode: unified,
      selectedClassName: multiSelectClassNames.selected,
      onSelectionChange: (range, state) => {
        if (state.isSelecting) {
          containerRef()?.classList.add(multiSelectClassNames.selecting);
        } else {
          containerRef()?.classList.remove(multiSelectClassNames.selecting);
        }
        props.onMultiSelectChange?.(range, state);
      },
      onSelectionComplete: (result) => {
        containerRef()?.classList.remove(multiSelectClassNames.selecting);
        if (result && result.lines.length > 0) {
          props.onMultiSelectComplete?.(result);
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

    if (managerRef) {
      managerRef.updateContainer(container);
      managerRef.updateDiffFile(diffFile);
      managerRef.updateOptions(managerOptions);
    } else {
      managerRef = createDiffMultiSelectManager(container, diffFile, managerOptions);
    }

    onCleanup(() => {
      managerRef?.destroy();
      managerRef = null;
    });
  });

  const handleAddWidgetClick = (lineNum: number, side: SplitSide) => {
    managerRef?.clearSelection();
    const multiResult = multiResultRef;
    if (multiResult) {
      const currentSide = SplitSide[side] as unknown as "new" | "old";
      const otherSide = currentSide === "new" ? "old" : "new";
      const sideResult = multiResult[currentSide] as number[];
      const otherSideResult = multiResult[otherSide] as number[];
      if (sideResult?.length) {
        const max = Math.max(...sideResult);
        if (max === lineNum) {
          const finalResult = { [currentSide]: sideResult };
          updateMultiResult(finalResult as MultiResult);
          props.onAddWidgetClick?.({
            lineNumber: max,
            fromLineNumber: Math.min(...sideResult),
            side,
          });
          return;
        }
      }
      if (isUnifiedMode() && otherSideResult?.length) {
        const max = Math.max(...otherSideResult);
        const diffFile = innerDiffFile();
        const index = diffFile?.getUnifiedLineIndexByLineNumber(lineNum, side) ?? -1;
        const unifiedItem = diffFile?.getUnifiedLine(index);
        const otherSideLineNum = side === SplitSide.old ? unifiedItem?.newLineNumber : unifiedItem?.oldLineNumber;
        if (max === otherSideLineNum) {
          const finalResult = { [otherSide]: otherSideResult };
          updateMultiResult(finalResult as MultiResult);
          props.onAddWidgetClick?.({
            lineNumber: max,
            fromLineNumber: Math.min(...otherSideResult),
            side: otherSide === "old" ? SplitSide.old : SplitSide.new,
          });
          return;
        }
      }
      updateMultiResult(undefined);
      props.onAddWidgetClick?.({ lineNumber: lineNum, fromLineNumber: lineNum, side });
    } else {
      updateMultiResult(undefined);
      props.onAddWidgetClick?.({ lineNumber: lineNum, fromLineNumber: lineNum, side });
    }
  };

  const getSelectionResult = () => {
    return managerRef?.getSelectionResult() ?? null;
  };

  const getSelectionState = () => {
    return (
      managerRef?.getState() ?? {
        isSelecting: false,
        startInfo: null,
        currentRange: null,
      }
    );
  };

  const clearSelection = () => {
    managerRef?.clearSelection();
  };

  const setPreselectedLines = updateMultiResult;

  createEffect(() => {
    props.onInstanceCreated?.({
      getDiffFileInstance: () => innerDiffFile(),
      getSelectionResult,
      getSelectionState,
      clearSelection,
      setPreselectedLines,
    });
  });

  const getInternalRenderWidgetLine = () => {
    const renderWidgetLine = props.renderWidgetLine;
    if (!renderWidgetLine) return undefined;

    return ({
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
      const sideKey = side === SplitSide.old ? "old" : "new";
      const multiResultItem = multiResultRef?.[sideKey] as number[];
      const fromLineNumber = multiResultItem ? Math.min(...multiResultItem) : lineNumber;
      const toLineNumber = multiResultItem ? Math.max(...multiResultItem) : lineNumber;

      return renderWidgetLine({
        lineNumber: toLineNumber,
        fromLineNumber,
        side,
        diffFile,
        onClose,
      });
    };
  };

  return (
    <div ref={setContainerRef} class="diff-multiselect-wrapper">
      <DiffView
        data={props.data}
        diffFile={props.diffFile}
        class={props.class}
        style={props.style}
        registerHighlighter={props.registerHighlighter}
        diffViewMode={props.diffViewMode}
        diffViewWrap={props.diffViewWrap}
        diffViewTheme={props.diffViewTheme}
        diffViewFontSize={props.diffViewFontSize}
        diffViewHighlight={props.diffViewHighlight}
        diffViewAddWidget={props.diffViewAddWidget}
        initialWidgetState={props.initialWidgetState}
        extendData={props.extendData}
        onAddWidgetClick={handleAddWidgetClick}
        onDiffFileCreated={setInnerDiffFile}
        renderWidgetLine={getInternalRenderWidgetLine()}
        renderExtendLine={props.renderExtendLine}
      />
    </div>
  );
};

function SolidDiffViewWithMultiSelect<T>(props: DiffViewWithMultiSelectProps<T>): JSXElement {
  return <InternalDiffViewWithMultiSelect {...props} />;
}

export const DiffViewWithMultiSelect = SolidDiffViewWithMultiSelect;
