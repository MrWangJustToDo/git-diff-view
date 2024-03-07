import { createLowlight, all } from "lowlight";

import { processAST, type SyntaxLine } from "./processAST";

const lowlight = createLowlight(all);

lowlight.register("vue", function hljsDefineVue(hljs) {
  return {
    subLanguage: "xml",
    contains: [
      hljs.COMMENT("<!--", "-->", {
        relevance: 10,
      }),
      {
        begin: /^(\s*)(<script>)/gm,
        end: /^(\s*)(<\/script>)/gm,
        subLanguage: "javascript",
        excludeBegin: true,
        excludeEnd: true,
      },
      {
        begin: /^(?:\s*)(?:<script\s+lang=(["'])ts\1>)/gm,
        end: /^(\s*)(<\/script>)/gm,
        subLanguage: "typescript",
        excludeBegin: true,
        excludeEnd: true,
      },
      {
        begin: /^(\s*)(<style(\s+scoped)?>)/gm,
        end: /^(\s*)(<\/style>)/gm,
        subLanguage: "css",
        excludeBegin: true,
        excludeEnd: true,
      },
      {
        begin: /^(?:\s*)(?:<style(?:\s+scoped)?\s+lang=(["'])(?:s[ca]ss)\1(?:\s+scoped)?>)/gm,
        end: /^(\s*)(<\/style>)/gm,
        subLanguage: "scss",
        excludeBegin: true,
        excludeEnd: true,
      },
      {
        begin: /^(?:\s*)(?:<style(?:\s+scoped)?\s+lang=(["'])stylus\1(?:\s+scoped)?>)/gm,
        end: /^(\s*)(<\/style>)/gm,
        subLanguage: "stylus",
        excludeBegin: true,
        excludeEnd: true,
      },
    ],
  };
});

export type AST = ReturnType<typeof lowlight.highlight>;

export const highlighter = lowlight as typeof lowlight & {
  maxLineToIgnoreSyntax: number;
  autoDetectLang: boolean;
  setMaxLineToIgnoreSyntax: (v: number) => void;
  setAutoDetectLang: (v: boolean) => void;
  ignoreSyntaxHighlightList: (string | RegExp)[];
  setIgnoreSyntaxHighlightList: (v: (string | RegExp)[]) => void;
  getAST: (raw: string, fileName?: string, lang?: string) => AST;
  processAST: (ast: AST) => { syntaxFileObject: Record<number, SyntaxLine>; syntaxFileLineNumber: number };
};

let _autoDetectLang = true;

let _maxLineToIgnoreSyntax = 2000;

const _ignoreSyntaxHighlightList: (string | RegExp)[] = [];

Object.defineProperty(highlighter, "maxLineToIgnoreSyntax", {
  get: () => _maxLineToIgnoreSyntax,
});

Object.defineProperty(highlighter, "setMaxLineToIgnoreSyntax", {
  value: (v: number) => {
    _maxLineToIgnoreSyntax = v;
  },
});

Object.defineProperty(highlighter, "autoDetectLang", {
  get: () => _autoDetectLang,
});

Object.defineProperty(highlighter, "setAutoDetectLang", {
  value: (v: boolean) => {
    _autoDetectLang = v;
  },
});

Object.defineProperty(highlighter, "ignoreSyntaxHighlightList", {
  get: () => _ignoreSyntaxHighlightList,
});

Object.defineProperty(highlighter, "setIgnoreSyntaxHighlightList", {
  value: (v: (string | RegExp)[]) => {
    _ignoreSyntaxHighlightList.length = 0;
    _ignoreSyntaxHighlightList.push(...v);
  },
});

Object.defineProperty(highlighter, "getAST", {
  value: (raw: string, fileName?: string, lang?: string) => {
    let hasRegisteredLang = true;

    if (!highlighter.registered(lang)) {
      __DEV__ && console.warn(`not support current lang: ${lang} yet`);
      hasRegisteredLang = false;
    }

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

    if (hasRegisteredLang) {
      return highlighter.highlight(lang, raw);
    } else {
      return highlighter.highlightAuto(raw);
    }
  },
});

Object.defineProperty(highlighter, "processAST", {
  value: (ast: AST) => {
    return processAST(ast);
  },
});