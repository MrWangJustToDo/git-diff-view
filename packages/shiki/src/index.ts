import { getHighlighter } from "shiki";

import { processAST, type SyntaxLine } from "./processAST";

import type { codeToHast } from "shiki";

export type DiffAST = DePromise<ReturnType<typeof codeToHast>>;

export type DiffHighlighter = {
  name: string;
  maxLineToIgnoreSyntax: number;
  setMaxLineToIgnoreSyntax: (v: number) => void;
  ignoreSyntaxHighlightList: (string | RegExp)[];
  setIgnoreSyntaxHighlightList: (v: (string | RegExp)[]) => void;
  getAST: (raw: string, fileName?: string, lang?: string) => DiffAST;
  processAST: (ast: DiffAST) => { syntaxFileObject: Record<number, SyntaxLine>; syntaxFileLineNumber: number };
};

let internal: DePromise<ReturnType<typeof getHighlighter>> | null = null;

const getDefaultHighlighter = async () =>
  await getHighlighter({
    themes: ["github-light", "github-dark"],
    langs: [
      "cpp",
      "java",
      "javascript",
      "css",
      "c#",
      "c",
      "c++",
      "vue",
      "vue-html",
      "astro",
      "bash",
      "make",
      "markdown",
      "makefile",
      "bat",
      "cmake",
      "cmd",
      "csv",
      "docker",
      "dockerfile",
      "go",
      "python",
      "html",
      "jsx",
      "tsx",
      "typescript",
      "sql",
      "xml",
      "sass",
      "ssh-config",
      "kotlin",
      "json",
      "swift",
      "txt",
    ],
  });

const instance = { name: "shiki" };

let _maxLineToIgnoreSyntax = 2000;

const _ignoreSyntaxHighlightList: (string | RegExp)[] = [];

Object.defineProperty(instance, "maxLineToIgnoreSyntax", {
  get: () => _maxLineToIgnoreSyntax,
});

Object.defineProperty(instance, "setMaxLineToIgnoreSyntax", {
  value: (v: number) => {
    _maxLineToIgnoreSyntax = v;
  },
});

Object.defineProperty(instance, "ignoreSyntaxHighlightList", {
  get: () => _ignoreSyntaxHighlightList,
});

Object.defineProperty(instance, "setIgnoreSyntaxHighlightList", {
  value: (v: (string | RegExp)[]) => {
    _ignoreSyntaxHighlightList.length = 0;
    _ignoreSyntaxHighlightList.push(...v);
  },
});

Object.defineProperty(instance, "getAST", {
  value: (raw: string, fileName?: string, lang?: string) => {
    if (
      fileName &&
      highlighter.ignoreSyntaxHighlightList.some((item) =>
        item instanceof RegExp ? item.test(fileName) : fileName === item
      )
    ) {
      __DEV__ &&
        console.warn(
          `ignore syntax for current file, because the fileName is in the ignoreSyntaxHighlightList: ${fileName}`
        );
      return;
    }

    return internal?.codeToHast(raw, { lang: lang, theme: "github-light" });
  },
});

Object.defineProperty(instance, "processAST", {
  value: (ast: DiffAST) => {
    return processAST(ast);
  },
});

const highlighter: DiffHighlighter = instance as DiffHighlighter;

export const highlighterReady = new Promise<DiffHighlighter>((r) => {
  if (internal) {
    r(highlighter);
  } else {
    getDefaultHighlighter()
      .then((i) => {
        internal = i;
      })
      .then(() => r(highlighter));
  }
});

export { processAST } from "./processAST";

export * from "shiki";
