import { createLowlight, all } from "lowlight";

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
};

let _autoDetectLang = true;

let _maxLineToIgnoreSyntax = 2000;

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
