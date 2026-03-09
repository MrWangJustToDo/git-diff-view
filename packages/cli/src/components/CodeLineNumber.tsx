/**
 * CodeLineNumber component - Renders line numbers with proper multi-row support
 * using chalk for ANSI styling.
 *
 * Simplified version of DiffLineNumber for code view.
 */
import { Box, Text } from "ink";
import * as React from "react";

import { buildStyledBlock, type CharStyle } from "./ansiString";

/**
 * Renders a single line number area for code view.
 * Format: [ ][lineNum][ ]
 */
export const CodeLineNumberArea: React.FC<{
  lineNumber: number;
  lineNumWidth: number;
  height: number;
  backgroundColor: string;
  color: string;
  dim?: boolean;
}> = React.memo(({ lineNumber, lineNumWidth, height, backgroundColor, color, dim = false }) => {
  // Total width: leftPad + num + rightPad = 1 + lineNumWidth + 1
  const totalWidth = lineNumWidth + 2;

  const content = React.useMemo(() => {
    const style: CharStyle = { backgroundColor, color, dim };
    const lines: string[] = [];

    for (let row = 0; row < height; row++) {
      // Left padding + line number (right-aligned) + right padding
      const numPart = row === 0 ? lineNumber.toString().padStart(lineNumWidth) : " ".repeat(lineNumWidth);
      const lineText = ` ${numPart} `;
      lines.push(buildStyledBlock(lineText, totalWidth, 1, style, "left"));
    }

    return lines.join("\n");
  }, [lineNumber, lineNumWidth, height, backgroundColor, color, dim, totalWidth]);

  return (
    <Box width={totalWidth} flexShrink={0}>
      <Text wrap="truncate">{content}</Text>
    </Box>
  );
});

CodeLineNumberArea.displayName = "CodeLineNumberArea";
