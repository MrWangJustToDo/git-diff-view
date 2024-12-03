import { createHighlighter } from "shiki";

import { processAST, type SyntaxLine } from "./processAST";

import type { _getAST } from "./lang";
import type { codeToHast } from "shiki";

type DePromise<T> = T extends Promise<infer U> ? DePromise<U> : T;

export type DiffAST = DePromise<ReturnType<typeof codeToHast>>;

export type DiffHighlighter = {
  name: string;
  type: "class" | "style" | string;
  maxLineToIgnoreSyntax: number;
  setMaxLineToIgnoreSyntax: (v: number) => void;
  ignoreSyntaxHighlightList: (string | RegExp)[];
  setIgnoreSyntaxHighlightList: (v: (string | RegExp)[]) => void;
  getAST: typeof _getAST;
  processAST: (ast: DiffAST) => { syntaxFileObject: Record<number, SyntaxLine>; syntaxFileLineNumber: number };
  hasRegisteredCurrentLang: (lang: string) => boolean;
  getHighlighterEngine: () => DePromise<ReturnType<typeof createHighlighter>> | null;
};

let internal: DePromise<ReturnType<typeof createHighlighter>> | null = null;

const getDefaultHighlighter = async () =>
  await createHighlighter({
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
      "diff",
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

    try {
      return internal?.codeToHast(raw, {
        lang: lang,
        themes: {
          dark: "github-dark",
          light: "github-light",
        },
        cssVariablePrefix: "--diff-view-",
        defaultColor: false,
        mergeWhitespaces: false,
      });
    } catch (e) {
      if (__DEV__) {
        console.error(e);
      } else {
        console.log((e as Error).message);
      }
      return;
    }
  },
});

Object.defineProperty(instance, "processAST", {
  value: (ast: DiffAST) => {
    return processAST(ast);
  },
});

Object.defineProperty(instance, "hasRegisteredCurrentLang", {
  value: (lang: string) => {
    return internal?.getLanguage(lang) !== undefined;
  },
});

Object.defineProperty(instance, "getHighlighterEngine", {
  value: () => {
    return internal;
  },
});

Object.defineProperty(instance, "type", { value: "class" });

const highlighter: DiffHighlighter = instance as DiffHighlighter;

// TODO: change to use function
/**
 * @deprecated
 * try to use `getDiffViewHighlighter` instead
 * 
 * @example
 * ```ts
 * import { highlighterReady } from '@git-diff-view/shiki'
 *
 * highlighterReady.then((highlighter) => {
 *  // do something with highlighter
 * })
 * ```
 */
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

/**
 * get the shiki diffView highlighter
 * @returns Promise<DiffHighlighter>
 * 
 * @example
 * ```ts
 * import { getDiffViewHighlighter } from '@git-diff-view/shiki'
 * 
 * getDiffViewHighlighter().then((highlighter) => {
 *  // do something with highlighter
 * }
 * ```
 */
export const getDiffViewHighlighter = () => highlighterReady;

export { processAST } from "./processAST";

export const versions = __VERSION__;

export * from "shiki";
