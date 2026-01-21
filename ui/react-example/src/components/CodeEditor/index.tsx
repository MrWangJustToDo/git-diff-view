import { SandpackCodeEditor, SandpackLayout, SandpackProvider, useActiveCode } from "@codesandbox/sandpack-react";
import { useMantineColorScheme } from "@mantine/core";
import { memo, useEffect, useRef, useState } from "react";

// Internal component to sync code changes back to parent
const CodeSync = ({ onChange, initialCode }: { onChange?: (code: string) => void; initialCode: string }) => {
  const { code, updateCode } = useActiveCode();
  const prevCodeRef = useRef<string>(initialCode);
  const isExternalUpdate = useRef(false);

  // Sync external code changes into sandpack
  useEffect(() => {
    if (initialCode !== prevCodeRef.current && initialCode !== code) {
      isExternalUpdate.current = true;
      updateCode(initialCode, false);
      prevCodeRef.current = initialCode;
    }
  }, [initialCode, updateCode, code]);

  // Notify parent of internal code changes
  useEffect(() => {
    if (isExternalUpdate.current) {
      isExternalUpdate.current = false;
      return;
    }
    if (code !== prevCodeRef.current) {
      prevCodeRef.current = code;
      onChange?.(code);
    }
  }, [code, onChange]);

  return null;
};

export interface CodeEditorProps {
  code: string;
  onChange?: (code: string) => void;
  lang?: string;
  minHeight?: string;
  readOnly?: boolean;
  showLineNumbers?: boolean;
}

// Map common language names to file extensions
const getFileExtension = (lang: string) => {
  const langMap: Record<string, string> = {
    typescript: "ts",
    javascript: "js",
    ts: "ts",
    js: "js",
    tsx: "tsx",
    jsx: "jsx",
    json: "json",
    html: "html",
    css: "css",
    scss: "scss",
    less: "less",
    markdown: "md",
    md: "md",
    python: "py",
    py: "py",
    rust: "rs",
    rs: "rs",
    go: "go",
    java: "java",
    c: "c",
    cpp: "cpp",
    "c++": "cpp",
    diff: "diff",
    patch: "diff",
    vue: "vue",
    svelte: "svelte",
    shell: "sh",
    bash: "sh",
    sh: "sh",
    yaml: "yaml",
    yml: "yaml",
    xml: "xml",
    sql: "sql",
    graphql: "graphql",
    swift: "swift",
    kotlin: "kt",
    ruby: "rb",
    php: "php",
    txt: "txt",
    text: "txt",
  };
  return langMap[lang.toLowerCase()] || "txt";
};

export const CodeEditor = memo(
  ({ code, onChange, lang = "ts", minHeight = "200px", readOnly = false, showLineNumbers = true }: CodeEditorProps) => {
    const { colorScheme } = useMantineColorScheme();
    const [height, setHeight] = useState(minHeight);
    const containerRef = useRef<HTMLDivElement>(null);
    const isResizing = useRef(false);
    const startY = useRef(0);
    const startHeight = useRef(0);

    const ext = getFileExtension(lang);
    const filePath = `/main.${ext}`;

    const handleMouseDown = (e: React.MouseEvent) => {
      isResizing.current = true;
      startY.current = e.clientY;
      startHeight.current = containerRef.current?.offsetHeight || parseInt(minHeight);
      document.body.style.cursor = "ns-resize";
      document.body.style.userSelect = "none";

      const handleMouseMove = (e: MouseEvent) => {
        if (!isResizing.current) return;
        const delta = e.clientY - startY.current;
        const newHeight = Math.max(parseInt(minHeight), startHeight.current + delta);
        setHeight(`${newHeight}px`);
      };

      const handleMouseUp = () => {
        isResizing.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    return (
      <div ref={containerRef} className="relative" style={{ height }}>
        <SandpackProvider
          files={{
            [filePath]: {
              code,
              active: true,
            },
          }}
          theme={colorScheme === "dark" ? "dark" : "light"}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          style={{ ["--sp-layout-height"]: "100%", height: "100%" }}
        >
          <SandpackLayout className="border-color h-full overflow-hidden rounded-[6px] border">
            <SandpackCodeEditor showLineNumbers={showLineNumbers} showReadOnly={false} readOnly={readOnly} />
          </SandpackLayout>
          {!readOnly && onChange && <CodeSync onChange={onChange} initialCode={code} />}
        </SandpackProvider>
        {/* Resize handle */}
        <div
          className="border-color absolute bottom-0 left-0 right-0 flex h-[8px] cursor-ns-resize items-center justify-center border-t bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
          onMouseDown={handleMouseDown}
        >
          <div className="h-[2px] w-[30px] rounded bg-gray-400" />
        </div>
      </div>
    );
  }
);

CodeEditor.displayName = "CodeEditor";
