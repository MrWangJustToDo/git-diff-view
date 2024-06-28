import { createContext, useContext } from "react";

import type { createDiffConfigStore } from "./tools";

export enum DiffModeEnum {
  // github like
  SplitGitHub = 1,
  // gitlab like
  SplitGitLab = 2,
  Split = 1 | 2,
  Unified = 4,
}

export const DiffViewContext = createContext<{
  useDiffContext: ReturnType<typeof createDiffConfigStore>;
}>(null);

DiffViewContext.displayName = "DiffViewContext";

export const useDiffViewContext = () => useContext(DiffViewContext);
