import { memo, useEffect, useMemo, useRef, useCallback } from "react";
import * as React from "react";

import { useDiffViewContext } from "../DiffViewContext";
import { DiffWidgetContext } from "../DiffWidgetContext";
import { createDiffWidgetStore } from "../tools";

import { DiffSplitViewNormal } from "./DiffSplitViewNormal_v2";
import { DiffSplitViewWrap } from "./DiffSplitViewWrap_v2";

import type { DiffFile } from "@git-diff-view/core";

export const DiffSplitView = memo(({ diffFile }: { diffFile: DiffFile }) => {
  const { useDiffContext } = useDiffViewContext();

  const useDiffContextRef = useRef(useDiffContext);

  useDiffContextRef.current = useDiffContext;

  const enableWrap = useDiffContext(useCallback((s) => s.enableWrap, []));

  // performance optimization
  const useWidget = useMemo(() => createDiffWidgetStore(useDiffContextRef), []);

  const contextValue = useMemo(() => ({ useWidget }), [useWidget]);

  useEffect(() => {
    const { setWidget } = useWidget.getReadonlyState();

    setWidget({});
  }, [diffFile, useWidget]);

  return (
    <DiffWidgetContext.Provider value={contextValue}>
      {enableWrap ? <DiffSplitViewWrap diffFile={diffFile} /> : <DiffSplitViewNormal diffFile={diffFile} />}
    </DiffWidgetContext.Provider>
  );
});

DiffSplitView.displayName = "DiffSplitView";
