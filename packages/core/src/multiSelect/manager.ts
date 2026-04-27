import { getSelectedLinesFromDiffFile_Split, getSelectedLinesFromDiffFile_Unified } from "./data";
import {
  getLineNumberFromElement_Split,
  getLineNumbersFromElement_Unified,
  getNumberHolderElement_Split,
  getSideFromElement_Split,
  normalizeRange,
} from "./dom";
import { DEFAULT_SELECTED_CLASS } from "./types";
import { updateSelectionVisual_Split, updateSelectionVisual_Unified } from "./visual";

import type {
  DiffFileForMultiSelect,
  LineRange,
  MultiSelectOptions,
  MultiSelectResult,
  MultiSelectSide,
  MultiSelectState,
} from "./types";

/**
 * Framework-agnostic multi-select manager for diff views
 * Handles mouse events and selection state management
 */
export class DiffMultiSelectManager {
  #container: HTMLElement | null = null;
  #diffFile: DiffFileForMultiSelect | null = null;
  #options: Required<MultiSelectOptions>;
  #state: MultiSelectState = {
    isSelecting: false,
    startInfo: null,
    currentRange: null,
  };
  #preselectedLines: { old?: number[]; new?: number[] } = { old: [], new: [] };
  #boundHandlers: {
    mousedown: (e: MouseEvent) => void;
    mouseover: (e: MouseEvent) => void;
    mouseup: () => void;
  } | null = null;
  #isDestroyed = false;

  #unSubscribe: () => void = () => void 0;

  #debounceUpdateVirtual: () => void = () => void 0;

  constructor(container: HTMLElement, diffFile: DiffFileForMultiSelect, options: MultiSelectOptions = {}) {
    this.#container = container;
    this.#diffFile = diffFile;
    this.#options = {
      enabled: options.enabled ?? true,
      onSelectionChange: options.onSelectionChange ?? (() => {}),
      onSelectionComplete: options.onSelectionComplete ?? (() => {}),
      scopeToHunk: options.scopeToHunk ?? ((range) => range),
      selectedClassName: options.selectedClassName ?? DEFAULT_SELECTED_CLASS,
      isUnifiedMode: options.isUnifiedMode ?? false,
    };

    if (this.#options.enabled) {
      this.#bindEvents();
    }

    let id: NodeJS.Timeout | null = null;

    this.#debounceUpdateVirtual = () => {
      if (id) clearTimeout(id);
      id = setTimeout(() => this.#updateVisual(), 16);
    };
  }

  #bindEvents(): void {
    if (!this.#container || this.#boundHandlers) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (this.#options.isUnifiedMode) {
        this.#handleMouseDown_Unified(e);
      } else {
        this.#handleMouseDown_Split(e);
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      if (this.#options.isUnifiedMode) {
        this.#handleMouseOver_Unified(e);
      } else {
        this.#handleMouseOver_Split(e);
      }
    };

    const handleMouseUp = () => {
      this.#handleMouseUp();
    };

    this.#boundHandlers = {
      mousedown: handleMouseDown,
      mouseover: handleMouseOver,
      mouseup: handleMouseUp,
    };

    this.#container.addEventListener("mousedown", handleMouseDown);
    this.#container.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseup", handleMouseUp);
    this.#unSubscribe = this.#diffFile?.subscribe(() => this.#debounceUpdateVirtual()) || (() => void 0);
  }

  #handleMouseDown_Split(e: MouseEvent): void {
    const numberHolder = getNumberHolderElement_Split(e.target as HTMLElement, true);
    if (!numberHolder) return;

    const line = getLineNumberFromElement_Split(numberHolder);
    if (line === null) return;

    const side = getSideFromElement_Split(numberHolder);
    if (!side) return;

    this.#state.isSelecting = true;
    this.#state.startInfo = { lineNumber: line, side };

    let range: LineRange = {
      side,
      startLineNumber: line,
      endLineNumber: line,
    };

    if (this.#options.scopeToHunk) {
      const scopedRange = this.#options.scopeToHunk(range);
      if (scopedRange) {
        range = scopedRange;
      }
    }

    this.#state.currentRange = range;
    this.#updateVisual();
    this.#options.onSelectionChange(range, { ...this.#state });
  }

  #handleMouseDown_Unified(e: MouseEvent): void {
    const lineNumbers = getLineNumbersFromElement_Unified(e.target as HTMLElement);
    if (!lineNumbers) return;

    const lineNumber = lineNumbers.new ?? lineNumbers.old;
    if (lineNumber === undefined) return;

    const side: MultiSelectSide = lineNumbers.new !== undefined ? "new" : "old";

    this.#state.isSelecting = true;
    this.#state.startInfo = { lineNumber, side };

    let range: LineRange = {
      side,
      startLineNumber: lineNumber,
      endLineNumber: lineNumber,
    };

    if (this.#options.scopeToHunk) {
      const scopedRange = this.#options.scopeToHunk(range);
      if (scopedRange) {
        range = scopedRange;
      }
    }

    this.#state.currentRange = range;
    this.#updateVisual();
    this.#options.onSelectionChange(range, { ...this.#state });
  }

  #handleMouseOver_Split(e: MouseEvent): void {
    if (!this.#state.isSelecting || !this.#state.startInfo) return;

    const numberHolder = getNumberHolderElement_Split(e.target as HTMLElement);
    if (!numberHolder) return;

    const line = getLineNumberFromElement_Split(numberHolder);
    if (line === null) return;

    let range: LineRange = {
      side: this.#state.startInfo.side,
      startLineNumber: this.#state.startInfo.lineNumber,
      endLineNumber: line,
    };

    if (this.#options.scopeToHunk) {
      const scopedRange = this.#options.scopeToHunk(range);
      if (scopedRange) {
        range = scopedRange;
      }
    }

    this.#state.currentRange = range;
    this.#updateVisual();
    this.#options.onSelectionChange(range, { ...this.#state });
  }

  #handleMouseOver_Unified(e: MouseEvent): void {
    if (!this.#state.isSelecting || !this.#state.startInfo) return;

    const lineNumbers = getLineNumbersFromElement_Unified(e.target as HTMLElement);
    if (!lineNumbers) return;

    const lineNumber = lineNumbers[this.#state.startInfo.side];
    if (lineNumber === undefined) return;

    let range: LineRange = {
      side: this.#state.startInfo.side,
      startLineNumber: this.#state.startInfo.lineNumber,
      endLineNumber: lineNumber,
    };

    if (this.#options.scopeToHunk) {
      const scopedRange = this.#options.scopeToHunk(range);
      if (scopedRange) {
        range = scopedRange;
      }
    }

    this.#state.currentRange = range;
    this.#updateVisual();
    this.#options.onSelectionChange(range, { ...this.#state });
  }

  #handleMouseUp(): void {
    if (!this.#state.isSelecting || !this.#state.currentRange) {
      this.#resetState();
      return;
    }

    const normalizedRange = normalizeRange(this.#state.currentRange);
    this.#state.currentRange = normalizedRange;
    this.#state.isSelecting = false;

    const result = this.getSelectionResult();
    this.#options.onSelectionComplete(result);
  }

  #updateVisual(): void {
    if (this.#options.isUnifiedMode) {
      updateSelectionVisual_Unified(
        this.#container,
        this.#state.currentRange,
        this.#diffFile,
        this.#preselectedLines,
        this.#options.selectedClassName
      );
    } else {
      updateSelectionVisual_Split(
        this.#container,
        this.#state.currentRange,
        this.#diffFile,
        this.#preselectedLines,
        this.#options.selectedClassName
      );
    }
  }

  #resetState(): void {
    this.#state = {
      isSelecting: false,
      startInfo: null,
      currentRange: null,
    };
  }

  /**
   * Get the current selection result with line data from DiffFile
   */
  getSelectionResult(): MultiSelectResult | null {
    if (!this.#state.currentRange || !this.#diffFile) return null;

    const range = normalizeRange(this.#state.currentRange);
    const lines = this.#options.isUnifiedMode
      ? getSelectedLinesFromDiffFile_Unified(this.#diffFile, range)
      : getSelectedLinesFromDiffFile_Split(this.#diffFile, range);

    return { range, lines };
  }

  /**
   * Get the current selection state
   */
  getState(): MultiSelectState {
    return { ...this.#state };
  }

  /**
   * Set preselected lines (e.g., from existing comments)
   */
  setPreselectedLines(lines: { old?: number[]; new?: number[] }): void {
    this.#preselectedLines = lines;
    this.#updateVisual();
  }

  /**
   * Clear the current selection
   */
  clearSelection(): void {
    this.#resetState();
    this.#updateVisual();
    this.#options.onSelectionChange(null, { ...this.#state });
  }

  /**
   * Update options
   */
  updateOptions(options: Partial<MultiSelectOptions>): void {
    const wasEnabled = this.#options.enabled;
    this.#options = { ...this.#options, ...options } as Required<MultiSelectOptions>;

    if (!wasEnabled && this.#options.enabled) {
      this.#bindEvents();
    } else if (wasEnabled && !this.#options.enabled) {
      this.destroy();
    }
  }

  /**
   * Update the DiffFile instance
   */
  updateDiffFile(diffFile: DiffFileForMultiSelect): void {
    this.#unSubscribe();
    this.#diffFile = diffFile;
    this.#unSubscribe = this.#diffFile.subscribe(() => this.#debounceUpdateVirtual());
    this.#updateVisual();
  }

  /**
   * Update the container element
   */
  updateContainer(container: HTMLElement): void {
    this.destroy();
    this.#container = container;
    this.#isDestroyed = false;
    if (this.#options.enabled) {
      this.#bindEvents();
    }
  }

  /**
   * Destroy the manager and cleanup event listeners
   */
  destroy(): void {
    if (this.#isDestroyed) return;

    if (this.#boundHandlers && this.#container) {
      this.#container.removeEventListener("mousedown", this.#boundHandlers.mousedown);
      this.#container.removeEventListener("mouseover", this.#boundHandlers.mouseover);
      document.removeEventListener("mouseup", this.#boundHandlers.mouseup);
      this.#boundHandlers = null;
    }

    this.#unSubscribe();
    this.clearSelection();
    this.#isDestroyed = true;
  }
}

/**
 * Factory function to create a multi-select manager
 */
export function createDiffMultiSelectManager(
  container: HTMLElement,
  diffFile: DiffFileForMultiSelect,
  options?: MultiSelectOptions
): DiffMultiSelectManager {
  return new DiffMultiSelectManager(container, diffFile, options);
}
