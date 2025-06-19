import { createContext, useContext } from "solid-js";

import type { createDiffConfigStore } from "./tools";

export const DiffViewContext = createContext<ReturnType<typeof createDiffConfigStore>>();

export const useDiffViewContext = () => useContext(DiffViewContext);
