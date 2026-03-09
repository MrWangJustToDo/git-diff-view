import { measureElement } from "ink";
import { useLayoutEffect, useState } from "react";

import { useCodeViewContext } from "../components/CodeViewContext";

import type { DOMElement } from "ink";

const TERMINAL_PADDING_X = 4;

export function useCodeTerminalSize(): { columns: number; rows: number } {
  const { useCodeContext } = useCodeViewContext();

  const wrapper = useCodeContext((s) => s.wrapper);

  const [size, setSize] = useState({
    columns: 0,
    rows: process.stdout.rows || 20,
  });

  useLayoutEffect(() => {
    function updateSize() {
      const terminalWidth = (process.stdout.columns || 60) - TERMINAL_PADDING_X;

      let width = terminalWidth;

      if (wrapper.current) {
        width = measureElement(wrapper.current as DOMElement).width;
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
