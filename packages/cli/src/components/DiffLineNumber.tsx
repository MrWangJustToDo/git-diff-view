/**
 * DiffLineNumber component - Renders line numbers with proper multi-row support
 * using chalk for ANSI styling.
 *
 * This replaces the complex nested Box/Text structure with a single Text component
 * containing pre-formatted ANSI strings with manual line breaks.
 *
 * Uses React.memo and useMemo for performance optimization.
 */
import { Box, Text } from "ink";
import * as React from "react";

import { buildStyledBlock, type CharStyle } from "./ansiString";

/**
 * Renders a single line number area for split view.
 * Format: [ ][lineNum][ ]
 */
export const DiffSplitLineNumberArea: React.FC<{
  lineNumber?: number;
  width: number;
  height: number;
  backgroundColor: string;
  color: string;
  dim?: boolean;
}> = React.memo(({ lineNumber, width, height, backgroundColor, color, dim = false }) => {
  // Total width: leftPad + num + rightPad = 1 + width + 1
  const totalWidth = width + 2;

  const content = React.useMemo(() => {
    const style: CharStyle = { backgroundColor, color, dim };
    const lines: string[] = [];

    for (let row = 0; row < height; row++) {
      // Left padding + line number (right-aligned) + right padding
      const numPart = row === 0 && lineNumber !== undefined ? lineNumber.toString().padStart(width) : " ".repeat(width);
      const lineText = ` ${numPart} `;
      lines.push(buildStyledBlock(lineText, totalWidth, 1, style, "left"));
    }

    return lines.join("\n");
  }, [lineNumber, width, height, backgroundColor, color, dim, totalWidth]);

  return (
    <Box width={totalWidth} flexShrink={0}>
      <Text wrap="truncate">{content}</Text>
    </Box>
  );
});

DiffSplitLineNumberArea.displayName = "DiffSplitLineNumberArea";

/**
 * Renders the complete line number area for unified view (old + new line numbers).
 * Format: [oldNum] [newNum]
 */
export const DiffUnifiedLineNumberArea: React.FC<{
  oldLineNumber?: number;
  newLineNumber?: number;
  width: number;
  height: number;
  backgroundColor: string;
  color: string;
  dim?: boolean;
}> = React.memo(({ oldLineNumber, newLineNumber, width, height, backgroundColor, color, dim = false }) => {
  // Total width: oldNum + separator + newNum + separator = width + 1 + width + 1
  const totalWidth = width * 2 + 2;

  const content = React.useMemo(() => {
    const style: CharStyle = { backgroundColor, color, dim };
    const lines: string[] = [];

    for (let row = 0; row < height; row++) {
      // Old number (right-aligned) + separator + new number (right-aligned) + separator
      const oldPart =
        row === 0 && oldLineNumber !== undefined ? oldLineNumber.toString().padStart(width) : " ".repeat(width);
      const newPart =
        row === 0 && newLineNumber !== undefined ? newLineNumber.toString().padStart(width) : " ".repeat(width);
      const lineText = `${oldPart} ${newPart} `;
      lines.push(buildStyledBlock(lineText, totalWidth, 1, style, "left"));
    }

    return lines.join("\n");
  }, [oldLineNumber, newLineNumber, width, height, backgroundColor, color, dim, totalWidth]);

  return (
    <Box width={totalWidth} flexShrink={0}>
      <Text wrap="truncate">{content}</Text>
    </Box>
  );
});

DiffUnifiedLineNumberArea.displayName = "DiffUnifiedLineNumberArea";

/**
 * Renders an empty area (for split view when one side has no content).
 */
export const DiffEmptyArea: React.FC<{
  width: number;
  height: number;
  backgroundColor: string;
}> = React.memo(({ width, height, backgroundColor }) => {
  const content = React.useMemo(() => {
    const style: CharStyle = { backgroundColor };
    const lines: string[] = [];

    for (let row = 0; row < height; row++) {
      lines.push(buildStyledBlock("", width, 1, style, "left"));
    }

    return lines.join("\n");
  }, [width, height, backgroundColor]);

  return (
    <Box width={width}>
      <Text wrap="truncate">{content}</Text>
    </Box>
  );
});

DiffEmptyArea.displayName = "DiffEmptyArea";
