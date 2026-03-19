import { measureElement } from "ink";
import { useLayoutEffect, useState } from "react";

import { useCodeViewContext } from "../components/CodeViewContext";

import { debounce, getValidColumns, TERMINAL_PADDING_X } from "./useTerminalSize";

import type { DOMElement } from "ink";

export function useCodeTerminalSize(): { columns: number } {
  const { useCodeContext } = useCodeViewContext();

  const wrapper = useCodeContext((s) => s.wrapper);

  const [size, setSize] = useState(() => getValidColumns((process.stdout.columns || 60) - TERMINAL_PADDING_X));

  useCodeContext.useShallowStableSelector(
    (s) => s.width,
    (p, c) => typeof p === typeof c
  );

  const hasWidth = typeof useCodeContext.getReadonlyState().width === "number";

  useLayoutEffect(() => {
    if (hasWidth) return;

    function updateSize() {
      const terminalWidth = getValidColumns((process.stdout.columns || 60) - TERMINAL_PADDING_X);

      let width = terminalWidth;

      if (wrapper.current) {
        width = getValidColumns(measureElement(wrapper.current as DOMElement).width);
      }

      width = Math.min(width, terminalWidth);

      setSize(width);
    }

    const debounceUpdate = debounce(updateSize, 200);

    process.stdout.on("resize", debounceUpdate);
    return () => {
      process.stdout.off("resize", debounceUpdate);
    };
  }, [hasWidth, wrapper]);

  return { columns: size };
}
