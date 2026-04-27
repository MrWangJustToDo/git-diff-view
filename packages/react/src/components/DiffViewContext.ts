import { createContext, useContext } from "react";

import type { createDiffConfigStore } from "./tools";

export const DiffViewContext = createContext<{
  useDiffContext: ReturnType<typeof createDiffConfigStore>;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
}>(null);

DiffViewContext.displayName = "DiffViewContext";

export const useDiffViewContext = () => useContext(DiffViewContext);
