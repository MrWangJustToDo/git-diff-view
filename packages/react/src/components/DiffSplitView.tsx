import { memo, useEffect, useMemo, useRef } from "react";
import * as React from "react";

import { DiffSplitViewNormal } from "./DiffSplitViewNormal";
import { DiffSplitViewWrap } from "./DiffSplitViewWrap";
import { useDiffViewContext } from "./DiffViewContext";
import { DiffWidgetContext } from "./DiffWidgetContext";
import { createDiffWidgetStore } from "./tools";

import type { DiffFile } from "@git-diff-view/core";

export const DiffSplitView = memo(({ diffFile }: { diffFile: DiffFile }) => {
  const { useDiffContext } = useDiffViewContext();

  const useDiffContextRef = useRef(useDiffContext);

  useDiffContextRef.current = useDiffContext;

  const enableWrap = useDiffContext.useShallowStableSelector((s) => s.enableWrap);

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
