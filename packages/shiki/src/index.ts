import { processAST } from "@git-diff-view/utils";
import { createHighlighter } from "shiki";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

import type { _getAST } from "./lang";
import type { DiffAST, SyntaxLine } from "@git-diff-view/utils";
import type { BundledLanguage } from "shiki";

type DePromise<T> = T extends Promise<infer U> ? DePromise<U> : T;

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

const jsEngine = createJavaScriptRegexEngine({ forgiving: true });

let provider: DePromise<ReturnType<typeof createHighlighter>> | null = null;

let defaultInternal: DePromise<ReturnType<typeof createHighlighter>> | null = null;

let customInternal: DePromise<ReturnType<typeof createHighlighter>> | null = null;

let customInternalLangs: BundledLanguage[] | null = null;

const getDefaultHighlighter = async () => {
  let i = defaultInternal;

  if (!i) {
    i = await createHighlighter({
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
      engine: jsEngine,
    });

    defaultInternal = i;
  }

  provider = i;

  return i;
};

const getHighlighter = async (langs?: BundledLanguage[]) => {
  if (Array.isArray(langs) && langs.length > 0) {
    let i = customInternal;

    if (!i) {
      i = await createHighlighter({
        themes: ["github-light", "github-dark"],
        langs,
        engine: jsEngine,
      });

      customInternal = i;

      customInternalLangs = langs;
    } else {
      if (__DEV__) {
        if (customInternalLangs) {
          if (customInternalLangs.length < langs.length) {
            console.warn(
              "@git-diff-view/shiki: custom langs has been set, but the new langs is different from the old one, please check your code"
            );
          } else if (!customInternalLangs.sort().join(",").startsWith(langs.sort().join(","))) {
            console.warn(
              "@git-diff-view/shiki: custom langs has been set, but the new langs is not a subset of the old one, please check your code"
            );
          }
        }
      }
    }

    provider = i;

    return i;
  } else {
    return await getDefaultHighlighter();
  }
};

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
      if (__DEV__) {
        console.warn(
          `ignore syntax for current file, because the fileName is in the ignoreSyntaxHighlightList: ${fileName}`
        );
      }
      return;
    }

    try {
      return (provider || customInternal || defaultInternal)?.codeToHast(raw, {
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
    return (provider || customInternal || defaultInternal)?.getLanguage(lang) !== undefined;
  },
});

Object.defineProperty(instance, "getHighlighterEngine", {
  value: () => {
    return provider || customInternal || defaultInternal;
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
  getDefaultHighlighter().then(() => r(highlighter));
}).then((r) => {
  const proxy = new Proxy(r, {
    get(target, prop, receiver) {
      if (typeof prop === "string" && prop !== "then") {
        console.warn("@git-diff-view/shiki: highlighterReady is deprecated, please use getDiffViewHighlighter instead");
      }
      return Reflect.get(target, prop, receiver);
    },
  });
  return proxy;
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
export const getDiffViewHighlighter = async (langs?: BundledLanguage[]) => {
  if (Array.isArray(langs) && langs.length > 0) {
    await getHighlighter(langs);

    return highlighter;
  } else {
    await getDefaultHighlighter();

    return highlighter;
  }
};

export { processAST } from "@git-diff-view/utils";

export const versions = __VERSION__;

export * from "shiki";
