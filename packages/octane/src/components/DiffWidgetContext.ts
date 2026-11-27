import { createContext, useContext } from "octane";

import type { SplitSide } from "..";
import type { Ref, UseSelectorWithStore } from "reactivity-store/octane";

export const DiffWidgetContext = createContext<{
  useWidget: UseSelectorWithStore<{
    widgetSide: Ref<SplitSide | undefined>;
    widgetLineNumber: Ref<number | undefined>;

    setWidget: (props: { side?: SplitSide; lineNumber?: number }) => void;
  }>;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
}>(null);

export const useDiffWidgetContext = () => useContext(DiffWidgetContext);
