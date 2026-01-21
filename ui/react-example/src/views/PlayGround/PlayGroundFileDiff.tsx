import { generateDiffFile } from "@git-diff-view/file";
import {
  getEnableFastDiffTemplate,
  setEnableFastDiffTemplate,
  DiffView,
  getMaxLengthToIgnoreLineDiff,
  changeMaxLengthToIgnoreLineDiff,
} from "@git-diff-view/react";
import { useMantineColorScheme, Code, Button, Switch, NumberInput, Tooltip } from "@mantine/core";
import { useCallbackRef } from "@mantine/hooks";
import { debounce } from "lodash";
import { useState, useCallback, useEffect, useMemo } from "react";

import { CodeEditor } from "../../components/CodeEditor";
import {
  getShareDataFromUrl,
  decodeFileDiffState,
  copyToClipboard,
  updateUrlWithFileDiffState,
} from "../../utils/shareUrl";

import type { DiffFile } from "@git-diff-view/react";

const defaultFile1 =
  'import { createLowlight, all } from "lowlight";\n\nimport { processAST, type SyntaxLine } from "./processAST";\n\nconst lowlight = createLowlight(all);\n\n// !SEE https://github.com/highlightjs/highlightjs-vue\n\nlowlight.register("vue", function hljsDefineVue(hljs) {\n  return {\n    subLanguage: "xml",\n    contains: [\n      hljs.COMMENT("<!--", "-->", {\n        relevance: 10,\n      }),\n      {\n        begin: /^(\\s*)(<script>)/gm,\n        end: /^(\\s*)(<\\/script>)/gm,\n        subLanguage: "javascript",\n        excludeBegin: true,\n        excludeEnd: true,\n      },\n      {\n        begin: /^(?:\\s*)(?:<script\\s+lang=(["\'])ts\\1>)/gm,\n        end: /^(\\s*)(<\\/script>)/gm,\n        subLanguage: "typescript",\n        excludeBegin: true,\n        excludeEnd: true,\n      },\n      {\n        begin: /^(\\s*)(<style(\\s+scoped)?>)/gm,\n        end: /^(\\s*)(<\\/style>)/gm,\n        subLanguage: "css",\n        excludeBegin: true,\n        excludeEnd: true,\n      },\n      {\n        begin: /^(?:\\s*)(?:<style(?:\\s+scoped)?\\s+lang=(["\'])(?:s[ca]ss)\\1(?:\\s+scoped)?>)/gm,\n        end: /^(\\s*)(<\\/style>)/gm,\n        subLanguage: "scss",\n        excludeBegin: true,\n        excludeEnd: true,\n      },\n      {\n        begin: /^(?:\\s*)(?:<style(?:\\s+scoped)?\\s+lang=(["\'])stylus\\1(?:\\s+scoped)?>)/gm,\n        end: /^(\\s*)(<\\/style>)/gm,\n        subLanguage: "stylus",\n        excludeBegin: true,\n        excludeEnd: true,\n      },\n    ],\n  };\n});\n\nexport type DiffAST = ReturnType<typeof lowlight.highlight>;\n\nexport type DiffHighlighter = {\n  name: string;\n  maxLineToIgnoreSyntax: number;\n  setMaxLineToIgnoreSyntax: (v: number) => void;\n  ignoreSyntaxHighlightList: (string | RegExp)[];\n  setIgnoreSyntaxHighlightList: (v: (string | RegExp)[]) => void;\n  getAST: (raw: string, fileName?: string, lang?: string) => DiffAST;\n  processAST: (ast: DiffAST) => { syntaxFileObject: Record<number, SyntaxLine>; syntaxFileLineNumber: number };\n  hasRegisteredCurrentLang: (lang: string) => boolean;\n  getHighlighterEngine: () => ReturnType<typeof createLowlight> | null;\n};';

const defaultFile2 =
  'import { getHighlighter } from "shiki";\n\nimport { processAST, type SyntaxLine } from "./processAST";\n\nimport type { codeToHast } from "shiki";\n\nexport type DiffAST = DePromise<ReturnType<typeof codeToHast>>;\n\nexport type DiffHighlighter = {\n  name: string;\n  maxLineToIgnoreSyntax: number;\n  setMaxLineToIgnoreSyntax: (v: number) => void;\n  ignoreSyntaxHighlightList: (string | RegExp)[];\n  setIgnoreSyntaxHighlightList: (v: (string | RegExp)[]) => void;\n  getAST: (raw: string, fileName?: string, lang?: string) => DiffAST;\n  processAST: (ast: DiffAST) => { syntaxFileObject: Record<number, SyntaxLine>; syntaxFileLineNumber: number };\n  hasRegisteredCurrentLang: (lang: string) => boolean;\n  getHighlighterEngine: () => DePromise<ReturnType<typeof getHighlighter>> | null;\n};\n\nlet internal: DePromise<ReturnType<typeof getHighlighter>> | null = null;\n\nconst getDefaultHighlighter = async () =>\n  await getHighlighter({\n    themes: ["github-light", "github-dark"],\n    langs: [\n      "cpp",\n      "java",\n      "javascript",\n      "css",\n      "c#",\n      "c",\n      "c++",\n      "vue",\n      "vue-html",\n      "astro",\n      "bash",\n      "make",\n      "markdown",\n      "makefile",\n      "bat",\n      "cmake",\n      "cmd",\n      "csv",\n      "docker",\n      "dockerfile",\n      "go",\n      "python",\n      "html",\n      "jsx",\n      "tsx",\n      "typescript",\n      "sql",\n      "xml",\n      "sass",\n      "ssh-config",\n      "kotlin",\n      "json",\n      "swift",\n      "txt",\n      "diff",\n    ],\n  });\n\nconst instance = { name: "shiki" };\n\nlet _maxLineToIgnoreSyntax = 2000;\n\nconst _ignoreSyntaxHighlightList: (string | RegExp)[] = [];\n\nObject.defineProperty(instance, "maxLineToIgnoreSyntax", {\n  get: () => _maxLineToIgnoreSyntax,\n});\n\nObject.defineProperty(instance, "setMaxLineToIgnoreSyntax", {\n  value: (v: number) => {\n    _maxLineToIgnoreSyntax = v;\n  },\n});';

// Get initial state from URL or use defaults
const getInitialState = () => {
  const data = getShareDataFromUrl();
  if (data) {
    const state = decodeFileDiffState(data);
    if (state && (state.file1 || state.file2)) {
      return state;
    }
  }
  return { lang1: "ts", lang2: "ts", file1: defaultFile1, file2: defaultFile2 };
};

export const PlayGroundFileDiff = ({ onClick }: { onClick: () => void }) => {
  const initialState = getInitialState();

  const [lang1, setLang1] = useState(initialState.lang1);

  const [lang2, setLang2] = useState(initialState.lang2);

  const [ignoreWhiteSpace, setIgnoreWhiteSpace] = useState(false);

  const [fastDiffTemplate, setFastDiffTemplate] = useState(getEnableFastDiffTemplate());

  const [file1, setFile1] = useState(initialState.file1);

  const [file2, setFile2] = useState(initialState.file2);

  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "error">("idle");

  // Debounced URL update
  const updateUrl = useMemo(
    () =>
      debounce((lang1: string, lang2: string, file1: string, file2: string) => {
        updateUrlWithFileDiffState({ lang1, lang2, file1, file2 });
      }, 500),
    []
  );

  const { colorScheme } = useMantineColorScheme();

  const [diffInstance, setDiffInstance] = useState<DiffFile>();

  const setDiffInstanceCb = useCallback(
    debounce((lang1, lang2, file1, file2, ignoreWhiteSpace) => {
      if (!file1 && !file2) {
        setDiffInstance(undefined);
        return;
      }
      const data = generateDiffFile(`foo.${lang1}`, file1, `foo.${lang2}`, file2, lang1, lang2, {
        ignoreWhitespace: ignoreWhiteSpace,
      });
      try {
        data?.init();
        data?.buildSplitDiffLines();
        setDiffInstance(data);
      } catch (e) {
        alert((e as Error).message);
      }
    }, 1000),
    []
  );

  const reloadDiffInstance = useCallbackRef(() => {
    setDiffInstanceCb(lang1, lang2, file1, file2, ignoreWhiteSpace);
  });

  useEffect(() => {
    setDiffInstanceCb(lang1, lang2, file1, file2, ignoreWhiteSpace);
    updateUrl(lang1, lang2, file1, file2);
  }, [file1, file2, lang1, lang2, ignoreWhiteSpace]);

  useEffect(() => {
    setEnableFastDiffTemplate(fastDiffTemplate);
    reloadDiffInstance();
  }, [fastDiffTemplate]);

  const handleShare = useCallback(async () => {
    try {
      const success = await copyToClipboard(window.location.href);
      if (success) {
        setShareStatus("copied");
        setTimeout(() => setShareStatus("idle"), 2000);
      } else {
        setShareStatus("error");
        setTimeout(() => setShareStatus("idle"), 2000);
      }
    } catch {
      setShareStatus("error");
      setTimeout(() => setShareStatus("idle"), 2000);
    }
  }, []);

  return (
    <div className="m-auto mb-[1em] mt-[1em] w-[90%]">
      <h2 className="flex flex-wrap gap-x-8 gap-y-4 text-[24px]">
        <span>
          <Code className="text-[24px]">File diff</Code> mode
        </span>
        <div className="inline-flex gap-x-2 text-[14px]">
          <Button onClick={onClick}>Go to `Git diff` mode</Button>
          <Tooltip
            label={
              shareStatus === "copied"
                ? "Copied!"
                : shareStatus === "error"
                  ? "Failed to copy"
                  : "Copy share URL to clipboard"
            }
          >
            <Button
              variant={shareStatus === "copied" ? "filled" : "outline"}
              color={shareStatus === "error" ? "red" : shareStatus === "copied" ? "green" : undefined}
              onClick={handleShare}
            >
              {shareStatus === "copied" ? "Copied!" : shareStatus === "error" ? "Error" : "Share"}
            </Button>
          </Tooltip>
        </div>
        <div className="inline-flex items-center gap-x-4">
          <Switch
            checked={ignoreWhiteSpace}
            onChange={(e) => setIgnoreWhiteSpace(e.target.checked)}
            label="Ignore WhiteSpace"
          />
          <Switch
            checked={fastDiffTemplate}
            onChange={(e) => setFastDiffTemplate(e.target.checked)}
            label="Fast Diff Template (better line diff)"
          />
          <Tooltip label="Ignore line diff when line length over this value">
            <NumberInput
              value={getMaxLengthToIgnoreLineDiff()}
              min={100}
              max={6000}
              onChange={(n) => {
                changeMaxLengthToIgnoreLineDiff(Number(n));
                reloadDiffInstance();
              }}
            />
          </Tooltip>
        </div>
      </h2>
      <div className="mt-[10px] flex gap-x-[10px]">
        <div className="flex w-[50%] flex-col gap-y-[10px]">
          <span className="border-color border-b p-[3px]">Lang: </span>
          <input
            className="font-reset border-color rounded-[4px] border-2 p-[4px] text-[14px]"
            placeholder="input syntax lang"
            value={lang1}
            onChange={(e) => setLang1(e.target.value)}
          />
          <span className="border-color border-b p-[3px]">File 1: </span>
          <CodeEditor code={file1} onChange={setFile1} lang={lang1} minHeight="200px" />
        </div>
        <div className="flex w-[50%] flex-col gap-y-[10px]">
          <span className="border-color border-b p-[3px]">Lang: </span>
          <input
            className="border-color font-reset rounded-[4px] border-2 p-[4px] text-[14px]"
            type=""
            placeholder="input syntax lang"
            value={lang2}
            onChange={(e) => setLang2(e.target.value)}
          />
          <span className="border-color border-b p-[3px]">File 2: </span>
          <CodeEditor code={file2} onChange={setFile2} lang={lang2} minHeight="200px" />
        </div>
      </div>

      {diffInstance ? (
        <DiffView<string>
          className="border-color mt-[10px] overflow-hidden rounded-[4px] border"
          diffFile={diffInstance}
          diffViewFontSize={13}
          diffViewTheme={colorScheme === "dark" ? "dark" : "light"}
          diffViewHighlight={true}
          diffViewWrap
        />
      ) : (
        <div className="border-color mt-[10px] rounded-[4px] border p-[10px] text-[22px] text-orange-500">Empty</div>
      )}
    </div>
  );
};
