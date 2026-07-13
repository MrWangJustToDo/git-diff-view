import { _cacheMap, getFile } from "@git-diff-view/core";
import { Box, Text, useStdout } from "ink";
import { forwardRef, memo, useImperativeHandle, useMemo } from "react";

import { getValidColumns, safeGetProcessColumn, TERMINAL_PADDING_X } from "../hooks/useTerminalSize";

import { buildAnsiStringOptimized, splitCharsIntoRows, styleText } from "./ansiString";
import { buildTheme } from "./color";
import {
  getStyleFromClassName,
  getStyleObjectFromString,
  processCharsForAnsi,
  processSyntaxCharsForAnsi,
} from "./DiffContent";
import { useScrollView, type ScrollLayout, type ScrollViewProps, type ScrollViewRef } from "./scroll";

import type { CharStyle, StyledChar } from "./ansiString";
import type { DiffViewColorTheme, ResolvedDiffViewColorTheme } from "./color";
import type { DiffHighlighter, DiffHighlighterLang, File } from "@git-diff-view/core";
import type { ForwardedRef, JSX } from "react";

_cacheMap.name = "@git-diff-view/cli";

export type CodeViewRef = ScrollViewRef & {
  getFileInstance: () => File | null;
};

export type CodeViewProps = ScrollViewProps & {
  data?: {
    content: string;
    fileName?: string | null;
    fileLang?: DiffHighlighterLang | string | null;
  };
  file?: File;
  width?: number;
  codeViewTheme?: "light" | "dark";
  codeViewTabSpace?: boolean;
  codeViewTabWidth?: "small" | "medium" | "large";
  registerHighlighter?: Omit<DiffHighlighter, "getHighlighterEngine">;
  codeViewHighlight?: boolean;
  codeViewNoBG?: boolean;
  codeViewThemeColors?: DiffViewColorTheme;
};

type CodeViewProps_1 = Omit<CodeViewProps, "data"> & {
  data?: {
    content: string;
    fileName?: string | null;
    fileLang?: DiffHighlighterLang | null;
  };
};

type CodeViewProps_2 = Omit<CodeViewProps, "data"> & {
  data?: {
    content: string;
    fileName?: string | null;
    fileLang?: string | null;
  };
};

interface BuildOptions {
  enableHighlight: boolean;
  noBG: boolean;
  tabSpace: boolean;
  tabWidth: "small" | "medium" | "large";
  themeColors: ResolvedDiffViewColorTheme;
}

export function buildCodeViewLayout(
  file: File,
  theme: "light" | "dark",
  columns: number,
  options: BuildOptions
): ScrollLayout {
  const { enableHighlight, noBG, tabSpace, tabWidth, themeColors } = options;

  const maxLineNumber = file.maxLineNumber || 1;
  const lineNumWidth = Math.max(String(maxLineNumber).length, 2);
  const lineNumTotalWidth = lineNumWidth + 2;
  const contentWidth = columns - lineNumTotalWidth - 2;

  if (contentWidth <= 0) {
    return { rows: [], lines: [], totalRows: 0, totalLines: 0 };
  }

  const lineNumBg = noBG
    ? undefined
    : theme === "light"
      ? themeColors.plainLineNumber.light
      : themeColors.plainLineNumber.dark;
  const lineNumColor =
    theme === "light" ? themeColors.plainLineNumberColor.light : themeColors.plainLineNumberColor.dark;
  const contentBg = noBG
    ? undefined
    : theme === "light"
      ? themeColors.plainContent.light
      : themeColors.plainContent.dark;

  const lineNumStyle: CharStyle = { backgroundColor: lineNumBg, color: lineNumColor, dim: true };
  const padStyle: CharStyle = { backgroundColor: contentBg };

  const totalLines = file.rawLength || 0;
  const rows: string[] = [];
  const lines: ScrollLayout["lines"] = [];

  for (let lineNumber = 1; lineNumber <= totalLines; lineNumber++) {
    const rawLine = (file.rawFile[lineNumber] || "").replace(/\n$/, "");
    const syntaxLine = file.syntaxFile[lineNumber];

    const baseStyle: CharStyle = { backgroundColor: contentBg };
    let contentChars: StyledChar[];

    const useSyntax = enableHighlight && syntaxLine && syntaxLine.nodeList?.length <= 150;

    if (useSyntax) {
      contentChars = [];
      for (const { node, wrapper } of syntaxLine!.nodeList || []) {
        const lowlightStyles = getStyleFromClassName(wrapper?.properties?.className?.join(" ") || "");
        const lowlightStyle = theme === "dark" ? lowlightStyles.dark : lowlightStyles.light;
        const shikiStyles = getStyleObjectFromString(wrapper?.properties?.style || "");
        const shikiStyle = theme === "dark" ? shikiStyles.dark : shikiStyles.light;
        const syntaxColor = (shikiStyle as { color?: string })?.color || (lowlightStyle as { color?: string })?.color;
        contentChars.push(
          ...processSyntaxCharsForAnsi(node.value.replace(/\n$/, ""), tabSpace, tabWidth, baseStyle, syntaxColor)
        );
      }
    } else {
      contentChars = processCharsForAnsi(rawLine, tabSpace, tabWidth, baseStyle);
    }

    const contentRows = splitCharsIntoRows(contentChars, contentWidth, padStyle);
    const pad = styleText(" ", padStyle);
    const startRow = rows.length;

    for (let row = 0; row < contentRows.length; row++) {
      const numText = row === 0 ? ` ${String(lineNumber).padStart(lineNumWidth)} ` : ` ${" ".repeat(lineNumWidth)} `;
      const lineNumStr = styleText(numText, lineNumStyle);
      const contentStr = buildAnsiStringOptimized(contentRows[row]);

      rows.push(`${lineNumStr}${pad}${contentStr}${pad}`);
    }

    lines.push({
      lineNumber,
      startRow,
      endRow: rows.length,
    });
  }

  return {
    rows,
    lines,
    totalRows: rows.length,
    totalLines,
  };
}

function buildCodeViewString(file: File, theme: "light" | "dark", columns: number, options: BuildOptions): string {
  return buildCodeViewLayout(file, theme, columns, options).rows.join("\n");
}

export function buildCodeViewAnsiString(props: CodeViewProps): string {
  const theme = props.codeViewTheme || "light";

  let resolvedFile: File | null = null;
  if (props.file) {
    resolvedFile = props.file;
  } else if (props.data) {
    resolvedFile = getFile(props.data.content || "", props.data.fileLang || "", theme, props.data.fileName || "");
  }
  if (!resolvedFile) return "";

  resolvedFile.doRaw();

  if (props.codeViewHighlight && props.registerHighlighter) {
    resolvedFile.doSyntax({ registerHighlighter: props.registerHighlighter, theme });
  }

  const columns =
    typeof props.width === "number"
      ? props.width
      : getValidColumns((safeGetProcessColumn() || 60) - TERMINAL_PADDING_X);

  return buildCodeViewString(resolvedFile, theme, columns, {
    enableHighlight: !!props.codeViewHighlight,
    noBG: !!props.codeViewNoBG,
    tabSpace: !!props.codeViewTabSpace,
    tabWidth: props.codeViewTabWidth || "medium",
    themeColors: buildTheme(props.codeViewThemeColors),
  });
}

const InternalCodeView = memo(
  ({
    output,
    theme,
    hasFixedHeight,
    viewportHeight,
  }: {
    output: string;
    theme: "light" | "dark";
    hasFixedHeight: boolean;
    viewportHeight: number;
  }) => {
    return (
      <Box
        data-component="git-code-view"
        data-theme={theme}
        data-version={__VERSION__}
        flexDirection="column"
        height={hasFixedHeight ? viewportHeight : undefined}
        overflow={hasFixedHeight ? "hidden" : undefined}
      >
        <Text wrap="truncate">{output}</Text>
      </Box>
    );
  }
);

InternalCodeView.displayName = "InternalCodeView";

const CodeViewContainerWithRef = (props: CodeViewProps, ref: ForwardedRef<CodeViewRef>) => {
  const { registerHighlighter, data, codeViewTheme, file, width, height, onScrollChange, ...restProps } = props;

  const theme = codeViewTheme || "light";
  const { stdout } = useStdout();

  const finalFile = useMemo(() => {
    if (file) {
      file.doRaw();
      if (props.codeViewHighlight) {
        file.doSyntax({ registerHighlighter: registerHighlighter, theme });
      }
      return file;
    }
    if (data) {
      const f = getFile(data.content || "", data.fileLang || "", theme, data.fileName || "");
      f.doRaw();
      if (props.codeViewHighlight) {
        f.doSyntax({ registerHighlighter: registerHighlighter, theme });
      }
      return f;
    }
    return null;
  }, [data, theme, file, props.codeViewHighlight, registerHighlighter]);

  const columns = useMemo(() => {
    if (typeof width === "number") return width;
    return getValidColumns((safeGetProcessColumn() || stdout?.columns || 60) - TERMINAL_PADDING_X);
  }, [stdout, width]);

  const options: BuildOptions = useMemo(
    () => ({
      enableHighlight: !!restProps.codeViewHighlight,
      noBG: !!restProps.codeViewNoBG,
      tabSpace: !!restProps.codeViewTabSpace,
      tabWidth: restProps.codeViewTabWidth || "medium",
      themeColors: buildTheme(restProps.codeViewThemeColors),
    }),
    [
      restProps.codeViewHighlight,
      restProps.codeViewNoBG,
      restProps.codeViewTabSpace,
      restProps.codeViewTabWidth,
      restProps.codeViewThemeColors,
    ]
  );

  const layout = useMemo(() => {
    if (!finalFile || !columns) {
      return { rows: [], lines: [], totalRows: 0, totalLines: 0 };
    }
    return buildCodeViewLayout(finalFile, theme, columns, options);
  }, [finalFile, theme, columns, options]);

  const { visibleOutput, scrollRef, hasFixedHeight, viewportHeight } = useScrollView({
    layout,
    height,
    onScrollChange,
    resetKey: columns,
  });

  useImperativeHandle(
    ref,
    () => ({
      getFileInstance: () => finalFile,
      ...scrollRef,
    }),
    [finalFile, scrollRef]
  );

  if (!finalFile || !columns) return null;

  const output = hasFixedHeight ? visibleOutput : layout.rows.join("\n");

  return (
    <Box
      width={width}
      flexGrow={typeof width === "number" ? undefined : 1}
      flexShrink={typeof width === "number" ? 0 : undefined}
    >
      <InternalCodeView
        key={finalFile.getId()}
        output={output}
        theme={theme}
        hasFixedHeight={hasFixedHeight}
        viewportHeight={viewportHeight}
      />
    </Box>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ReactCodeView(props: CodeViewProps_1 & { ref?: ForwardedRef<CodeViewRef> }): JSX.Element;
function ReactCodeView(props: CodeViewProps_2 & { ref?: ForwardedRef<CodeViewRef> }): JSX.Element;
function ReactCodeView(_props: CodeViewProps & { ref?: ForwardedRef<CodeViewRef> }) {
  return <></>;
}

const InnerCodeView = forwardRef(CodeViewContainerWithRef);

InnerCodeView.displayName = "CodeView";

export const CodeView = InnerCodeView as typeof ReactCodeView;
