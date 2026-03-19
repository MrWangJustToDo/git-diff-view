import { measureElement } from "ink";
import { useLayoutEffect, useState } from "react";

import { useDiffViewContext } from "../components/DiffViewContext";

import type { DOMElement } from "ink";

export const TERMINAL_PADDING_X = 4;

export const getValidColumns = (columns: number): number => {
  if (columns % 2 === 0) {
    return columns;
  } else {
    return columns - 1; // Ensure even number of columns
  }
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export const debounce = <T extends Function>(action: T, time: number): T => {
  let id: NodeJS.Timeout | null = null;
  return ((...args) => {
    clearTimeout(id);
    id = setTimeout(() => action.call(null, ...args), time);
  }) as unknown as T;
};

export function useTerminalSize(): { columns: number } {
  const { useDiffContext } = useDiffViewContext();

  const wrapper = useDiffContext((s) => s.wrapper);

  const [size, setSize] = useState(() => getValidColumns((process?.stdout?.columns || 60) - TERMINAL_PADDING_X));

  useDiffContext.useShallowStableSelector(
    (s) => s.width,
    (p, c) => typeof p === typeof c
  );

  const hasWidth = typeof useDiffContext.getReadonlyState().width === "number";

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
  }, [wrapper, hasWidth]);

  return { columns: size };
}
