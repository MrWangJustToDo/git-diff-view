import { processAST } from "@git-diff-view/utils";

import { treeToHast } from "./hast";
import { createLanguageRegistry, defaultLanguages } from "./parsers";
import { resetTokenColors, setTokenColors } from "./theme";

import type { _getAST } from "./lang";
import type { LezerLanguage, LezerLanguageName } from "./parsers";
import type { TokenColorRule } from "./theme";
import type { DiffAST, SyntaxLine } from "@git-diff-view/utils";

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
  getHighlighterEngine: () => ReturnType<typeof createLanguageRegistry>;
};

export type GetDiffViewHighlighterOptions = {
  /**
   * Subset of built-in language names to register.
   * When omitted, all default languages are available.
   */
  langs?: LezerLanguageName[];
  /**
   * Extra / override language parsers.
   */
  languages?: LezerLanguage[];
  /**
   * Token colors for hast styles (`--diff-view-light` / `--diff-view-dark`).
   * Replaces the default palette unless `extendTokenColors` is true.
   */
  tokenColors?: TokenColorRule[];
  /**
   * When true, merge `tokenColors` onto the built-in GitHub-like palette
   * (same `tag` replaces the default rule).
   */
  extendTokenColors?: boolean;
};

let registry = createLanguageRegistry(defaultLanguages);

const rebuildRegistry = (options?: GetDiffViewHighlighterOptions) => {
  const base =
    Array.isArray(options?.langs) && options.langs.length > 0
      ? defaultLanguages.filter((item) => options.langs!.includes(item.name as LezerLanguageName))
      : defaultLanguages;

  const next = createLanguageRegistry(base);

  if (Array.isArray(options?.languages)) {
    for (const language of options.languages) {
      next.register(language);
    }
  }

  registry = next;

  return registry;
};

const applyTokenColors = (options?: GetDiffViewHighlighterOptions) => {
  if (!options?.tokenColors) {
    if (!options?.extendTokenColors) {
      resetTokenColors();
    }
    return;
  }

  setTokenColors(options.tokenColors, { extend: !!options.extendTokenColors });
};

const instance = { name: "lezer" };

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

    const language = lang ? registry.get(lang) : undefined;

    if (!language) {
      if (__DEV__ && lang) {
        console.warn(`[@git-diff-view/lezer] not support current lang: ${lang} yet`);
      }
      return;
    }

    try {
      const tree = language.parse(raw);
      return treeToHast(raw, tree);
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
    return registry.has(lang);
  },
});

Object.defineProperty(instance, "getHighlighterEngine", {
  value: () => registry,
});

Object.defineProperty(instance, "type", { value: "class" });

const highlighter: DiffHighlighter = instance as DiffHighlighter;

/**
 * Register an extra language parser on the current engine.
 */
export const registerLanguage = (language: LezerLanguage) => {
  registry.register(language);
};

/**
 * get the lezer diffView highlighter
 * @returns Promise<DiffHighlighter>
 *
 * @example
 * ```ts
 * import { getDiffViewHighlighter, tags } from '@git-diff-view/lezer'
 *
 * const highlighter = await getDiffViewHighlighter({
 *   extendTokenColors: true,
 *   tokenColors: [{ tag: tags.keyword, color: { light: '#d73a49', dark: '#ff7b72' } }],
 * })
 * ```
 */
export const getDiffViewHighlighter = async (options?: GetDiffViewHighlighterOptions) => {
  rebuildRegistry(options);
  applyTokenColors(options);
  return highlighter;
};

export { processAST } from "@git-diff-view/utils";

export { treeToHast } from "./hast";

export { createLanguageRegistry, defaultLanguages } from "./parsers";

export type { LezerLanguage, LezerLanguageName, LezerParse } from "./parsers";

export {
  createCssVarHighlighter,
  cssVarHighlighter,
  defaultTokenColors,
  getCssVarHighlighter,
  getTokenColors,
  mergeTokenColors,
  resetTokenColors,
  setTokenColors,
} from "./theme";

export type { ThemeColor, TokenColorRule } from "./theme";

export { tags } from "@lezer/highlight";

export { highlighter };

export const versions = __VERSION__;

export * from "./lang";
