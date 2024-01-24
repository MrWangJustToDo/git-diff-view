import { createContext, useContext } from "react";

import type { SplitSide } from "..";
import type { Dispatch, SetStateAction} from "react";

export type DiffWidgetContextType = {
  widgetSide?: SplitSide;

  widgetLineNumber?: number;
};

export const DiffWidgetContext = createContext<{ widget: DiffWidgetContextType; setWidget: Dispatch<SetStateAction<DiffWidgetContextType>> }>({
  widget: {},
  setWidget: () => void 0,
});

export const useDiffWidgetContext = () => useContext(DiffWidgetContext);
