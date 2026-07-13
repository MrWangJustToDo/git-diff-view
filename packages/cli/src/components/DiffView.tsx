/* eslint-disable react-hooks/refs */
/* eslint-disable @typescript-eslint/no-unnecessary-type-constraint */
import { DiffFile, _cacheMap, SplitSide, setEnableBuildTemplate } from "@git-diff-view/core";
import { DiffModeEnum } from "@git-diff-view/utils";
import { Box } from "ink";
import { forwardRef, memo, useEffect, useImperativeHandle, useMemo, useRef } from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useSyncExternalStore } from "use-sync-external-store/shim/index.js";

import { useTerminalSize } from "../hooks/useTerminalSize";
import { useUnmount } from "../hooks/useUnmount";

import { DiffSplitView } from "./DiffSplitView";
import { DiffUnifiedView } from "./DiffUnifiedView";
import { DiffViewContext } from "./DiffViewContext";
import { buildDiffViewScrollLayout, EMPTY_DIFF_VIEW_SCROLL_LAYOUT, getVisibleDiffScrollLines } from "./diffViewScroll";
import { useScrollView, type ScrollViewProps, type ScrollViewRef } from "./scroll";
import { createDiffConfigStore } from "./tools";

import type { DiffViewColorTheme } from "./color";
import type { DiffHighlighter, DiffHighlighterLang } from "@git-diff-view/core";
import type { DOMElement } from "ink";
import type { ForwardedRef, JSX, ReactNode, RefObject } from "react";

_cacheMap.name = "@git-diff-view/cli";

setEnableBuildTemplate(false);

export { SplitSide, DiffModeEnum };

export type DiffViewRef = ScrollViewRef & {
  getDiffFileInstance: () => DiffFile | null;
};

export type DiffViewProps<T> = ScrollViewProps & {
  data?: {
    oldFile?: { fileName?: string | null; fileLang?: DiffHighlighterLang | string | null; content?: string | null };
    newFile?: { fileName?: string | null; fileLang?: DiffHighlighterLang | string | null; content?: string | null };
    hunks: string[];
  };
  extendData?: { oldFile?: Record<string, { data: T }>; newFile?: Record<string, { data: T }> };
  width?: number;
  diffFile?: DiffFile;
  diffViewMode?: DiffModeEnum;
  diffViewTheme?: "light" | "dark";
  diffViewTabSpace?: boolean;
  diffViewTabWidth?: "small" | "medium" | "large";
  registerHighlighter?: Omit<DiffHighlighter, "getHighlighterEngine">;
  diffViewHighlight?: boolean;
  diffViewHideOperator?: boolean;
  diffViewNoBG?: boolean;
  diffViewThemeColors?: DiffViewColorTheme;
  /** Visual row height for extend lines in scroll layout (default: 1). */
  diffViewExtendLineHeight?: number;
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
  }) => ReactNode;
};

type DiffViewProps_1<T> = Omit<DiffViewProps<T>, "data"> & {
  data?: {
    oldFile?: { fileName?: string | null; fileLang?: DiffHighlighterLang | null; content?: string | null };
    newFile?: { fileName?: string | null; fileLang?: DiffHighlighterLang | null; content?: string | null };
    hunks: string[];
  };
};

type DiffViewProps_2<T> = Omit<DiffViewProps<T>, "data"> & {
  data?: {
    oldFile?: { fileName?: string | null; fileLang?: string | null; content?: string | null };
    newFile?: { fileName?: string | null; fileLang?: string | null; content?: string | null };
    hunks: string[];
  };
};

const InternalDiffView = <T extends unknown>(
  props: Omit<DiffViewProps<T>, "data"> & {
    wrapperRef: RefObject<DOMElement | null>;
    height?: number;
    onScrollChange?: DiffViewProps<T>["onScrollChange"];
    forwardedRef?: ForwardedRef<DiffViewRef>;
  }
) => {
  const {
    width: _width,
    diffFile,
    diffViewMode,
    diffViewHighlight,
    wrapperRef,
    extendData,
    renderExtendLine,
    diffViewTabSpace,
    diffViewTabWidth,
    diffViewHideOperator,
    diffViewNoBG,
    diffViewThemeColors,
    diffViewExtendLineHeight,
    height,
    onScrollChange,
    forwardedRef,
  } = props;

  const diffFileId = useMemo(() => diffFile!.getId(), [diffFile]);
  const mode = diffViewMode || DiffModeEnum.SplitGitHub;

  // performance optimization
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const useDiffContext = useMemo(() => createDiffConfigStore<any>(props, diffFileId), []);

  useEffect(() => {
    const {
      id,
      setId,
      mode: storeMode,
      setMode,
      enableHighlight,
      setEnableHighlight,
      setExtendData,
      renderExtendLine: storeRenderExtendLine,
      setRenderExtendLine,
      tabSpace,
      setTabSpace,
      tabWidth,
      setTabWidth,
      hideOperator,
      setHideOperator,
      noBG,
      setNoBG,
      setThemeColors,
      width,
      setWidth,
    } = useDiffContext.getReadonlyState();

    if (diffFileId && diffFileId !== id) {
      setId(diffFileId);
    }

    if (mode && mode !== storeMode) {
      setMode(mode);
    }

    if (diffViewHighlight !== enableHighlight) {
      setEnableHighlight(!!diffViewHighlight);
    }

    if (props.extendData) {
      setExtendData(props.extendData);
    }

    if (storeRenderExtendLine !== props.renderExtendLine) {
      setRenderExtendLine(props.renderExtendLine);
    }

    if (diffViewTabSpace !== tabSpace) {
      setTabSpace(!!diffViewTabSpace);
    }

    if (diffViewTabWidth && diffViewTabWidth !== tabWidth) {
      setTabWidth(diffViewTabWidth);
    }

    if (diffViewHideOperator !== hideOperator) {
      setHideOperator(!!diffViewHideOperator);
    }

    if (diffViewNoBG !== noBG) {
      setNoBG(!!diffViewNoBG);
    }

    setThemeColors(diffViewThemeColors);

    if (_width && _width !== width) {
      setWidth(_width);
    }
  }, [
    _width,
    useDiffContext,
    diffViewHighlight,
    mode,
    diffFileId,
    extendData,
    renderExtendLine,
    diffViewTabSpace,
    diffViewTabWidth,
    diffViewHideOperator,
    diffViewNoBG,
    diffViewThemeColors,
    props.extendData,
    props.renderExtendLine,
  ]);

  useEffect(() => {
    const { wrapper, setWrapper } = useDiffContext.getReadonlyState();
    if (wrapperRef.current && wrapperRef.current !== wrapper.current) {
      setWrapper(wrapperRef.current);
    }
  });

  const value = useMemo(() => ({ useDiffContext }), [useDiffContext]);

  return (
    <DiffViewContext.Provider value={value}>
      <MemoedDiffViewScrollBody
        diffFile={diffFile!}
        width={_width}
        mode={mode}
        height={height}
        onScrollChange={onScrollChange}
        forwardedRef={forwardedRef}
        extendData={props.extendData}
        diffViewExtendLineHeight={diffViewExtendLineHeight}
        renderExtendLine={renderExtendLine}
      />
    </DiffViewContext.Provider>
  );
};

const DiffViewScrollBody = <T extends unknown>({
  diffFile,
  width: _width,
  mode,
  height,
  onScrollChange,
  forwardedRef,
  extendData,
  diffViewExtendLineHeight,
  renderExtendLine,
}: {
  diffFile: DiffFile;
  width?: number;
  mode: DiffModeEnum;
  height?: number;
  onScrollChange?: DiffViewProps<T>["onScrollChange"];
  forwardedRef?: ForwardedRef<DiffViewRef>;
  extendData?: DiffViewProps<T>["extendData"];
  diffViewExtendLineHeight?: number;
  renderExtendLine?: DiffViewProps<T>["renderExtendLine"];
}) => {
  const { columns: terminalColumns } = useTerminalSize();
  const columns = _width || terminalColumns || 0;

  const updateCount = useSyncExternalStore(diffFile.subscribe, diffFile.getUpdateCount, diffFile.getUpdateCount);

  const scrollLayout = useMemo(() => {
    if (typeof height !== "number") {
      return EMPTY_DIFF_VIEW_SCROLL_LAYOUT;
    }

    return buildDiffViewScrollLayout({
      diffFile,
      columns,
      mode,
      extendData,
      extendLineHeight: diffViewExtendLineHeight ?? 1,
      hasRenderExtendLine: !!renderExtendLine,
    });
    // updateCount triggers layout rebuild when diff content changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height, diffFile, columns, mode, extendData, diffViewExtendLineHeight, renderExtendLine, updateCount]);

  const { scrollRef, hasFixedHeight, viewportHeight, scrollState } = useScrollView({
    layout: scrollLayout,
    height,
    onScrollChange,
    resetKey: typeof height === "number" ? `${columns}:${mode}` : undefined,
  });

  const visibleEntries = useMemo(() => {
    if (!hasFixedHeight) return undefined;
    return getVisibleDiffScrollLines(scrollLayout, scrollState.scrollOffset, viewportHeight);
  }, [hasFixedHeight, scrollLayout, scrollState.scrollOffset, viewportHeight]);

  useImperativeHandle(
    forwardedRef,
    () => ({
      getDiffFileInstance: () => diffFile,
      ...scrollRef,
    }),
    [diffFile, scrollRef]
  );

  const isSplitMode = !!(mode & DiffModeEnum.Split);

  return (
    <Box
      data-component="git-diff-view"
      data-theme={diffFile._getTheme() || "light"}
      data-version={__VERSION__}
      flexDirection="column"
      data-highlighter={diffFile._getHighlighterName()}
    >
      {isSplitMode ? (
        <DiffSplitView
          diffFile={diffFile}
          width={_width}
          visibleEntries={visibleEntries}
          hasFixedHeight={hasFixedHeight}
          viewportHeight={viewportHeight}
          mode={mode}
        />
      ) : (
        <DiffUnifiedView
          diffFile={diffFile}
          width={_width}
          visibleEntries={visibleEntries}
          hasFixedHeight={hasFixedHeight}
          viewportHeight={viewportHeight}
        />
      )}
    </Box>
  );
};

const MemoedDiffViewScrollBody = memo(DiffViewScrollBody) as typeof DiffViewScrollBody;

const MemoedInternalDiffView = memo(InternalDiffView) as typeof InternalDiffView;

const DiffViewContainerWithRef = <T extends unknown>(props: DiffViewProps<T>, ref: ForwardedRef<DiffViewRef>) => {
  const { registerHighlighter, data, diffViewTheme, diffFile: _diffFile, height, onScrollChange, ...restProps } = props;

  const width = restProps.width;

  const domRef = useRef<DOMElement>(null);

  const diffFile = useMemo(() => {
    if (_diffFile) {
      const diffFile = DiffFile.createInstance({});
      diffFile._mergeFullBundle(_diffFile._getFullBundle());
      return diffFile;
    } else if (data) {
      return new DiffFile(
        data?.oldFile?.fileName || "",
        data?.oldFile?.content || "",
        data?.newFile?.fileName || "",
        data?.newFile?.content || "",
        data?.hunks || [],
        data?.oldFile?.fileLang || "",
        data?.newFile?.fileLang || ""
      );
    }
    return null;
  }, [data, _diffFile]);

  const diffFileRef = useRef(diffFile);

  if (diffFileRef.current && diffFileRef.current !== diffFile) {
    diffFileRef.current.clear?.();
    diffFileRef.current = diffFile;
  }

  useEffect(() => {
    if (_diffFile && diffFile) {
      _diffFile._addClonedInstance(diffFile);
      return () => {
        _diffFile._delClonedInstance(diffFile);
      };
    }
  }, [diffFile, _diffFile]);

  useEffect(() => {
    if (!diffFile) return;
    diffFile.initTheme(diffViewTheme);
    diffFile.initRaw();
    diffFile.buildSplitDiffLines();
    diffFile.buildUnifiedDiffLines();
  }, [diffFile, diffViewTheme]);

  useEffect(() => {
    if (!diffFile) return;
    if (props.diffViewHighlight) {
      diffFile.initSyntax({ registerHighlighter: registerHighlighter });
    }
    diffFile.notifyAll();
  }, [diffFile, props.diffViewHighlight, props.diffViewTheme, registerHighlighter]);

  useUnmount(() => (__DEV__ ? diffFile?._destroy?.() : diffFile?.clear?.()), [diffFile]);

  if (!diffFile) return null;

  return (
    <Box
      ref={domRef}
      width={width}
      flexGrow={typeof width === "number" ? undefined : 1}
      flexShrink={typeof width === "number" ? 0 : undefined}
    >
      <MemoedInternalDiffView
        key={diffFile.getId()}
        {...restProps}
        wrapperRef={domRef}
        diffFile={diffFile}
        diffViewTheme={diffViewTheme}
        diffViewTabWidth={props.diffViewTabWidth || "medium"}
        diffViewMode={restProps.diffViewMode || DiffModeEnum.SplitGitHub}
        height={height}
        onScrollChange={onScrollChange}
        forwardedRef={ref}
      />
    </Box>
  );
};

// type helper function
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ReactDiffView<T>(props: DiffViewProps_1<T> & { ref?: ForwardedRef<DiffViewRef> }): JSX.Element;
function ReactDiffView<T>(props: DiffViewProps_2<T> & { ref?: ForwardedRef<DiffViewRef> }): JSX.Element;
function ReactDiffView<T>(_props: DiffViewProps<T> & { ref?: ForwardedRef<DiffViewRef> }) {
  return <></>;
}

const InnerDiffView = forwardRef(DiffViewContainerWithRef);

InnerDiffView.displayName = "DiffView";

export const DiffView = InnerDiffView as typeof ReactDiffView;

export const version = __VERSION__;
