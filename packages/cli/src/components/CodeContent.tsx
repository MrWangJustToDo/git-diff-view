/**
 * CodeContent component - renders code with optional syntax highlighting.
 * Simplified version of DiffContent without diff-specific features.
 */
import { Box, Text } from "ink";
import * as React from "react";

import { buildAnsiStringWithLineBreaks, buildStyledBlock, type CharStyle } from "./ansiString";
import { useCodeViewContext } from "./CodeViewContext";
import { diffPlainContent } from "./color";
import { getStyleObjectFromString, getStyleFromClassName } from "./DiffContent";

import type { File } from "@git-diff-view/core";

// Helper to get tab width value
const getTabWidthValue = (tabWidth: "small" | "medium" | "large"): number => {
  return tabWidth === "small" ? 1 : tabWidth === "medium" ? 2 : 4;
};

// Process a string into styled characters for ANSI output
const processCharsForAnsi = (
  str: string,
  enableTabSpace: boolean,
  tabWidth: "small" | "medium" | "large",
  baseStyle: CharStyle
): Array<{ char: string; style?: CharStyle }> => {
  const result: Array<{ char: string; style?: CharStyle }> = [];
  const tabWidthValue = getTabWidthValue(tabWidth);

  for (const char of str) {
    if (enableTabSpace && char === " ") {
      // Show space as dimmed dot
      result.push({ char: "\u00b7", style: { ...baseStyle, dim: true } });
    } else if (char === "\t") {
      if (enableTabSpace) {
        // Show tab as arrow followed by spaces
        result.push({ char: "\u2192", style: { ...baseStyle, dim: true } });
        for (let i = 1; i < tabWidthValue; i++) {
          result.push({ char: " ", style: baseStyle });
        }
      } else {
        // Just show spaces for tab
        for (let i = 0; i < tabWidthValue; i++) {
          result.push({ char: " ", style: baseStyle });
        }
      }
    } else {
      result.push({ char, style: baseStyle });
    }
  }

  return result;
};

/**
 * CodeString component using ANSI escape codes for proper character-level wrapping.
 */
const CodeString = React.memo(({ bg, width, rawLine }: { bg: string; width: number; rawLine: string }) => {
  const { useCodeContext } = useCodeViewContext();

  const { enableTabSpace, tabWidth } = useCodeContext((s) => ({ enableTabSpace: s.tabSpace, tabWidth: s.tabWidth }));

  // Memoize the ANSI content to avoid rebuilding on every render
  const ansiContent = React.useMemo(() => {
    const chars: Array<{ char: string; style?: CharStyle }> = [];
    const baseStyle: CharStyle = { backgroundColor: bg };

    // Process the whole line
    chars.push(...processCharsForAnsi(rawLine, enableTabSpace, tabWidth, baseStyle));

    return buildAnsiStringWithLineBreaks(chars, width);
  }, [bg, width, rawLine, enableTabSpace, tabWidth]);

  return (
    <Box width={width} backgroundColor={bg}>
      <Text wrap="truncate">{ansiContent}</Text>
    </Box>
  );
});

CodeString.displayName = "CodeString";

/**
 * Helper function to process syntax-highlighted characters for ANSI output.
 */
const processSyntaxCharsForAnsi = (
  str: string,
  enableTabSpace: boolean,
  tabWidth: "small" | "medium" | "large",
  baseStyle: CharStyle,
  syntaxColor?: string
): Array<{ char: string; style?: CharStyle }> => {
  const result: Array<{ char: string; style?: CharStyle }> = [];
  const tabWidthValue = getTabWidthValue(tabWidth);

  for (const char of str) {
    const style: CharStyle = {
      ...baseStyle,
      color: syntaxColor || baseStyle.color,
    };

    if (enableTabSpace && char === " ") {
      result.push({ char: "\u00b7", style: { ...style, dim: true } });
    } else if (char === "\t") {
      if (enableTabSpace) {
        result.push({ char: "\u2192", style: { ...style, dim: true } });
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
 * CodeSyntax component using ANSI escape codes for proper character-level wrapping
 * with syntax highlighting support.
 */
const CodeSyntax = React.memo(
  ({
    bg,
    width,
    theme,
    rawLine,
    syntaxLine,
  }: {
    bg: string;
    width: number;
    theme: "light" | "dark";
    rawLine: string;
    syntaxLine?: File["syntaxFile"][number];
  }) => {
    const { useCodeContext } = useCodeViewContext();

    const { enableTabSpace, tabWidth } = useCodeContext((s) => ({ enableTabSpace: s.tabSpace, tabWidth: s.tabWidth }));

    // Memoize the ANSI content with syntax highlighting
    const ansiContent = React.useMemo(() => {
      if (!syntaxLine) {
        return null; // Will render CodeString instead
      }

      const chars: Array<{ char: string; style?: CharStyle }> = [];
      const baseStyle: CharStyle = { backgroundColor: bg };

      for (const { node, wrapper } of syntaxLine.nodeList || []) {
        // Get syntax color from lowlight or shiki
        const lowlightStyles = getStyleFromClassName(wrapper?.properties?.className?.join(" ") || "");
        const lowlightStyle = theme === "dark" ? lowlightStyles.dark : lowlightStyles.light;
        const shikiStyles = getStyleObjectFromString(wrapper?.properties?.style || "");
        const shikiStyle = theme === "dark" ? shikiStyles.dark : shikiStyles.light;

        // Determine the syntax color (shiki style takes precedence)
        const syntaxColor = (shikiStyle as { color?: string })?.color || (lowlightStyle as { color?: string })?.color;

        chars.push(
          ...processSyntaxCharsForAnsi(node.value, enableTabSpace, tabWidth, { ...baseStyle, color: syntaxColor })
        );
      }

      return buildAnsiStringWithLineBreaks(chars, width);
    }, [bg, width, theme, rawLine, syntaxLine, enableTabSpace, tabWidth]);

    // Fallback to CodeString if no syntax line
    if (!syntaxLine) {
      return <CodeString bg={bg} width={width} rawLine={rawLine} />;
    }

    return (
      <Box width={width} backgroundColor={bg}>
        <Text wrap="truncate">{ansiContent}</Text>
      </Box>
    );
  }
);

CodeSyntax.displayName = "CodeSyntax";

/**
 * CodePadding component - Renders a 1-char padding column
 * using chalk for proper multi-row support.
 */
const CodePadding = React.memo(({ height, backgroundColor }: { height: number; backgroundColor: string }) => {
  const content = React.useMemo(() => {
    const lines: string[] = [];
    const style: CharStyle = { backgroundColor };

    for (let row = 0; row < height; row++) {
      lines.push(buildStyledBlock(" ", 1, 1, style, "left"));
    }

    return lines.join("\n");
  }, [height, backgroundColor]);

  return (
    <Box width={1} flexShrink={0}>
      <Text wrap="truncate">{content}</Text>
    </Box>
  );
});

CodePadding.displayName = "CodePadding";

export const CodeContent = React.memo(
  ({
    theme,
    width,
    height,
    rawLine,
    syntaxLine,
    enableHighlight,
  }: {
    width: number;
    height: number;
    theme: "light" | "dark";
    rawLine: string;
    plainLine?: File["plainFile"][number];
    syntaxLine?: File["syntaxFile"][number];
    enableHighlight: boolean;
  }) => {
    const isMaxLineLengthToIgnoreSyntax = syntaxLine?.nodeList?.length > 150;

    // Background color for normal code
    const bg = React.useMemo(() => {
      return theme === "light" ? diffPlainContent.light : diffPlainContent.dark;
    }, [theme]);

    // Content width is total width minus 2 char padding (1 on each side)
    const contentWidth = width - 2;

    return (
      <Box height={height} width={width}>
        <CodePadding height={height} backgroundColor={bg} />
        {enableHighlight && syntaxLine && !isMaxLineLengthToIgnoreSyntax ? (
          <CodeSyntax bg={bg} theme={theme} width={contentWidth} rawLine={rawLine} syntaxLine={syntaxLine} />
        ) : (
          <CodeString bg={bg} width={contentWidth} rawLine={rawLine} />
        )}
        <CodePadding height={height} backgroundColor={bg} />
      </Box>
    );
  }
);

CodeContent.displayName = "CodeContent";
