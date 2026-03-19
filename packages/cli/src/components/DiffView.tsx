/* eslint-disable @typescript-eslint/no-unnecessary-type-constraint */
import { DiffFile, _cacheMap, SplitSide } from "@git-diff-view/core";
import { DiffModeEnum } from "@git-diff-view/utils";
import { Box } from "ink";
import React, { forwardRef, memo, useEffect, useImperativeHandle, useMemo, useRef } from "react";

import { useUnmount } from "../hooks/useUnmount";

import { DiffSplitView } from "./DiffSplitView";
import { DiffUnifiedView } from "./DiffUnifiedView";
import { DiffViewContext } from "./DiffViewContext";
import { createDiffConfigStore } from "./tools";

import type { DiffHighlighter, DiffHighlighterLang } from "@git-diff-view/core";
import type { DOMElement } from "ink";
import type { ForwardedRef, ReactNode, RefObject } from "react";

_cacheMap.name = "@git-diff-view/cli";

export { SplitSide, DiffModeEnum };

export type DiffViewProps<T> = {
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
  // tabWidth in the diff view, small: 1, medium: 2, large: 4, default: medium
  diffViewTabWidth?: "small" | "medium" | "large";
  registerHighlighter?: Omit<DiffHighlighter, "getHighlighterEngine">;
  diffViewHighlight?: boolean;
  // hide the diff operator (+/-/space) and show padding instead
  diffViewHideOperator?: boolean;
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
    wrapperRef?: RefObject<DOMElement>;
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
  } = props;

  const diffFileId = useMemo(() => diffFile.getId(), [diffFile]);

  // performance optimization
  const useDiffContext = useMemo(() => createDiffConfigStore(props, diffFileId), []);

  useEffect(() => {
    const {
      id,
      setId,
      mode,
      setMode,
      enableHighlight,
      setEnableHighlight,
      setExtendData,
      renderExtendLine,
      setRenderExtendLine,
      tabSpace,
      setTabSpace,
      tabWidth,
      setTabWidth,
      hideOperator,
      setHideOperator,
      width,
      setWidth,
    } = useDiffContext.getReadonlyState();

    if (diffFileId && diffFileId !== id) {
      setId(diffFileId);
    }

    if (diffViewMode && diffViewMode !== mode) {
      setMode(diffViewMode);
    }

    if (diffViewHighlight !== enableHighlight) {
      setEnableHighlight(diffViewHighlight);
    }

    if (props.extendData) {
      setExtendData(props.extendData);
    }

    if (renderExtendLine !== props.renderExtendLine) {
      setRenderExtendLine(props.renderExtendLine);
    }

    if (diffViewTabSpace !== tabSpace) {
      setTabSpace(diffViewTabSpace);
    }

    if (diffViewTabWidth !== tabWidth) {
      setTabWidth(diffViewTabWidth);
    }

    if (diffViewHideOperator !== hideOperator) {
      setHideOperator(diffViewHideOperator);
    }

    if (_width !== width) {
      setWidth(_width);
    }
  }, [
    _width,
    useDiffContext,
    diffViewHighlight,
    diffViewMode,
    diffFileId,
    extendData,
    renderExtendLine,
    diffViewTabSpace,
    diffViewTabWidth,
    diffViewHideOperator,
  ]);

  useEffect(() => {
    const { wrapper, setWrapper } = useDiffContext.getReadonlyState();
    if (wrapperRef.current !== wrapper.current) {
      setWrapper(wrapperRef.current);
    }
  });

  const value = useMemo(() => ({ useDiffContext }), [useDiffContext]);

  return (
    <DiffViewContext.Provider value={value}>
      <Box
        data-component="git-diff-view"
        data-theme={diffFile._getTheme() || "light"}
        data-version={__VERSION__}
        flexDirection="column"
        data-highlighter={diffFile._getHighlighterName()}
      >
        {diffViewMode & DiffModeEnum.Split ? (
          <DiffSplitView diffFile={diffFile} width={_width} />
        ) : (
          <DiffUnifiedView diffFile={diffFile} width={_width} />
        )}
      </Box>
    </DiffViewContext.Provider>
  );
};

const MemoedInternalDiffView = memo(InternalDiffView);

const DiffViewContainerWithRef = <T extends unknown>(
  props: DiffViewProps<T>,
  ref: ForwardedRef<{ getDiffFileInstance: () => DiffFile }>
) => {
  const { registerHighlighter, data, diffViewTheme, diffFile: _diffFile, ...restProps } = props;

  const width = restProps.width;

  const domRef = useRef<DOMElement>(null);

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
      diffFile.initSyntax({ registerHighlighter: registerHighlighter });
    }
    diffFile.notifyAll();
  }, [diffFile, props.diffViewHighlight, props.diffViewTheme, registerHighlighter]);

  // fix react strict mode error
  useUnmount(() => (__DEV__ ? diffFile?._destroy?.() : diffFile?.clear?.()), [diffFile]);

  useImperativeHandle(ref, () => ({ getDiffFileInstance: () => diffFile }), [diffFile]);

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
      />
    </Box>
  );
};

// type helper function
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ReactDiffView<T>(
  props: DiffViewProps_1<T> & { ref?: ForwardedRef<{ getDiffFileInstance: () => DiffFile }> }
): JSX.Element;
function ReactDiffView<T>(
  props: DiffViewProps_2<T> & { ref?: ForwardedRef<{ getDiffFileInstance: () => DiffFile }> }
): JSX.Element;
function ReactDiffView<T>(_props: DiffViewProps<T> & { ref?: ForwardedRef<{ getDiffFileInstance: () => DiffFile }> }) {
  return <></>;
}

const InnerDiffView = forwardRef(DiffViewContainerWithRef);

InnerDiffView.displayName = "DiffView";

export const DiffView = InnerDiffView as typeof ReactDiffView;

export const version = __VERSION__;
