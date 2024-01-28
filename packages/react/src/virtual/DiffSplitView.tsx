import { memo, useEffect, useMemo } from "react";
import * as React from "react";
import { createStore, ref } from "reactivity-store";

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
          widgetSide.value = side;
          widgetLineNumber.value = lineNumber;
        };

        return { widgetSide, widgetLineNumber, setWidget };
      }),
    []
  );

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
