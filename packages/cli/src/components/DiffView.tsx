import { DiffFile, _cacheMap, SplitSide } from "@git-diff-view/core";
import { DiffModeEnum } from "@git-diff-view/utils";
import { Box } from "ink";
import React, { memo, useEffect, useMemo, useRef } from "react";

import { useIsMounted } from "../hooks/useIsMounted";
import { useUnmount } from "../hooks/useUnmount";

import { DiffSplitView } from "./DiffSplitView";
import { DiffUnifiedView } from "./DiffUnifiedView";
import { DiffViewContext } from "./DiffViewContext";
import { createDiffConfigStore } from "./tools";

import type { DiffHighlighterLang } from "@git-diff-view/core";

_cacheMap.name = "@git-diff-view/cli";

export { SplitSide, DiffModeEnum };

export type DiffViewProps = {
  data?: {
    oldFile?: { fileName?: string | null; fileLang?: DiffHighlighterLang | string | null; content?: string | null };
    newFile?: { fileName?: string | null; fileLang?: DiffHighlighterLang | string | null; content?: string | null };
    hunks: string[];
  };
  diffFile?: DiffFile;
  diffViewMode?: DiffModeEnum;
  diffViewTheme?: "light" | "dark";
  diffViewHighlight?: boolean;
};

type DiffViewProps_1 = Omit<DiffViewProps, "data"> & {
  data?: {
    oldFile?: { fileName?: string | null; fileLang?: DiffHighlighterLang | null; content?: string | null };
    newFile?: { fileName?: string | null; fileLang?: DiffHighlighterLang | null; content?: string | null };
    hunks: string[];
  };
};

type DiffViewProps_2 = Omit<DiffViewProps, "data"> & {
  data?: {
    oldFile?: { fileName?: string | null; fileLang?: string | null; content?: string | null };
    newFile?: { fileName?: string | null; fileLang?: string | null; content?: string | null };
    hunks: string[];
  };
};

const InternalDiffView = (
  props: Omit<DiffViewProps, "data"> & {
    isMounted: boolean;
  }
) => {
  const { diffFile, diffViewMode, diffViewHighlight, isMounted } = props;

  const diffFileId = useMemo(() => diffFile.getId(), [diffFile]);

  // performance optimization
  const useDiffContext = useMemo(() => createDiffConfigStore(props, diffFileId), []);

  useEffect(() => {
    const { id, setId, mode, setMode, mounted, setMounted, enableHighlight, setEnableHighlight } =
      useDiffContext.getReadonlyState();

    if (diffFileId && diffFileId !== id) {
      setId(diffFileId);
    }

    if (diffViewMode && diffViewMode !== mode) {
      setMode(diffViewMode);
    }

    if (mounted !== isMounted) {
      setMounted(isMounted);
    }

    if (diffViewHighlight !== enableHighlight) {
      setEnableHighlight(diffViewHighlight);
    }
  }, [useDiffContext, diffViewHighlight, diffViewMode, diffFileId, isMounted]);

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
          <DiffSplitView diffFile={diffFile} />
        ) : (
          <DiffUnifiedView diffFile={diffFile} />
        )}
      </Box>
    </DiffViewContext.Provider>
  );
};

const MemoedInternalDiffView = memo(InternalDiffView);

const DiffViewWithRef = (props: DiffViewProps) => {
  const { data, diffViewTheme, diffFile: _diffFile, ...restProps } = props;

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

  const isMounted = useIsMounted();

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
      diffFile.initSyntax();
      diffFile.notifyAll();
    }
  }, [diffFile, props.diffViewHighlight, props.diffViewTheme]);

  // fix react strict mode error
  useUnmount(() => (__DEV__ ? diffFile?._destroy?.() : diffFile?.clear?.()), [diffFile]);

  if (!diffFile) return null;

  return (
    <MemoedInternalDiffView
      key={diffFile.getId()}
      {...restProps}
      diffFile={diffFile}
      isMounted={isMounted}
      diffViewTheme={diffViewTheme}
      diffViewMode={restProps.diffViewMode || DiffModeEnum.SplitGitHub}
    />
  );
};

// type helper function
function ReactDiffView(props: DiffViewProps_1): JSX.Element;
function ReactDiffView(props: DiffViewProps_2): JSX.Element;
function ReactDiffView(props: DiffViewProps) {
  return <DiffViewWithRef {...props} />;
}

export const DiffView = ReactDiffView;

export const version = __VERSION__;
