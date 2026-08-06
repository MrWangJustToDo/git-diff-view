/* eslint-disable @typescript-eslint/no-unnecessary-type-constraint */
import {
  DiffFile,
  _cacheMap,
  SplitSide,
  setEnableBuildTemplate,
} from "@git-diff-view/core";
import { diffFontSizeName, DiffModeEnum } from "@git-diff-view/utils";
import { memo, useEffect, useMemo, useRef } from "@lynx-js/react";

import { useUnmount } from "../hooks/useUnmount";

import { DiffSplitView } from "./DiffSplitView";
import { DiffUnifiedView } from "./DiffUnifiedView";
import { DiffViewContext } from "./DiffViewContext";
import { createDiffConfigStore } from "./tools";
import { themeClassName } from "../theme";

import type { DiffHighlighter, DiffHighlighterLang } from "@git-diff-view/core";

type ReactNode = any;

_cacheMap.name = "@git-diff-view/lynx";

setEnableBuildTemplate(false);

export { SplitSide, DiffModeEnum };

export type DiffViewProps<T> = {
  data?: {
    oldFile?: { fileName?: string | null; fileLang?: DiffHighlighterLang | string | null; content?: string | null };
    newFile?: { fileName?: string | null; fileLang?: DiffHighlighterLang | string | null; content?: string | null };
    hunks: string[];
  };
  extendData?: { oldFile?: Record<string, { data: T }>; newFile?: Record<string, { data: T }> };
  diffFile?: DiffFile;
  className?: string;
  style?: Record<string, string | number>;
  registerHighlighter?: Omit<DiffHighlighter, "getHighlighterEngine">;
  diffViewMode?: DiffModeEnum;
  /** MVP defaults to wrap (v2 Wrap Split model). No-wrap dual-pane is deferred. */
  diffViewWrap?: boolean;
  diffViewTheme?: "light" | "dark";
  diffViewFontSize?: number;
  diffViewHighlight?: boolean;
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

type InternalProps<T> = Omit<DiffViewProps<T>, "data" | "registerHighlighter" | "diffFile"> & {
  diffFile: DiffFile;
  diffFileId: string;
};

const InternalDiffView = <T extends unknown>(props: InternalProps<T>) => {
  const {
    diffFile,
    className,
    style,
    diffViewMode = DiffModeEnum.SplitGitHub,
    diffViewWrap = true,
    diffFileId,
    renderExtendLine,
    extendData,
    diffViewTheme,
    diffViewFontSize = 13,
    diffViewHighlight,
  } = props;

  // Build store once with final props — avoid post-mount store churn that patches Lynx slots.
  const useDiffContext = useMemo(
    () =>
      createDiffConfigStore(
        {
          diffViewMode,
          diffViewWrap,
          diffViewTheme,
          diffViewFontSize,
          diffViewHighlight,
          extendData,
          renderExtendLine,
          isMounted: true,
        } as DiffViewProps<T> & { isMounted: boolean },
        diffFileId
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [diffFileId]
  );

  useEffect(() => {
    const {
      setMode,
      setEnableWrap,
      setEnableHighlight,
      setFontSize,
      setTheme,
      setExtendData,
      setRenderExtendLine,
    } = useDiffContext.getReadonlyState();

    setMode(diffViewMode);
    setEnableWrap(diffViewWrap);
    setEnableHighlight(!!diffViewHighlight);
    setFontSize(diffViewFontSize);
    if (diffViewTheme) setTheme(diffViewTheme);
    setExtendData(extendData);
    setRenderExtendLine(renderExtendLine);
  }, [
    useDiffContext,
    diffViewMode,
    diffViewWrap,
    diffViewHighlight,
    diffViewFontSize,
    diffViewTheme,
    renderExtendLine,
    extendData,
  ]);

  const value = useMemo(() => ({ useDiffContext }), [useDiffContext]);
  const theme = diffFile._getTheme() || diffViewTheme || "light";
  const isSplit = !!(diffViewMode & DiffModeEnum.Split);

  return (
    <DiffViewContext.Provider value={value}>
      <view
        className={"diff-view-lynx " + themeClassName(theme) + " flex h-full w-full flex-col" + (className ? ` ${className}` : "")}
        data-theme={theme}
        data-component="git-diff-view"
        style={{
          // @ts-expect-error CSS custom property
          [diffFontSizeName]: diffViewFontSize + "px",
          fontSize: `${diffViewFontSize}px`,
          fontFamily: "Menlo, Consolas, monospace",
          ...style,
        }}
      >
        {/*
          Virtualized via Lynx `<list>` (owned by Split/Unified).
          List needs a fixed viewport height — inherit from this flex column.
        */}
        <view className="diff-view-lynx-scroll min-h-0 w-full flex-1" style={{ height: "100%", flexBasis: "0%" }}>
          {isSplit ? (
            <DiffSplitView key="split" diffFile={diffFile} />
          ) : (
            <DiffUnifiedView key="unified" diffFile={diffFile} />
          )}
        </view>
      </view>
    </DiffViewContext.Provider>
  );
};

const MemoedInternalDiffView = memo(InternalDiffView) as typeof InternalDiffView;

/**
 * Prepare DiffFile on the render path (not in useEffect).
 * Lynx dual-thread: effect → notifyAll → setState patches a huge child list into an
 * empty first paint and crashes SnapshotInstance.insertBefore.
 *
 * Syntax highlighting must also run here when `registerHighlighter` is provided
 * (e.g. `@git-diff-view/lezer`) — do not rely on the built-in lowlight path.
 */
const prepareDiffFile = (
  file: DiffFile,
  options: {
    theme?: "light" | "dark";
    enableHighlight?: boolean;
    registerHighlighter?: Omit<DiffHighlighter, "getHighlighterEngine">;
    /** When hydrating a prebuilt bundle, skip re-parse unless highlighter changes. */
    fromBundle?: boolean;
  }
) => {
  const { theme, enableHighlight, registerHighlighter, fromBundle } = options;
  file.initTheme(theme);
  file.initRaw();
  if (enableHighlight && registerHighlighter && !fromBundle) {
    file.initSyntax({ registerHighlighter });
  } else if (
    enableHighlight &&
    registerHighlighter &&
    fromBundle &&
    (registerHighlighter.name !== file._getHighlighterName() ||
      registerHighlighter.type !== file._getHighlighterType())
  ) {
    file.initSyntax({ registerHighlighter });
  }
  file.buildSplitDiffLines();
  file.buildUnifiedDiffLines();
  return file;
};

const DiffViewInner = <T extends unknown>(props: DiffViewProps<T>) => {
  const { registerHighlighter, data, diffViewTheme, diffFile: _diffFile, ...restProps } = props;
  const enableHighlight = !!props.diffViewHighlight;

  const diffFile = useMemo(() => {
    let file: DiffFile | null = null;
    let fromBundle = false;
    if (_diffFile) {
      file = DiffFile.createInstance({});
      file._mergeFullBundle(_diffFile._getFullBundle());
      fromBundle = true;
    } else if (data) {
      file = new DiffFile(
        data?.oldFile?.fileName || "",
        data?.oldFile?.content || "",
        data?.newFile?.fileName || "",
        data?.newFile?.content || "",
        data?.hunks || [],
        data?.oldFile?.fileLang || "",
        data?.newFile?.fileLang || ""
      );
    }
    if (!file) return null;
    return prepareDiffFile(file, {
      theme: diffViewTheme,
      enableHighlight,
      registerHighlighter,
      fromBundle,
    });
  }, [data, _diffFile, diffViewTheme, enableHighlight, registerHighlighter]);

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

  useUnmount(() => ((typeof __DEV__ !== "undefined" ? __DEV__ : false) ? diffFile?._destroy?.() : diffFile?.clear?.()), [
    diffFile,
  ]);

  if (!diffFile) return <view />;

  return (
    <MemoedInternalDiffView
      key={diffFile.getId()}
      {...restProps}
      diffFile={diffFile}
      diffFileId={diffFile.getId()}
      diffViewTheme={diffViewTheme}
      diffViewMode={restProps.diffViewMode || DiffModeEnum.SplitGitHub}
      diffViewFontSize={restProps.diffViewFontSize || 13}
      diffViewWrap={restProps.diffViewWrap ?? true}
    />
  );
};

export const DiffView = DiffViewInner as <T>(props: DiffViewProps<T>) => ReactNode;

export const version = typeof __VERSION__ !== "undefined" ? __VERSION__ : "0.1.0";
