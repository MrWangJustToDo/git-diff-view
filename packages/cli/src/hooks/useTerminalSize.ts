import { useEffect, useState } from "react";

const TERMINAL_PADDING_X = 4;

const getValidColumns = (columns: number): number => {
  if (columns % 2 === 0) {
    return columns;
  } else {
    return columns - 1; // Ensure even number of columns
  }
};

export function useTerminalSize(): { columns: number; rows: number } {
  const [size, setSize] = useState({
    columns: getValidColumns((process.stdout.columns || 60) - TERMINAL_PADDING_X),
    rows: process.stdout.rows || 20,
  });

  useEffect(() => {
    function updateSize() {
      setSize({
        columns: getValidColumns((process.stdout.columns || 60) - TERMINAL_PADDING_X),
        rows: process.stdout.rows || 20,
      });
    }

    process.stdout.on("resize", updateSize);
    return () => {
      process.stdout.off("resize", updateSize);
    };
  }, []);

  return size;
}
