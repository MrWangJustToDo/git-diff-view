/**
 * CodeView component - renders source code with syntax highlighting and line numbers.
 * Simplified version of DiffView without diff-related features.
 */
import { _cacheMap, getFile } from "@git-diff-view/core";
import { Box } from "ink";
import React, { Fragment, forwardRef, memo, useEffect, useImperativeHandle, useMemo, useRef } from "react";

import { useCodeTerminalSize } from "../hooks/useCodeTerminalSize";
import { useIsMounted } from "../hooks/useIsMounted";

import { CodeContent } from "./CodeContent";
import { CodeExtendLine } from "./CodeExtendLine";
import { CodeLineNumberArea } from "./CodeLineNumber";
import { createCodeConfigStore, getCurrentLineRow } from "./codeTools";
import { CodeViewContext, useCodeViewContext } from "./CodeViewContext";
import { diffPlainLineNumber, diffPlainLineNumberColor } from "./color";

import type { DiffHighlighter, DiffHighlighterLang, File } from "@git-diff-view/core";
import type { DOMElement } from "ink";
import type { ForwardedRef, ReactNode, RefObject } from "react";

_cacheMap.name = "@git-diff-view/cli";

export type CodeViewProps<T> = {
  data?: {
    content: string;
    fileName?: string | null;
    fileLang?: DiffHighlighterLang | string | null;
  };
  extendData?: Record<string, { data: T }>;
  width?: number;
  codeViewTheme?: "light" | "dark";
  codeViewTabSpace?: boolean;
  // tabWidth in the code view, small: 1, medium: 2, large: 4, default: medium
  codeViewTabWidth?: "small" | "medium" | "large";
  registerHighlighter?: Omit<DiffHighlighter, "getHighlighterEngine">;
  codeViewHighlight?: boolean;
  renderExtendLine?: ({ file, data, lineNumber }: { file: File; lineNumber: number; data: T }) => ReactNode;
};

type CodeViewProps_1<T> = Omit<CodeViewProps<T>, "data"> & {
  data?: {
    content: string;
    fileName?: string | null;
    fileLang?: DiffHighlighterLang | null;
  };
};

type CodeViewProps_2<T> = Omit<CodeViewProps<T>, "data"> & {
  data?: {
    content: string;
    fileName?: string | null;
    fileLang?: string | null;
  };
};

/**
 * Single line component for CodeView
 */
const CodeLine = memo(
  ({
    lineNumber,
    theme,
    columns,
    file,
    lineNumWidth,
    enableHighlight,
  }: {
    lineNumber: number;
    theme: "light" | "dark";
    columns: number;
    file: File;
    lineNumWidth: number;
    enableHighlight: boolean;
  }) => {
    const rawLine = file.rawFile[lineNumber] || "";
    const syntaxLine = file.syntaxFile[lineNumber];
    const plainLine = file.plainFile[lineNumber];

    const contentWidth = columns - lineNumWidth - 2;

    // Calculate row height based on actual text width (content width minus 2 char padding on both sides)
    const row = getCurrentLineRow({ content: rawLine, width: contentWidth - 2 });

    const bg = theme === "light" ? diffPlainLineNumber.light : diffPlainLineNumber.dark;
    const color = theme === "light" ? diffPlainLineNumberColor.light : diffPlainLineNumberColor.dark;

    return (
      <Box data-line={lineNumber} height={row} width={columns}>
        <CodeLineNumberArea
          lineNumber={lineNumber}
          lineNumWidth={lineNumWidth}
          height={row}
          backgroundColor={bg}
          color={color}
          dim={true}
        />
        <CodeContent
          theme={theme}
          height={row}
          width={contentWidth}
          rawLine={rawLine}
          plainLine={plainLine}
          syntaxLine={syntaxLine}
          enableHighlight={enableHighlight}
        />
      </Box>
    );
  }
);

CodeLine.displayName = "CodeLine";

/**
 * CodeViewContent - renders all code lines using terminal size from context
 */
const CodeViewContent = memo(({ file, theme }: { file: File; theme: "light" | "dark" }) => {
  const { useCodeContext } = useCodeViewContext();

  const enableHighlight = useCodeContext((s) => s.enableHighlight);

  const { columns } = useCodeTerminalSize();

  // Calculate line number width based on max line number
  const lineNumWidth = useMemo(() => {
    const maxLineNumber = file.maxLineNumber || 1;
    return Math.max(String(maxLineNumber).length, 2);
  }, [file.maxLineNumber]);

  // Generate line numbers
  const lines = useMemo(() => {
    const totalLines = file.rawLength || 0;
    return Array.from({ length: totalLines }, (_, i) => i + 1);
  }, [file.rawLength]);

  if (!columns) return null;

  return (
    <>
      {lines.map((lineNumber) => (
        <Fragment key={lineNumber}>
          <CodeLine
            lineNumber={lineNumber}
            theme={theme}
            columns={columns}
            file={file}
            lineNumWidth={lineNumWidth}
            enableHighlight={enableHighlight ?? false}
          />
          <CodeExtendLine columns={columns} lineNumber={lineNumber} file={file} />
        </Fragment>
      ))}
    </>
  );
});

CodeViewContent.displayName = "CodeViewContent";

/**
 * Internal CodeView component that sets up context and renders content
 */
const InternalCodeView = <T,>(
  props: Omit<CodeViewProps<T>, "data"> & {
    file: File;
    isMounted: boolean;
    wrapperRef?: RefObject<DOMElement>;
  }
) => {
  const {
    file,
    codeViewHighlight,
    isMounted,
    wrapperRef,
    extendData,
    renderExtendLine,
    codeViewTabSpace,
    codeViewTabWidth,
    codeViewTheme,
  } = props;

  const fileId = useMemo(() => file.fileName || "code-file", [file.fileName]);

  // Performance optimization using store
  const useCodeContext = useMemo(() => createCodeConfigStore(props, fileId), []);

  useEffect(() => {
    const {
      id,
      setId,
      mounted,
      setMounted,
      enableHighlight,
      setEnableHighlight,
      setExtendData,
      renderExtendLine,
      setRenderExtendLine,
      tabSpace,
      setTabSpace,
      tabWidth,
      setTabWidth,
    } = useCodeContext.getReadonlyState();

    if (fileId && fileId !== id) {
      setId(fileId);
    }

    if (mounted !== isMounted) {
      setMounted(isMounted);
    }

    if (codeViewHighlight !== enableHighlight) {
      setEnableHighlight(codeViewHighlight);
    }

    if (props.extendData) {
      setExtendData(props.extendData);
    }

    if (renderExtendLine !== props.renderExtendLine) {
      setRenderExtendLine(props.renderExtendLine);
    }

    if (codeViewTabSpace !== tabSpace) {
      setTabSpace(codeViewTabSpace);
    }

    if (codeViewTabWidth !== tabWidth) {
      setTabWidth(codeViewTabWidth);
    }
  }, [
    useCodeContext,
    codeViewHighlight,
    fileId,
    isMounted,
    extendData,
    renderExtendLine,
    codeViewTabSpace,
    codeViewTabWidth,
  ]);

  useEffect(() => {
    const { wrapper, setWrapper } = useCodeContext.getReadonlyState();
    if (wrapperRef.current !== wrapper.current) {
      setWrapper(wrapperRef.current);
    }
  });

  const value = useMemo(() => ({ useCodeContext }), [useCodeContext]);

  const theme = codeViewTheme || "light";

  return (
    <CodeViewContext.Provider value={value}>
      <Box data-component="git-code-view" data-theme={theme} data-version={__VERSION__} flexDirection="column">
        <CodeViewContent file={file} theme={theme} />
      </Box>
    </CodeViewContext.Provider>
  );
};

const MemoedInternalCodeView = memo(InternalCodeView);

const CodeViewContainerWithRef = <T,>(props: CodeViewProps<T>, ref: ForwardedRef<{ getFileInstance: () => File }>) => {
  const { registerHighlighter, data, codeViewTheme, width, ...restProps } = props;

  const domRef = useRef<DOMElement>(null);

  const theme = codeViewTheme || "light";

  const file = useMemo(() => {
    if (data) {
      return getFile(data.content || "", data.fileLang || "", theme, data.fileName || "");
    }
    return null;
  }, [data, theme]);

  const fileRef = useRef(file);

  if (fileRef.current && fileRef.current !== file) {
    fileRef.current = file;
  }

  const isMounted = useIsMounted();

  useEffect(() => {
    if (!file) return;
    file.doRaw();
  }, [file]);

  useEffect(() => {
    if (!file) return;
    if (props.codeViewHighlight) {
      file.doSyntax({ registerHighlighter: registerHighlighter, theme: codeViewTheme });
    }
  }, [file, props.codeViewHighlight, codeViewTheme, registerHighlighter]);

  useImperativeHandle(ref, () => ({ getFileInstance: () => file }), [file]);

  if (!file) return null;

  return (
    <Box
      ref={domRef}
      width={width}
      flexGrow={typeof width === "number" ? undefined : 1}
      flexShrink={typeof width === "number" ? 0 : undefined}
    >
      <MemoedInternalCodeView
        key={file.fileName}
        {...restProps}
        wrapperRef={domRef}
        file={file}
        isMounted={isMounted}
        codeViewTheme={codeViewTheme}
        codeViewTabWidth={props.codeViewTabWidth || "medium"}
      />
    </Box>
  );
};

// type helper function
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ReactCodeView<T>(
  props: CodeViewProps_1<T> & { ref?: ForwardedRef<{ getFileInstance: () => File }> }
): JSX.Element;
function ReactCodeView<T>(
  props: CodeViewProps_2<T> & { ref?: ForwardedRef<{ getFileInstance: () => File }> }
): JSX.Element;
function ReactCodeView<T>(_props: CodeViewProps<T> & { ref?: ForwardedRef<{ getFileInstance: () => File }> }) {
  return <></>;
}

const InnerCodeView = forwardRef(CodeViewContainerWithRef);

InnerCodeView.displayName = "CodeView";

export const CodeView = InnerCodeView as typeof ReactCodeView;
