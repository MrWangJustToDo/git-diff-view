import { generateDiffFile } from "@git-diff-view/file";
import { getEnableFastDiffTemplate, setEnableFastDiffTemplate, DiffView } from "@git-diff-view/react";
import { useMantineColorScheme, Code, Button, Switch } from "@mantine/core";
import { useCallbackRef } from "@mantine/hooks";
import { debounce } from "lodash";
import { useState, useCallback, useEffect } from "react";

import type { DiffFile } from "@git-diff-view/react";

export const PlayGroundFileDiff = ({ onClick }: { onClick: () => void }) => {
  const [lang1, setLang1] = useState("ts");

  const [lang2, setLang2] = useState("ts");

  const [ignoreWhiteSpace, setIgnoreWhiteSpace] = useState(false);

  const [fastDiffTemplate, setFastDiffTemplate] = useState(getEnableFastDiffTemplate());

  const [file1, setFile1] = useState(
    'import { createLowlight, all } from "lowlight";\n\nimport { processAST, type SyntaxLine } from "./processAST";\n\nconst lowlight = createLowlight(all);\n\n// !SEE https://github.com/highlightjs/highlightjs-vue\n\nlowlight.register("vue", function hljsDefineVue(hljs) {\n  return {\n    subLanguage: "xml",\n    contains: [\n      hljs.COMMENT("\x3C!--", "-->", {\n        relevance: 10,\n      }),\n      {\n        begin: /^(\\s*)(\x3Cscript>)/gm,\n        end: /^(\\s*)(<\\/script>)/gm,\n        subLanguage: "javascript",\n        excludeBegin: true,\n        excludeEnd: true,\n      },\n      {\n        begin: /^(?:\\s*)(?:\x3Cscript\\s+lang=(["\'])ts\\1>)/gm,\n        end: /^(\\s*)(<\\/script>)/gm,\n        subLanguage: "typescript",\n        excludeBegin: true,\n        excludeEnd: true,\n      },\n      {\n        begin: /^(\\s*)(<style(\\s+scoped)?>)/gm,\n        end: /^(\\s*)(<\\/style>)/gm,\n        subLanguage: "css",\n        excludeBegin: true,\n        excludeEnd: true,\n      },\n      {\n        begin: /^(?:\\s*)(?:<style(?:\\s+scoped)?\\s+lang=(["\'])(?:s[ca]ss)\\1(?:\\s+scoped)?>)/gm,\n        end: /^(\\s*)(<\\/style>)/gm,\n        subLanguage: "scss",\n        excludeBegin: true,\n        excludeEnd: true,\n      },\n      {\n        begin: /^(?:\\s*)(?:<style(?:\\s+scoped)?\\s+lang=(["\'])stylus\\1(?:\\s+scoped)?>)/gm,\n        end: /^(\\s*)(<\\/style>)/gm,\n        subLanguage: "stylus",\n        excludeBegin: true,\n        excludeEnd: true,\n      },\n    ],\n  };\n});\n\nexport type DiffAST = ReturnType<typeof lowlight.highlight>;\n\nexport type DiffHighlighter = {\n  name: string;\n  maxLineToIgnoreSyntax: number;\n  setMaxLineToIgnoreSyntax: (v: number) => void;\n  ignoreSyntaxHighlightList: (string | RegExp)[];\n  setIgnoreSyntaxHighlightList: (v: (string | RegExp)[]) => void;\n  getAST: (raw: string, fileName?: string, lang?: string) => DiffAST;\n  processAST: (ast: DiffAST) => { syntaxFileObject: Record<number, SyntaxLine>; syntaxFileLineNumber: number };\n  hasRegisteredCurrentLang: (lang: string) => boolean;\n  getHighlighterEngine: () => typeof lowlight;\n};\n\nconst instance = { name: "lowlight" };\n\nlet _maxLineToIgnoreSyntax = 2000;\n\nconst _ignoreSyntaxHighlightList: (string | RegExp)[] = [];\n\nObject.defineProperty(instance, "maxLineToIgnoreSyntax", {\n  get: () => _maxLineToIgnoreSyntax,\n});\n\nObject.defineProperty(instance, "setMaxLineToIgnoreSyntax", {\n  value: (v: number) => {\n    _maxLineToIgnoreSyntax = v;\n  },\n});\n\nObject.defineProperty(instance, "ignoreSyntaxHighlightList", {\n  get: () => _ignoreSyntaxHighlightList,\n});\n\nObject.defineProperty(instance, "setIgnoreSyntaxHighlightList", {\n  value: (v: (string | RegExp)[]) => {\n    _ignoreSyntaxHighlightList.length = 0;\n    _ignoreSyntaxHighlightList.push(...v);\n  },\n});\n\nObject.defineProperty(instance, "getAST", {\n  value: (raw: string, fileName?: string, lang?: string) => {\n    let hasRegisteredLang = true;\n\n    if (!lowlight.registered(lang)) {\n      __DEV__ && console.warn(`not support current lang: ${lang} yet`);\n      hasRegisteredLang = false;\n    }\n\n    if (\n      fileName &&\n      highlighter.ignoreSyntaxHighlightList.some((item) =>\n        item instanceof RegExp ? item.test(fileName) : fileName === item\n      )\n    ) {\n      __DEV__ &&\n        console.warn(\n          `ignore syntax for current file, because the fileName is in the ignoreSyntaxHighlightList: ${fileName}`\n        );\n      return;\n    }\n\n    if (hasRegisteredLang) {\n      return lowlight.highlight(lang, raw);\n    } else {\n      return lowlight.highlightAuto(raw);\n    }\n  },\n});\n\nObject.defineProperty(instance, "processAST", {\n  value: (ast: DiffAST) => {\n    return processAST(ast);\n  },\n});\n\nObject.defineProperty(instance, "hasRegisteredCurrentLang", {\n  value: (lang: string) => {\n    return lowlight.registered(lang);\n  },\n});\n\nexport { processAST } from "./processAST";\n\nexport const versions = __VERSION__;\n\nexport const highlighter: DiffHighlighter = instance as DiffHighlighter;\n'
  );

  const [file2, setFile2] = useState(
    'import { getHighlighter } from "shiki";\n\nimport { processAST, type SyntaxLine } from "./processAST";\n\nimport type { codeToHast } from "shiki";\n\nexport type DiffAST = DePromise<ReturnType<typeof codeToHast>>;\n\nexport type DiffHighlighter = {\n  name: string;\n  maxLineToIgnoreSyntax: number;\n  setMaxLineToIgnoreSyntax: (v: number) => void;\n  ignoreSyntaxHighlightList: (string | RegExp)[];\n  setIgnoreSyntaxHighlightList: (v: (string | RegExp)[]) => void;\n  getAST: (raw: string, fileName?: string, lang?: string) => DiffAST;\n  processAST: (ast: DiffAST) => { syntaxFileObject: Record<number, SyntaxLine>; syntaxFileLineNumber: number };\n  hasRegisteredCurrentLang: (lang: string) => boolean;\n  getHighlighterEngine: () => DePromise<ReturnType<typeof getHighlighter>> | null;\n};\n\nlet internal: DePromise<ReturnType<typeof getHighlighter>> | null = null;\n\nconst getDefaultHighlighter = async () =>\n  await getHighlighter({\n    themes: ["github-light", "github-dark"],\n    langs: [\n      "cpp",\n      "java",\n      "javascript",\n      "css",\n      "c#",\n      "c",\n      "c++",\n      "vue",\n      "vue-html",\n      "astro",\n      "bash",\n      "make",\n      "markdown",\n      "makefile",\n      "bat",\n      "cmake",\n      "cmd",\n      "csv",\n      "docker",\n      "dockerfile",\n      "go",\n      "python",\n      "html",\n      "jsx",\n      "tsx",\n      "typescript",\n      "sql",\n      "xml",\n      "sass",\n      "ssh-config",\n      "kotlin",\n      "json",\n      "swift",\n      "txt",\n      "diff",\n    ],\n  });\n\nconst instance = { name: "shiki" };\n\nlet _maxLineToIgnoreSyntax = 2000;\n\nconst _ignoreSyntaxHighlightList: (string | RegExp)[] = [];\n\nObject.defineProperty(instance, "maxLineToIgnoreSyntax", {\n  get: () => _maxLineToIgnoreSyntax,\n});\n\nObject.defineProperty(instance, "setMaxLineToIgnoreSyntax", {\n  value: (v: number) => {\n    _maxLineToIgnoreSyntax = v;\n  },\n});\n\nObject.defineProperty(instance, "ignoreSyntaxHighlightList", {\n  get: () => _ignoreSyntaxHighlightList,\n});\n\nObject.defineProperty(instance, "setIgnoreSyntaxHighlightList", {\n  value: (v: (string | RegExp)[]) => {\n    _ignoreSyntaxHighlightList.length = 0;\n    _ignoreSyntaxHighlightList.push(...v);\n  },\n});\n\nObject.defineProperty(instance, "getAST", {\n  value: (raw: string, fileName?: string, lang?: string) => {\n    if (\n      fileName &&\n      highlighter.ignoreSyntaxHighlightList.some((item) =>\n        item instanceof RegExp ? item.test(fileName) : fileName === item\n      )\n    ) {\n      __DEV__ &&\n        console.warn(\n          `ignore syntax for current file, because the fileName is in the ignoreSyntaxHighlightList: ${fileName}`\n        );\n      return;\n    }\n\n    try {\n      return internal?.codeToHast(raw, { lang: lang, theme: "github-light", mergeWhitespaces: false });\n    } catch (e) {\n      if (__DEV__) {\n        console.error(e);\n      } else {\n        console.log((e as Error).message);\n      }\n      return;\n    }\n  },\n});\n\nObject.defineProperty(instance, "processAST", {\n  value: (ast: DiffAST) => {\n    return processAST(ast);\n  },\n});\n\nObject.defineProperty(instance, "hasRegisteredCurrentLang", {\n  value: (lang: string) => {\n    return internal?.getLanguage(lang) !== undefined;\n  },\n});\n\nObject.defineProperty(instance, "getHighlighterEngine", {\n  value: () => {\n    return internal;\n  },\n});\n\nconst highlighter: DiffHighlighter = instance as DiffHighlighter;\n\nexport const highlighterReady = new Promise<DiffHighlighter>((r) => {\n  if (internal) {\n    r(highlighter);\n  } else {\n    getDefaultHighlighter()\n      .then((i) => {\n        internal = i;\n      })\n      .then(() => r(highlighter));\n  }\n});\n\nexport { processAST } from "./processAST";\n\nexport const versions = __VERSION__;\n\nexport * from "shiki";\n'
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
  }, [file1, file2, lang1, lang2, ignoreWhiteSpace]);

  useEffect(() => {
    setEnableFastDiffTemplate(fastDiffTemplate);
    reloadDiffInstance();
  }, [fastDiffTemplate]);

  return (
    <div className="m-auto mb-[1em] mt-[1em] w-[90%]">
      <h2 className="flex flex-wrap gap-x-8 gap-y-4 text-[24px]">
        <span>
          <Code className="text-[24px]">File diff</Code> mode
        </span>
        <div className="inline-block text-[14px]">
          <Button onClick={onClick}>Go to `Git diff` mode</Button>
        </div>
        <div className="inline-flex gap-x-4">
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
          <textarea
            cols={10}
            rows={5}
            autoFocus
            className="border-color font-reset rounded-[4px] border-2 p-[4px] text-[14px]"
            placeholder="provider a file content"
            value={file1}
            onChange={(e) => setFile1(e.target.value)}
          />
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
          <textarea
            cols={10}
            rows={5}
            autoFocus
            className="border-color font-reset rounded-[4px] border-2 p-[4px] text-[14px]"
            placeholder="provider a file content"
            value={file2}
            onChange={(e) => setFile2(e.target.value)}
          />
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
