import { createContext, useContext } from "react";

import type { createCodeConfigStore } from "./codeTools";

export const CodeViewContext = createContext<{
  useCodeContext: ReturnType<typeof createCodeConfigStore>;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
}>(null);

CodeViewContext.displayName = "CodeViewContext";

export const useCodeViewContext = () => useContext(CodeViewContext);
