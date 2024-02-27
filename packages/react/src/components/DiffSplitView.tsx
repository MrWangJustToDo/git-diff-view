import { memo, useEffect, useMemo } from "react";
import * as React from "react";
import { createStore, ref } from "reactivity-store";
import { useSyncExternalStore } from "use-sync-external-store/shim";

import { DiffSplitViewNormal } from "./DiffSplitViewNormal";
import { DiffSplitViewWrap } from "./DiffSplitViewWrap";
import { useDiffViewContext } from "./DiffViewContext";
import { DiffWidgetContext } from "./DiffWidgetContext";

import type { SplitSide } from "./DiffView";
import type { DiffFile } from "@git-diff-view/core";

export const DiffSplitView = memo(({ diffFile }: { diffFile: DiffFile }) => {
  const { useDiffContext } = useDiffViewContext();

  const enableWrap = useDiffContext(React.useCallback((s) => s.enableWrap, []));

  // performance optimization
  const useWidget = useMemo(
    () =>
      createStore(() => {
        const widgetSide = ref<SplitSide>(undefined);

        const widgetLineNumber = ref<number>(undefined);

        const setWidget = ({ side, lineNumber }: { side?: SplitSide; lineNumber?: number }) => {
          const { renderWidgetLine } = useDiffContext.getReadonlyState();

          if (typeof renderWidgetLine !== "function") return;

          widgetSide.value = side;
          
          widgetLineNumber.value = lineNumber;
        };

        return { widgetSide, widgetLineNumber, setWidget };
      }),
    [useDiffContext]
  );

  const contextValue = useMemo(() => ({ useWidget }), [useWidget]);

  useSyncExternalStore(diffFile.subscribe, diffFile.getUpdateCount);

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
