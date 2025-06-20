import { createContext, useContext } from "solid-js";

import type { SplitSide } from "..";
import type { Accessor, Setter } from "solid-js";

export const DiffWidgetContext =
  createContext<
    [Accessor<{ side?: SplitSide; lineNumber?: number }>, Setter<{ side?: SplitSide; lineNumber?: number }>]
  >();

export const useDiffWidgetContext = () => useContext(DiffWidgetContext);
