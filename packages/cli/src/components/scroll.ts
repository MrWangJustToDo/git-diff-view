import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/** Step granularity for scrollUp / scrollDown. */
export type ScrollUnit = "logical" | "visual";

/** Current scroll snapshot shared by CodeView and DiffView. */
export type ScrollState = {
  /** Logical line count (CodeView: source lines; DiffView: display sequence lines). */
  totalLines: number;
  /** Total visual rows after wrap. */
  totalRows: number;
  /** Viewport height in visual rows; equals totalRows when height prop is unset. */
  viewportHeight: number;
  /** Top visual row offset (0-based). */
  scrollOffset: number;
  /** First visible logical line, including partially clipped lines at the top. */
  startLine: number;
  /** Last visible logical line, including partially clipped lines at the bottom. */
  endLine: number;
  canScrollUp: boolean;
  canScrollDown: boolean;
};

export type ScrollStepOptions = {
  /** @default "visual" */
  unit?: ScrollUnit;
  /** @default 1 */
  step?: number;
};

export type ScrollViewRef = {
  getScrollState: () => ScrollState;
  scrollToTop: (line: number) => void;
  scrollToBottom: (line: number) => void;
  scrollUp: (options?: ScrollStepOptions) => void;
  scrollDown: (options?: ScrollStepOptions) => void;
};

export type ScrollViewProps = {
  /** Fixed viewport height in visual rows. When unset, all content is rendered. */
  height?: number;
  onScrollChange?: (state: ScrollState) => void;
};

export type ScrollLineLayout = {
  lineNumber: number;
  startRow: number;
  endRow: number;
};

export type ScrollLayout = {
  rows: string[];
  lines: ScrollLineLayout[];
  totalRows: number;
  totalLines: number;
};

/** Visible row window inside a multi-row scroll entry. */
export type ScrollSlice = {
  rowOffset: number;
  rowCount: number;
};

export const EMPTY_SCROLL_LAYOUT: ScrollLayout = {
  rows: [],
  lines: [],
  totalRows: 0,
  totalLines: 0,
};

export function clampScrollOffset(scrollOffset: number, totalRows: number, viewportHeight: number): number {
  const maxOffset = Math.max(0, totalRows - viewportHeight);
  return Math.max(0, Math.min(scrollOffset, maxOffset));
}

export function clampLineNumber(line: number, totalLines: number): number {
  if (totalLines <= 0) return 1;
  return Math.max(1, Math.min(line, totalLines));
}

export function findLineLayout(layout: ScrollLayout, line: number): ScrollLineLayout | undefined {
  return layout.lines.find((item) => item.lineNumber === line);
}

export function computeScrollState(layout: ScrollLayout, scrollOffset: number, viewportHeight: number): ScrollState {
  const totalRows = layout.totalRows;
  const totalLines = layout.totalLines;
  const clampedOffset = clampScrollOffset(scrollOffset, totalRows, viewportHeight);
  const viewStart = clampedOffset;
  const viewEnd = totalRows > 0 ? clampedOffset + viewportHeight - 1 : -1;

  let startLine = totalLines > 0 ? 1 : 0;
  let endLine = totalLines > 0 ? totalLines : 0;

  if (totalLines > 0 && totalRows > 0) {
    for (const line of layout.lines) {
      if (line.endRow - 1 >= viewStart) {
        startLine = line.lineNumber;
        break;
      }
    }

    for (let i = layout.lines.length - 1; i >= 0; i--) {
      const line = layout.lines[i]!;
      if (line.startRow <= viewEnd) {
        endLine = line.lineNumber;
        break;
      }
    }
  }

  const maxOffset = Math.max(0, totalRows - viewportHeight);

  return {
    totalLines,
    totalRows,
    viewportHeight,
    scrollOffset: clampedOffset,
    startLine,
    endLine,
    canScrollUp: clampedOffset > 0,
    canScrollDown: clampedOffset < maxOffset,
  };
}

export function scrollOffsetToTopLine(layout: ScrollLayout, line: number, viewportHeight: number): number {
  const targetLine = clampLineNumber(line, layout.totalLines);
  const lineLayout = findLineLayout(layout, targetLine);
  if (!lineLayout) return 0;
  return clampScrollOffset(lineLayout.startRow, layout.totalRows, viewportHeight);
}

export function scrollOffsetToBottomLine(layout: ScrollLayout, line: number, viewportHeight: number): number {
  const targetLine = clampLineNumber(line, layout.totalLines);
  const lineLayout = findLineLayout(layout, targetLine);
  if (!lineLayout) return 0;
  return clampScrollOffset(lineLayout.endRow - viewportHeight, layout.totalRows, viewportHeight);
}

export function scrollOffsetUp(
  layout: ScrollLayout,
  scrollOffset: number,
  viewportHeight: number,
  options?: ScrollStepOptions
): number {
  const unit = options?.unit ?? "visual";
  const step = options?.step ?? 1;
  if (step <= 0) return clampScrollOffset(scrollOffset, layout.totalRows, viewportHeight);

  if (unit === "visual") {
    return clampScrollOffset(scrollOffset - step, layout.totalRows, viewportHeight);
  }

  const state = computeScrollState(layout, scrollOffset, viewportHeight);
  let targetLine = state.startLine;

  for (let i = 0; i < step; i++) {
    const prev = [...layout.lines].reverse().find((line) => line.lineNumber < targetLine);
    if (!prev) {
      return 0;
    }
    targetLine = prev.lineNumber;
  }

  return scrollOffsetToTopLine(layout, targetLine, viewportHeight);
}

export function scrollOffsetDown(
  layout: ScrollLayout,
  scrollOffset: number,
  viewportHeight: number,
  options?: ScrollStepOptions
): number {
  const unit = options?.unit ?? "visual";
  const step = options?.step ?? 1;
  if (step <= 0) return clampScrollOffset(scrollOffset, layout.totalRows, viewportHeight);

  if (unit === "visual") {
    return clampScrollOffset(scrollOffset + step, layout.totalRows, viewportHeight);
  }

  const state = computeScrollState(layout, scrollOffset, viewportHeight);
  let targetLine = state.startLine;

  for (let i = 0; i < step; i++) {
    const next = layout.lines.find((line) => line.lineNumber > targetLine);
    if (!next) {
      return clampScrollOffset(layout.totalRows - viewportHeight, layout.totalRows, viewportHeight);
    }
    targetLine = next.lineNumber;
  }

  return scrollOffsetToTopLine(layout, targetLine, viewportHeight);
}

export function sliceVisibleRows(layout: ScrollLayout, scrollOffset: number, viewportHeight: number): string {
  if (layout.rows.length === 0) return "";
  const clampedOffset = clampScrollOffset(scrollOffset, layout.totalRows, viewportHeight);
  return layout.rows.slice(clampedOffset, clampedOffset + viewportHeight).join("\n");
}

export function createScrollViewRef(
  layout: ScrollLayout,
  scrollOffset: number,
  viewportHeight: number,
  setScrollOffset: (offset: number) => void
): ScrollViewRef {
  return {
    getScrollState: () => computeScrollState(layout, scrollOffset, viewportHeight),
    scrollToTop: (line) => {
      setScrollOffset(scrollOffsetToTopLine(layout, line, viewportHeight));
    },
    scrollToBottom: (line) => {
      setScrollOffset(scrollOffsetToBottomLine(layout, line, viewportHeight));
    },
    scrollUp: (options) => {
      setScrollOffset(scrollOffsetUp(layout, scrollOffset, viewportHeight, options));
    },
    scrollDown: (options) => {
      setScrollOffset(scrollOffsetDown(layout, scrollOffset, viewportHeight, options));
    },
  };
}

export function useScrollView({
  layout,
  height,
  onScrollChange,
  resetKey,
}: {
  layout: ScrollLayout;
  height?: number;
  onScrollChange?: (state: ScrollState) => void;
  /** When this value changes (e.g. columns/width), scroll offset resets to 0. */
  resetKey?: unknown;
}) {
  const [scrollOffset, setScrollOffsetState] = useState(0);
  const onScrollChangeRef = useRef(onScrollChange);
  const lastNotifiedStateRef = useRef<string>("");
  const prevResetKeyRef = useRef<unknown>(undefined);

  useEffect(() => {
    onScrollChangeRef.current = onScrollChange;
  }, [onScrollChange]);

  useEffect(() => {
    if (resetKey === undefined) return;
    if (prevResetKeyRef.current !== undefined && prevResetKeyRef.current !== resetKey) {
      setScrollOffsetState(0);
      lastNotifiedStateRef.current = "";
    }
    prevResetKeyRef.current = resetKey;
  }, [resetKey]);

  const viewportHeight = height ?? Math.max(layout.totalRows, 1);
  const effectiveOffset = clampScrollOffset(scrollOffset, layout.totalRows, viewportHeight);

  const setScrollOffset = useCallback((offset: number) => {
    setScrollOffsetState(offset);
  }, []);

  const scrollState = useMemo(
    () => computeScrollState(layout, effectiveOffset, viewportHeight),
    [layout, effectiveOffset, viewportHeight]
  );

  useEffect(() => {
    const snapshot = JSON.stringify(scrollState);
    if (snapshot === lastNotifiedStateRef.current) return;
    lastNotifiedStateRef.current = snapshot;
    onScrollChangeRef.current?.(scrollState);
  }, [scrollState]);

  const visibleOutput = useMemo(
    () => sliceVisibleRows(layout, effectiveOffset, viewportHeight),
    [layout, effectiveOffset, viewportHeight]
  );

  const scrollRef = useMemo(
    () => createScrollViewRef(layout, effectiveOffset, viewportHeight, setScrollOffset),
    [layout, effectiveOffset, viewportHeight, setScrollOffset]
  );

  return {
    scrollState,
    visibleOutput,
    scrollRef,
    viewportHeight,
    hasFixedHeight: typeof height === "number",
  };
}
