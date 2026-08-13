/**
 * Lynx-safe stub replacing `@git-diff-view/lowlight`.
 *
 * Full lowlight/highlight.js ships language grammars that use Unicode property
 * escapes (`\p{...}`) and other regex features Lynx's JS engine cannot parse,
 * which fails bytecode generation with:
 *   SyntaxError: invalid escape sequence in regular expression
 *
 * Prefer pre-highlighted `DiffFile` (initSyntax on Node/worker) or a custom
 * `registerHighlighter` that only uses Lynx-safe regexes.
 */

import { processAST } from "@git-diff-view/utils";

import type { DiffAST, SyntaxLine } from "@git-diff-view/utils";

export type DiffHighlighterLang = string;

export type DiffHighlighter = {
  name: string;
  type: "class" | "style" | string;
  maxLineToIgnoreSyntax: number;
  setMaxLineToIgnoreSyntax: (v: number) => void;
  ignoreSyntaxHighlightList: (string | RegExp)[];
  setIgnoreSyntaxHighlightList: (v: (string | RegExp)[]) => void;
  getAST: (raw: string, fileName?: string, lang?: string) => DiffAST | undefined;
  processAST: (ast: DiffAST) => { syntaxFileObject: Record<number, SyntaxLine>; syntaxFileLineNumber: number };
  hasRegisteredCurrentLang: (lang: string) => boolean;
  getHighlighterEngine: () => null;
};

const ignoreList: (string | RegExp)[] = [];

let maxLineToIgnoreSyntax = 2000;

export const highlighter: DiffHighlighter = {
  name: "lynx-stub",
  type: "class",
  get maxLineToIgnoreSyntax() {
    return maxLineToIgnoreSyntax;
  },
  setMaxLineToIgnoreSyntax: (v: number) => {
    maxLineToIgnoreSyntax = v;
  },
  get ignoreSyntaxHighlightList() {
    return ignoreList;
  },
  setIgnoreSyntaxHighlightList: (v: (string | RegExp)[]) => {
    ignoreList.length = 0;
    ignoreList.push(...v);
  },
  getAST: () => undefined,
  processAST,
  hasRegisteredCurrentLang: () => false,
  getHighlighterEngine: () => null,
};

export { processAST };

export const versions = "0.0.0-lynx-stub";
