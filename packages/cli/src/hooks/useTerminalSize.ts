import { measureElement } from "ink";
import { useEffect, useState } from "react";

import { useDiffViewContext } from "../components/DiffViewContext";

import type { DOMElement } from "ink";

const TERMINAL_PADDING_X = 4;

const getValidColumns = (columns: number): number => {
  if (columns % 2 === 0) {
    return columns;
  } else {
    return columns - 1; // Ensure even number of columns
  }
};

export function useTerminalSize(): { columns: number; rows: number } {
  const { useDiffContext } = useDiffViewContext();

  const wrapper = useDiffContext((s) => s.wrapper);

  const [size, setSize] = useState({
    columns: 0,
    rows: process.stdout.rows || 20,
  });

  useEffect(() => {
    function updateSize() {
      const terminalWidth = getValidColumns((process.stdout.columns || 60) - TERMINAL_PADDING_X);

      let width = terminalWidth;

      if (wrapper.current) {
        width = getValidColumns(measureElement(wrapper.current as DOMElement).width);
      }

      width = Math.min(width, terminalWidth);

      setSize({
        columns: width,
        rows: process.stdout.rows || 20,
      });
    }

    updateSize();

    process.stdout.on("resize", updateSize);
    return () => {
      process.stdout.off("resize", updateSize);
    };
  }, [wrapper]);

  return size;
}
