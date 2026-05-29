/**
 * Utility for building ANSI-styled strings for proper character-level wrapping in Ink.
 *
 * When using multiple <Text> components inside a <Box flexWrap="wrap">, Yoga layout
 * treats each <Text> as a flex item and tries to keep them together. This causes
 * word-level wrapping instead of character-level wrapping.
 *
 * By building a single string with ANSI escape codes, Ink's wrap-ansi (with hard: true)
 * will properly break at character boundaries.
 *
 * Uses:
 * - chalk for ANSI code generation - cleaner and more maintainable than raw escape codes
 * - string-width for accurate character width calculation (handles CJK, emoji, etc.)
 */

import chalk from "chalk";
import stringWidth from "string-width";

export interface CharStyle {
  color?: string; // hex color for foreground
  backgroundColor?: string; // hex color for background
  dim?: boolean;
}

export type StyledChar = { char: string; style?: CharStyle };

export function styleText(text: string, style?: CharStyle): string {
  if (!style) return text;

  let styledChalk = chalk;

  if (style.backgroundColor) {
    styledChalk = styledChalk.bgHex(style.backgroundColor);
  }
  if (style.color) {
    styledChalk = styledChalk.hex(style.color);
  }
  if (style.dim) {
    styledChalk = styledChalk.dim;
  }

  return styledChalk(text);
}

/**
 * Optimized version that batches consecutive characters with the same style.
 * More efficient for long strings with few style changes.
 */
export function buildAnsiStringOptimized(chars: Array<{ char: string; style?: CharStyle }>): string {
  if (chars.length === 0) return "";

  const segments: Array<{ text: string; style?: CharStyle }> = [];
  let currentSegment = { text: "", style: chars[0]?.style };

  for (const { char, style } of chars) {
    const sameStyle =
      currentSegment.style?.color === style?.color &&
      currentSegment.style?.backgroundColor === style?.backgroundColor &&
      currentSegment.style?.dim === style?.dim;

    if (sameStyle) {
      currentSegment.text += char;
    } else {
      if (currentSegment.text) {
        segments.push(currentSegment);
      }
      currentSegment = { text: char, style };
    }
  }

  if (currentSegment.text) {
    segments.push(currentSegment);
  }

  return segments.map((segment) => styleText(segment.text, segment.style)).join("");
}

/**
 * Build ANSI string with manual line breaks at exact character boundaries.
 * This bypasses wrap-ansi's word-boundary logic by pre-inserting newlines.
 *
 * @param chars - Array of characters with styles
 * @param width - Maximum width per line (in characters)
 * @returns ANSI string with newlines inserted at width boundaries
 */
export function buildAnsiStringWithLineBreaks(
  chars: Array<{ char: string; style?: CharStyle }>,
  width: number
): string {
  if (chars.length === 0 || width <= 0) return "";

  // Split into lines at width boundaries
  const lines: Array<Array<{ char: string; style?: CharStyle }>> = [];
  let currentLine: Array<{ char: string; style?: CharStyle }> = [];
  let currentWidth = 0;

  for (const charData of chars) {
    // Get the display width of the character using string-width
    // Handles CJK, emoji, ANSI codes, and other edge cases correctly
    const charWidth = stringWidth(charData.char);

    if (currentWidth + charWidth > width && currentLine.length > 0) {
      // Start a new line
      lines.push(currentLine);
      currentLine = [];
      currentWidth = 0;
    }

    currentLine.push(charData);
    currentWidth += charWidth;
  }

  // Don't forget the last line
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  // Build each line as an ANSI string and join with newlines
  return lines.map((line) => buildAnsiStringOptimized(line)).join("\n");
}

function padRow(row: StyledChar[], currentWidth: number, width: number, padStyle: CharStyle): StyledChar[] {
  const remaining = width - currentWidth;
  if (remaining > 0) {
    return [...row, { char: " ".repeat(remaining), style: padStyle }];
  }
  return row;
}

/**
 * Split styled chars into rows of at most `width` display-columns.
 * Each row is padded with bg-styled spaces to exactly `width`.
 */
export function splitCharsIntoRows(chars: StyledChar[], width: number, padStyle: CharStyle): StyledChar[][] {
  const rows: StyledChar[][] = [];
  let currentRow: StyledChar[] = [];
  let currentWidth = 0;

  for (const ch of chars) {
    const w = stringWidth(ch.char);
    if (currentWidth + w > width && currentRow.length > 0) {
      rows.push(padRow(currentRow, currentWidth, width, padStyle));
      currentRow = [];
      currentWidth = 0;
    }
    currentRow.push(ch);
    currentWidth += w;
  }

  rows.push(padRow(currentRow, currentWidth, width, padStyle));
  return rows;
}

/**
 * Create a styled block with consistent background across all rows.
 * Each row has fixed width, filled with spaces if needed.
 *
 * @param text - Text to display on first row
 * @param width - Width of each row
 * @param height - Number of rows
 * @param style - Style to apply
 * @param align - Text alignment ('left' | 'right')
 * @returns ANSI string with newlines
 */
export function buildStyledBlock(
  text: string,
  width: number,
  height: number,
  style: CharStyle,
  align: "left" | "right" = "left"
): string {
  const lines: string[] = [];
  const paddedText = align === "right" ? text.padStart(width) : text.padEnd(width);

  for (let row = 0; row < height; row++) {
    const lineText = row === 0 ? paddedText : " ".repeat(width);
    lines.push(styleText(lineText, style));
  }

  return lines.join("\n");
}
