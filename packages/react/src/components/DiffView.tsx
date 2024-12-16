/* eslint-disable @typescript-eslint/no-unnecessary-type-constraint */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { DiffFile, _cacheMap } from "@git-diff-view/core";
import { diffFontSizeName } from "@git-diff-view/utils";
import { memo, useEffect, useMemo, forwardRef, useImperativeHandle, useRef } from "react";
import * as React from "react";

import { useUnmount } from "../hooks/useUnmount";

import { DiffSplitView } from "./DiffSplitView";
import { DiffUnifiedView } from "./DiffUnifiedView";
import { DiffModeEnum, DiffViewContext } from "./DiffViewContext";
import { createDiffConfigStore } from "./tools";
// import { DiffSplitView } from "./v2/DiffSplitView_v2";

import type { DiffHighlighter, DiffHighlighterLang } from "@git-diff-view/core";
import type { CSSProperties, ForwardedRef, ReactNode } from "react";

_cacheMap.name = "@git-diff-view/react";

export enum SplitSide {
  old = 1,
  new = 2,
}

export type DiffViewProps<T> = {
  data?: {
    oldFile?: { fileName?: string | null; fileLang?: DiffHighlighterLang | string | null; content?: string | null };
    newFile?: { fileName?: string | null; fileLang?: DiffHighlighterLang | string | null; content?: string | null };
    hunks: string[];
  };
  extendData?: { oldFile?: Record<string, { data: T }>; newFile?: Record<string, { data: T }> };
  diffFile?: DiffFile;
  className?: string;
  style?: CSSProperties;
  /**
   * provide a custom highlighter
   * eg: lowlight, refractor, starry-night, shiki
   */
  registerHighlighter?: Omit<DiffHighlighter, "getHighlighterEngine">;
  diffViewMode?: DiffModeEnum;
  diffViewWrap?: boolean;
  diffViewTheme?: "light" | "dark";
  diffViewFontSize?: number;
  diffViewHighlight?: boolean;
  diffViewAddWidget?: boolean;
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
  }) => ReactNode;
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
  onAddWidgetClick?: (lineNumber: number, side: SplitSide) => void;
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

const _InternalDiffView = <T extends unknown>(props: Omit<DiffViewProps<T>, "data" | "registerHighlighter">) => {
  const {
    diffFile,
    className,
    style,
    diffViewMode,
    diffViewWrap,
    diffViewFontSize,
    diffViewHighlight,
    renderWidgetLine,
    renderExtendLine,
    extendData,
    diffViewAddWidget,
    onAddWidgetClick,
  } = props;

  const diffFileId = useMemo(() => diffFile.getId(), [diffFile]);

  const wrapperRef = useRef<HTMLDivElement>();

  // performance optimization
  const useDiffContext = useMemo(
    () => createDiffConfigStore(props, diffFileId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    const {
      id,
      setId,
      mode,
      setMode,
      enableAddWidget,
      setEnableAddWidget,
      enableHighlight,
      setEnableHighlight,
      enableWrap,
      setEnableWrap,
      setExtendData,
      fontSize,
      setFontSize,
      onAddWidgetClick: _onAddWidgetClick,
      setOnAddWidgetClick,
      renderExtendLine: _renderExtendLine,
      setRenderExtendLine,
      renderWidgetLine: _renderWidgetLine,
      setRenderWidgetLine,
    } = useDiffContext.getReadonlyState();

    diffFileId && diffFileId !== id && setId(diffFileId);
    diffViewMode && diffViewMode !== mode && setMode(diffViewMode);
    diffViewAddWidget !== enableAddWidget && setEnableAddWidget(diffViewAddWidget);
    diffViewHighlight !== enableHighlight && setEnableHighlight(diffViewHighlight);
    diffViewWrap !== enableWrap && setEnableWrap(diffViewWrap);
    extendData && setExtendData(extendData);
    diffViewFontSize && diffViewFontSize !== fontSize && setFontSize(diffViewFontSize);
    onAddWidgetClick !== _onAddWidgetClick.current && setOnAddWidgetClick({ current: onAddWidgetClick });
    renderExtendLine !== _renderExtendLine && setRenderExtendLine(renderExtendLine);
    renderWidgetLine !== _renderWidgetLine && setRenderWidgetLine(renderWidgetLine);
  }, [
    useDiffContext,
    diffViewFontSize,
    diffViewHighlight,
    diffViewMode,
    diffViewWrap,
    diffViewAddWidget,
    diffFileId,
    renderWidgetLine,
    renderExtendLine,
    extendData,
    onAddWidgetClick,
  ]);

  useEffect(() => {
    const cb = diffFile.subscribe(() => {
      wrapperRef.current?.setAttribute("data-theme", diffFile._getTheme() || "light");
      wrapperRef.current?.setAttribute("data-highlighter", diffFile._getHighlighterName());
    });

    return cb;
  }, [diffFile]);

  const value = useMemo(() => ({ useDiffContext }), [useDiffContext]);

  return (
    <DiffViewContext.Provider value={value}>
      <div
        className="diff-tailwindcss-wrapper"
        data-component="git-diff-view"
        data-theme={diffFile._getTheme() || "light"}
        data-version={__VERSION__}
        data-highlighter={diffFile._getHighlighterName()}
        ref={wrapperRef}
      >
        <div
          className="diff-style-root"
          style={{
            // @ts-ignore
            [diffFontSizeName]: diffViewFontSize + "px",
          }}
        >
          <div
            suppressHydrationWarning
            id={`diff-root${diffFileId}`}
            className={"diff-view-wrapper" + (className ? ` ${className}` : "")}
            style={style}
          >
            {diffViewMode & DiffModeEnum.Split ? (
              <DiffSplitView diffFile={diffFile} />
            ) : (
              <DiffUnifiedView diffFile={diffFile} />
            )}
          </div>
        </div>
      </div>
    </DiffViewContext.Provider>
  );
};

const InternalDiffView = memo(_InternalDiffView);

const DiffViewWithRef = <T extends unknown>(
  props: DiffViewProps<T>,
  ref: ForwardedRef<{ getDiffFileInstance: () => DiffFile }>
) => {
  const { registerHighlighter, data, diffViewTheme, diffFile: _diffFile, ...restProps } = props;

  const diffFile = useMemo(() => {
    if (_diffFile) {
      // missing data for plain file render
      // TODO next release update ?
      // will cause more complex for diffFile flow control, keep current
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
      diffFile.initSyntax({ registerHighlighter });
      diffFile.notifyAll();
    }
  }, [diffFile, props.diffViewHighlight, registerHighlighter, diffViewTheme]);

  // fix react strict mode error
  useUnmount(() => (__DEV__ ? diffFile?._destroy?.() : diffFile?.clear?.()), [diffFile]);

  useImperativeHandle(ref, () => ({ getDiffFileInstance: () => diffFile }), [diffFile]);

  if (!diffFile) return null;

  return (
    <InternalDiffView
      key={diffFile.getId()}
      {...restProps}
      diffFile={diffFile}
      diffViewMode={restProps.diffViewMode || DiffModeEnum.SplitGitHub}
      diffViewFontSize={restProps.diffViewFontSize || 14}
    />
  );
};

// type helper function
function _DiffView<T>(
  props: DiffViewProps_1<T> & { ref?: ForwardedRef<{ getDiffFileInstance: () => DiffFile }> }
): ReactNode;
function _DiffView<T>(
  props: DiffViewProps_2<T> & { ref?: ForwardedRef<{ getDiffFileInstance: () => DiffFile }> }
): ReactNode;
function _DiffView<T>(props: DiffViewProps<T> & { ref?: ForwardedRef<{ getDiffFileInstance: () => DiffFile }> }) {
  return <DiffViewWithRef {...props} />;
}

const InnerDiffView = forwardRef(DiffViewWithRef);

InnerDiffView.displayName = "DiffView";

export const DiffView = InnerDiffView as typeof _DiffView;

export const version = __VERSION__;
