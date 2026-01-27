/* eslint-disable max-lines */
import { DiffLineType } from "@git-diff-view/core";
import { memoFunc, NewLineSymbol } from "@git-diff-view/utils";
import { Box, Text } from "ink";
import * as React from "react";

import { buildAnsiStringWithLineBreaks, buildStyledBlock, type CharStyle } from "./ansiString";
import {
  diffAddContent,
  diffAddContentHighlight,
  diffDelContent,
  diffDelContentHighlight,
  diffExpandContent,
  diffPlainContent,
  GitHubDark,
  GitHubLight,
} from "./color";
import { useDiffViewContext } from "./DiffViewContext";

import type { DiffFile, DiffLine, File } from "@git-diff-view/core";

// Helper to get tab width value
const getTabWidthValue = (tabWidth: "small" | "medium" | "large"): number => {
  return tabWidth === "small" ? 1 : tabWidth === "medium" ? 2 : 4;
};

// Process a string into styled characters for ANSI output
const processCharsForAnsi = (
  str: string,
  enableTabSpace: boolean,
  tabWidth: "small" | "medium" | "large",
  baseStyle: CharStyle,
  highlightStyle?: CharStyle
): Array<{ char: string; style?: CharStyle }> => {
  const result: Array<{ char: string; style?: CharStyle }> = [];
  const style = highlightStyle || baseStyle;
  const tabWidthValue = getTabWidthValue(tabWidth);

  for (const char of str) {
    if (enableTabSpace && char === " ") {
      // Show space as dimmed dot
      result.push({ char: "·", style: { ...style, dim: true } });
    } else if (char === "\t") {
      if (enableTabSpace) {
        // Show tab as arrow followed by spaces
        result.push({ char: "→", style: { ...style, dim: true } });
        for (let i = 1; i < tabWidthValue; i++) {
          result.push({ char: " ", style });
        }
      } else {
        // Just show spaces for tab
        for (let i = 0; i < tabWidthValue; i++) {
          result.push({ char: " ", style });
        }
      }
    } else {
      result.push({ char, style });
    }
  }

  return result;
};

// for shiki highlighter
export const getStyleObjectFromString = memoFunc((str: string) => {
  const re = { light: {}, dark: {} };
  if (!str) return re;
  str.split(";").forEach((el) => {
    const [property, value] = el.split(":");
    if (!property) return;
    if (property.trim()?.endsWith("light")) {
      re["light"]["color"] = value.trim();
      return;
    }
    if (property.trim()?.endsWith("dark")) {
      re["dark"]["color"] = value.trim();
      return;
    }
  });
  return re;
});

// for lowlight highlighter
export const getStyleFromClassName = memoFunc((className: string) => {
  const re = { light: {}, dark: {} };
  if (!className) return re;
  className.split(" ").forEach((name) => {
    const dark = GitHubDark[name] || {};
    const light = GitHubLight[name] || {};
    Object.assign(re.dark, dark);
    Object.assign(re.light, light);
  });
  return re;
});

/**
 * DiffString component using ANSI escape codes for proper character-level wrapping.
 *
 * The key insight: When using multiple <Text> components inside a <Box flexWrap="wrap">,
 * Yoga layout treats each <Text> as a flex item and tries to keep them together as "words".
 *
 * Solution: Build a single string with ANSI escape codes. Ink's wrap-ansi (with hard: true)
 * will break at character boundaries, giving us the desired character-level wrapping.
 */
const DiffString = React.memo(
  ({
    bg,
    width,
    theme,
    rawLine,
    diffLine,
    operator,
  }: {
    bg: string;
    width: number;
    theme: "light" | "dark";
    height: number;
    rawLine: string;
    diffLine?: DiffLine;
    operator?: "add" | "del";
    plainLine?: File["plainFile"][number];
  }) => {
    const changes = diffLine?.changes;

    const { useDiffContext } = useDiffViewContext();

    const { enableTabSpace, tabWidth } = useDiffContext((s) => ({ enableTabSpace: s.tabSpace, tabWidth: s.tabWidth }));

    // Memoize the ANSI content to avoid rebuilding on every render
    const ansiContent = React.useMemo(() => {
      const chars: Array<{ char: string; style?: CharStyle }> = [];
      const baseStyle: CharStyle = { backgroundColor: bg };

      if (changes?.hasLineChange) {
        const range = changes.range;
        const str1 = rawLine.slice(0, range.location);
        const str2 = rawLine.slice(range.location, range.location + range.length);
        const str3 = rawLine.slice(range.location + range.length);

        const highlightBG =
          operator === "add"
            ? theme === "light"
              ? diffAddContentHighlight.light
              : diffAddContentHighlight.dark
            : theme === "light"
              ? diffDelContentHighlight.light
              : diffDelContentHighlight.dark;

        const highlightStyle: CharStyle = { backgroundColor: highlightBG };

        // Process str1 (before change)
        chars.push(...processCharsForAnsi(str1, enableTabSpace, tabWidth, baseStyle));
        // Process str2 (the changed part with highlight)
        chars.push(...processCharsForAnsi(str2, enableTabSpace, tabWidth, baseStyle, highlightStyle));
        // Process str3 (after change)
        chars.push(...processCharsForAnsi(str3, enableTabSpace, tabWidth, baseStyle));

        // Add newline symbol indicator if needed
        if (changes.newLineSymbol === NewLineSymbol.NEWLINE) {
          const noNewlineText = "\\ No newline at end of file";
          for (const char of noNewlineText) {
            chars.push({ char, style: baseStyle });
          }
        }
      } else {
        // No line changes, just process the whole line
        chars.push(...processCharsForAnsi(rawLine, enableTabSpace, tabWidth, baseStyle));
      }

      // Use width - 1 because the operator column takes 1 character
      return buildAnsiStringWithLineBreaks(chars, width - 1);
    }, [bg, width, theme, rawLine, changes, operator, enableTabSpace, tabWidth]);

    return (
      <Box width={width - 1} backgroundColor={bg}>
        <Text wrap="truncate">{ansiContent}</Text>
      </Box>
    );
  }
);

DiffString.displayName = "DiffString";

/**
 * Helper function to process syntax-highlighted characters for ANSI output.
 * Handles both lowlight (class-based) and shiki (style-based) highlighting.
 */
const processSyntaxCharsForAnsi = (
  str: string,
  enableTabSpace: boolean,
  tabWidth: "small" | "medium" | "large",
  baseStyle: CharStyle,
  syntaxColor?: string,
  highlightBg?: string
): Array<{ char: string; style?: CharStyle }> => {
  const result: Array<{ char: string; style?: CharStyle }> = [];
  const tabWidthValue = getTabWidthValue(tabWidth);

  for (const char of str) {
    const style: CharStyle = {
      ...baseStyle,
      color: syntaxColor || baseStyle.color,
      backgroundColor: highlightBg || baseStyle.backgroundColor,
    };

    if (enableTabSpace && char === " ") {
      result.push({ char: "·", style: { ...style, dim: true } });
    } else if (char === "\t") {
      if (enableTabSpace) {
        result.push({ char: "→", style: { ...style, dim: true } });
        for (let i = 1; i < tabWidthValue; i++) {
          result.push({ char: " ", style });
        }
      } else {
        for (let i = 0; i < tabWidthValue; i++) {
          result.push({ char: " ", style });
        }
      }
    } else {
      result.push({ char, style });
    }
  }

  return result;
};

/**
 * DiffSyntax component using ANSI escape codes for proper character-level wrapping
 * with syntax highlighting support.
 */
const DiffSyntax = React.memo(
  ({
    bg,
    width,
    theme,
    height,
    rawLine,
    diffLine,
    operator,
    syntaxLine,
  }: {
    bg: string;
    width: number;
    theme: "light" | "dark";
    height: number;
    rawLine: string;
    diffLine?: DiffLine;
    syntaxLine?: File["syntaxFile"][number];
    operator?: "add" | "del";
  }) => {
    const { useDiffContext } = useDiffViewContext();

    const { enableTabSpace, tabWidth } = useDiffContext((s) => ({ enableTabSpace: s.tabSpace, tabWidth: s.tabWidth }));

    // Memoize the ANSI content with syntax highlighting
    const ansiContent = React.useMemo(() => {
      if (!syntaxLine) {
        return null; // Will render DiffString instead
      }

      const changes = diffLine?.changes;
      const chars: Array<{ char: string; style?: CharStyle }> = [];
      const baseStyle: CharStyle = { backgroundColor: bg };

      const highlightBG =
        operator === "add"
          ? theme === "light"
            ? diffAddContentHighlight.light
            : diffAddContentHighlight.dark
          : theme === "light"
            ? diffDelContentHighlight.light
            : diffDelContentHighlight.dark;

      const range = changes?.hasLineChange ? changes.range : null;

      for (const { node, wrapper } of syntaxLine.nodeList || []) {
        // Get syntax color from lowlight or shiki
        const lowlightStyles = getStyleFromClassName(wrapper?.properties?.className?.join(" ") || "");
        const lowlightStyle = theme === "dark" ? lowlightStyles.dark : lowlightStyles.light;
        const shikiStyles = getStyleObjectFromString(wrapper?.properties?.style || "");
        const shikiStyle = theme === "dark" ? shikiStyles.dark : shikiStyles.light;

        // Determine the syntax color (shiki style takes precedence)
        const syntaxColor = (shikiStyle as { color?: string })?.color || (lowlightStyle as { color?: string })?.color;

        if (!range) {
          // No line changes, just apply syntax highlighting
          chars.push(
            ...processSyntaxCharsForAnsi(node.value, enableTabSpace, tabWidth, { ...baseStyle, color: syntaxColor })
          );
        } else {
          // Has line changes, need to handle highlighting ranges
          if (node.endIndex < range.location || range.location + range.length < node.startIndex) {
            // Node is completely outside the change range
            chars.push(
              ...processSyntaxCharsForAnsi(node.value, enableTabSpace, tabWidth, { ...baseStyle, color: syntaxColor })
            );
          } else {
            // Node overlaps with the change range
            const index1 = range.location - node.startIndex;
            const index2 = index1 < 0 ? 0 : index1;
            const str1 = node.value.slice(0, index2);
            const str2 = node.value.slice(index2, index1 + range.length);
            const str3 = node.value.slice(index1 + range.length);

            // Before highlight
            if (str1) {
              chars.push(
                ...processSyntaxCharsForAnsi(str1, enableTabSpace, tabWidth, { ...baseStyle, color: syntaxColor })
              );
            }
            // Highlighted part
            if (str2) {
              chars.push(
                ...processSyntaxCharsForAnsi(
                  str2,
                  enableTabSpace,
                  tabWidth,
                  { ...baseStyle, color: syntaxColor },
                  syntaxColor,
                  highlightBG
                )
              );
            }
            // After highlight
            if (str3) {
              chars.push(
                ...processSyntaxCharsForAnsi(str3, enableTabSpace, tabWidth, { ...baseStyle, color: syntaxColor })
              );
            }
          }
        }
      }

      // Add newline symbol indicator if needed
      if (changes?.hasLineChange && changes.newLineSymbol === NewLineSymbol.NEWLINE) {
        const noNewlineText = "\\ No newline at end of file";
        for (const char of noNewlineText) {
          chars.push({ char, style: baseStyle });
        }
      }

      // Use width - 1 because the operator column takes 1 character
      return buildAnsiStringWithLineBreaks(chars, width - 1);
    }, [bg, width, theme, rawLine, diffLine, operator, syntaxLine, enableTabSpace, tabWidth]);

    // Fallback to DiffString if no syntax line
    if (!syntaxLine) {
      return (
        <DiffString
          bg={bg}
          width={width}
          theme={theme}
          height={height}
          rawLine={rawLine}
          diffLine={diffLine}
          operator={operator}
        />
      );
    }

    return (
      <Box width={width - 1} backgroundColor={bg}>
        <Text wrap="truncate">{ansiContent}</Text>
      </Box>
    );
  }
);

DiffSyntax.displayName = "DiffSyntax";

/**
 * DiffOperator component - Renders the operator column (+, -, or space)
 * using chalk for proper multi-row support.
 */
const DiffOperator = React.memo(
  ({ operatorChar, height, backgroundColor }: { operatorChar: string; height: number; backgroundColor: string }) => {
    const content = React.useMemo(() => {
      const lines: string[] = [];
      const style: CharStyle = { backgroundColor };

      for (let row = 0; row < height; row++) {
        // Only show operator on first row, spaces on subsequent rows
        const char = row === 0 ? operatorChar : " ";
        lines.push(buildStyledBlock(char, 1, 1, style, "left"));
      }

      return lines.join("\n");
    }, [operatorChar, height, backgroundColor]);

    return (
      <Box width={1} flexShrink={0}>
        <Text wrap="truncate">{content}</Text>
      </Box>
    );
  }
);

DiffOperator.displayName = "DiffOperator";

export const DiffContent = React.memo(
  ({
    theme,
    width,
    height,
    diffLine,
    rawLine,
    plainLine,
    syntaxLine,
    enableHighlight,
  }: {
    width: number;
    height: number;
    theme: "light" | "dark";
    rawLine: string;
    plainLine?: File["plainFile"][number];
    syntaxLine?: File["syntaxFile"][number];
    diffLine?: DiffLine;
    diffFile: DiffFile;
    enableHighlight: boolean;
  }) => {
    const isAdded = diffLine?.type === DiffLineType.Add;
    const isDelete = diffLine?.type === DiffLineType.Delete;
    const isMaxLineLengthToIgnoreSyntax = syntaxLine?.nodeList?.length > 150;

    // Memoize background color calculation
    const bg = React.useMemo(() => {
      const addBG = theme === "light" ? diffAddContent.light : diffAddContent.dark;
      const delBG = theme === "light" ? diffDelContent.light : diffDelContent.dark;
      const normalBG =
        theme === "light"
          ? diffLine
            ? diffPlainContent.light
            : diffExpandContent.light
          : diffLine
            ? diffPlainContent.dark
            : diffExpandContent.dark;

      return isAdded ? addBG : isDelete ? delBG : normalBG;
    }, [theme, diffLine, isAdded, isDelete]);

    const operatorChar = isAdded ? "+" : isDelete ? "-" : " ";

    return (
      <Box height={height} width={width}>
        <DiffOperator operatorChar={operatorChar} height={height} backgroundColor={bg} />
        {enableHighlight && syntaxLine && !isMaxLineLengthToIgnoreSyntax ? (
          <DiffSyntax
            bg={bg}
            theme={theme}
            width={width}
            height={height}
            operator={isAdded ? "add" : isDelete ? "del" : undefined}
            rawLine={rawLine}
            diffLine={diffLine}
            syntaxLine={syntaxLine}
          />
        ) : (
          <DiffString
            bg={bg}
            theme={theme}
            width={width}
            height={height}
            operator={isAdded ? "add" : isDelete ? "del" : undefined}
            rawLine={rawLine}
            diffLine={diffLine}
            plainLine={plainLine}
          />
        )}
      </Box>
    );
  }
);

DiffContent.displayName = "DiffContent";
