import { createContext, useContext } from "solid-js";

import type { SplitSide } from "..";
import type { Accessor} from "solid-js";

export const DiffWidgetContext = createContext<Accessor<{ side?: SplitSide; lineNumber?: number }>>();

export const useDiffWidgetContext = () => useContext(DiffWidgetContext);
