import { createContext, useContext } from "react";

import type { createCodeConfigStore } from "./codeTools";

export const CodeViewContext = createContext<{
  useCodeContext: ReturnType<typeof createCodeConfigStore>;
}>(null);

CodeViewContext.displayName = "CodeViewContext";

export const useCodeViewContext = () => useContext(CodeViewContext);
