/* eslint-disable @typescript-eslint/no-unnecessary-type-constraint */
import { SplitSide, createDiffMultiSelectManager, multiSelectClassNames } from "@git-diff-view/core";
import { DiffModeEnum } from "@git-diff-view/utils";
import { type JSXElement, type JSX, createSignal, createEffect, createMemo, onCleanup } from "solid-js";

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

export type DiffViewWithMultiSelectProps<T> = {
  data?: {
    oldFile?: { fileName?: string | null; fileLang?: DiffHighlighterLang | string | null; content?: string | null };
    newFile?: { fileName?: string | null; fileLang?: DiffHighlighterLang | string | null; content?: string | null };
    hunks: string[];
  };
  /**
   * Extended data with fromLine support for multi-line comments
   */
  extendData?: MultiSelectExtendData<T>;
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
    onClose,
  }: {
    lineNumber: number;
    side: SplitSide;
    diffFile: DiffFile;
    onClose: () => void;
  }) => JSXElement;
  renderExtendLine?: ({
    diffFile,
    side,
    data,
    lineNumber,
    fromLineNumber,
    onUpdate,
  }: {
    lineNumber: number;
    fromLineNumber: number;
    side: SplitSide;
    data: T;
    diffFile: DiffFile;
    onUpdate: () => void;
  }) => JSXElement;
  ref?: (ref: DiffViewWithMultiSelectRef) => void;
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

  const [multiResult, setMultiResult] = createSignal<ReturnType<typeof extendDataToPreselectedLines>>();

  const enableMultiSelect = () => props.enableMultiSelect ?? true;
  const isUnifiedMode = () => !((props.diffViewMode ?? DiffModeEnum.SplitGitHub) & DiffModeEnum.Split);

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
          } as ReturnType<typeof extendDataToPreselectedLines>;
          setMultiResult(finalResult);
        } else {
          setMultiResult(undefined);
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

  createEffect(() => {
    const result = multiResult();
    if (managerRef) {
      if (result) {
        managerRef.setPreselectedLines(result);
      } else {
        managerRef.setPreselectedLines({ old: [], new: [] });
      }
    }
  });

  const convertedExtendData = createMemo(() => {
    const extendData = props.extendData;
    if (!extendData) return undefined;

    const result: {
      oldFile?: Record<string, { data: T } | undefined>;
      newFile?: Record<string, { data: T } | undefined>;
    } = {};

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
  });

  const handleAddWidgetClick = (lineNum: number, side: SplitSide) => {
    managerRef?.clearSelection();
    const currentMultiResult = multiResult();
    if (currentMultiResult) {
      const currentSide = SplitSide[side] as unknown as "new" | "old";
      const sideResult = currentMultiResult[currentSide] as number[];
      if (sideResult?.length) {
        const max = Math.max(...sideResult);
        if (max === lineNum) {
          const finalResult = { [currentSide]: sideResult };
          setMultiResult(finalResult as ReturnType<typeof extendDataToPreselectedLines>);
          props.onAddWidgetClick?.({
            lineNumber: max,
            fromLineNumber: Math.min(...sideResult),
            side,
          });
          return;
        }
      }
      setMultiResult({ old: [], new: [] });
      props.onAddWidgetClick?.({ lineNumber: lineNum, fromLineNumber: lineNum, side });
    } else {
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

  const setPreselectedLines = (lines: { old: number[]; new: number[] }) => {
    setMultiResult(lines);
  };

  createEffect(() => {
    props.ref?.({
      getDiffFileInstance: () => innerDiffFile(),
      getSelectionResult,
      getSelectionState,
      clearSelection,
      setPreselectedLines,
    });
  });

  const getInternalRenderExtendLine = () => {
    const renderExtendLine = props.renderExtendLine;
    if (!renderExtendLine) return undefined;

    return ({
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
      const sideKey = side === SplitSide.old ? "oldFile" : "newFile";
      const extendItem = props.extendData?.[sideKey]?.[lineNumber];
      const fromLineNumber = extendItem?.fromLine ?? lineNumber;

      return renderExtendLine({
        lineNumber,
        fromLineNumber,
        side,
        data,
        diffFile,
        onUpdate,
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
        extendData={convertedExtendData()}
        onAddWidgetClick={handleAddWidgetClick}
        onDiffFileCreated={setInnerDiffFile}
        renderWidgetLine={props.renderWidgetLine}
        renderExtendLine={getInternalRenderExtendLine()}
      />
    </div>
  );
};

function SolidDiffViewWithMultiSelect<T>(props: DiffViewWithMultiSelectProps<T>): JSXElement {
  return <InternalDiffViewWithMultiSelect {...props} />;
}

export const DiffViewWithMultiSelect = SolidDiffViewWithMultiSelect;
