import { createContext, useContext } from "octane";

import type { createDiffConfigStore } from "./tools";

export const DiffViewContext = createContext<{
  useDiffContext: ReturnType<typeof createDiffConfigStore>;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
}>(null);

export const useDiffViewContext = () => useContext(DiffViewContext);
