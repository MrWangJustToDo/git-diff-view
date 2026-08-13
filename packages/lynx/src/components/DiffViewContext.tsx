import { createContext as _createContext, useContext } from "@lynx-js/react";
import type { createContext as createReactContext } from "react";

import type { createDiffConfigStore } from "./tools";

const createContext = _createContext as typeof createReactContext;

export const DiffViewContext = createContext<{
  useDiffContext: ReturnType<typeof createDiffConfigStore>;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
}>(null);

DiffViewContext.displayName = "DiffViewContext";

export const useDiffViewContext = () => useContext(DiffViewContext);
