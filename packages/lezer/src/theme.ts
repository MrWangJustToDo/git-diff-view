import { tags, tagHighlighter } from "@lezer/highlight";

import type { Highlighter, Tag } from "@lezer/highlight";

export type ThemeColor = { light: string; dark: string };

export type TokenColorRule = {
  tag: Tag | readonly Tag[];
  color: ThemeColor;
};

/**
 * GitHub Light / Dark token colors adapted from
 * [@uiw/codemirror-theme-github](https://github.com/uiwjs/react-codemirror/blob/master/themes/github/src/index.ts).
 *
 * Only `color` is applied (via `--diff-view-light` / `--diff-view-dark`);
 * fontWeight / fontStyle / textDecoration / backgroundColor from the CM theme
 * are intentionally omitted for DiffView span rendering.
 */
const colors = {
  tagName: { light: "#116329", dark: "#7ee787" },
  comment: { light: "#6a737d", dark: "#8b949e" },
  className: { light: "#6f42c1", dark: "#d2a8ff" },
  variableName: { light: "#005cc5", dark: "#79c0ff" },
  keyword: { light: "#d73a49", dark: "#ff7b72" },
  string: { light: "#032f62", dark: "#a5d6ff" },
  name: { light: "#22863a", dark: "#7ee787" },
  heading: { light: "#24292e", dark: "#d2a8ff" },
  atom: { light: "#e36209", dark: "#ffab70" },
  deleted: { light: "#b31d28", dark: "#ffdcd7" },
  invalid: { light: "#cb2431", dark: "#f97583" },
  foreground: { light: "#24292e", dark: "#c9d1d9" },
  inserted: { light: "#22863a", dark: "#7ee787" },
  changed: { light: "#e36209", dark: "#ffab70" },
} as const satisfies Record<string, ThemeColor>;

/**
 * Default palette aligned with uiw GitHub theme tag groups, plus a few
 * extra common tags (definitionKeyword, function names, etc.) mapped to the
 * closest uiw color so unmatched tokens still inherit sensibly.
 */
export const defaultTokenColors: TokenColorRule[] = [
  // uiw: [standard(tagName), tagName]
  { tag: [tags.standard(tags.tagName), tags.tagName], color: colors.tagName },
  { tag: tags.angleBracket, color: colors.tagName },

  // uiw: [comment, bracket]
  { tag: [tags.comment, tags.bracket], color: colors.comment },
  { tag: tags.lineComment, color: colors.comment },
  { tag: tags.blockComment, color: colors.comment },
  { tag: tags.docComment, color: colors.comment },
  { tag: tags.paren, color: colors.comment },
  { tag: tags.brace, color: colors.comment },
  { tag: tags.squareBracket, color: colors.comment },
  { tag: tags.punctuation, color: colors.comment },
  { tag: tags.separator, color: colors.comment },

  // uiw: [className, propertyName]
  { tag: [tags.className, tags.propertyName], color: colors.className },
  { tag: tags.definition(tags.className), color: colors.className },
  { tag: tags.definition(tags.propertyName), color: colors.className },
  { tag: tags.macroName, color: colors.className },

  // uiw: [variableName, attributeName, number, operator]
  {
    tag: [tags.variableName, tags.attributeName, tags.number, tags.operator],
    color: colors.variableName,
  },
  { tag: tags.definition(tags.variableName), color: colors.variableName },
  { tag: tags.local(tags.variableName), color: colors.variableName },
  { tag: tags.integer, color: colors.variableName },
  { tag: tags.float, color: colors.variableName },
  { tag: tags.unit, color: colors.variableName },
  { tag: tags.color, color: colors.variableName },
  { tag: tags.labelName, color: colors.variableName },
  { tag: tags.compareOperator, color: colors.variableName },
  { tag: tags.logicOperator, color: colors.variableName },
  { tag: tags.arithmeticOperator, color: colors.variableName },
  { tag: tags.bitwiseOperator, color: colors.variableName },
  { tag: tags.derefOperator, color: colors.variableName },
  { tag: tags.updateOperator, color: colors.variableName },
  { tag: tags.definitionOperator, color: colors.variableName },
  { tag: tags.controlOperator, color: colors.variableName },

  // uiw: [keyword, typeName, typeOperator]
  { tag: [tags.keyword, tags.typeName, tags.typeOperator], color: colors.keyword },
  { tag: [tags.operatorKeyword, tags.modifier, tags.controlKeyword], color: colors.keyword },
  { tag: tags.definitionKeyword, color: colors.keyword },
  { tag: tags.moduleKeyword, color: colors.keyword },
  { tag: tags.self, color: colors.keyword },
  { tag: tags.definition(tags.typeName), color: colors.keyword },
  { tag: tags.namespace, color: colors.keyword },

  // uiw: [string, meta, regexp] + url/escape/link
  { tag: [tags.string, tags.meta, tags.regexp], color: colors.string },
  { tag: [tags.url, tags.escape, tags.link], color: colors.string },
  { tag: tags.special(tags.string), color: colors.string },
  { tag: tags.docString, color: colors.string },
  { tag: tags.character, color: colors.string },
  { tag: tags.attributeValue, color: colors.string },
  { tag: tags.documentMeta, color: colors.string },
  { tag: tags.annotation, color: colors.string },
  { tag: tags.processingInstruction, color: colors.string },
  { tag: tags.monospace, color: colors.string },

  // uiw: [name, quote]
  { tag: [tags.name, tags.quote], color: colors.name },

  // uiw: [heading, strong] / emphasis
  { tag: [tags.heading, tags.strong], color: colors.heading },
  { tag: tags.heading1, color: colors.heading },
  { tag: tags.heading2, color: colors.heading },
  { tag: tags.heading3, color: colors.heading },
  { tag: tags.heading4, color: colors.heading },
  { tag: tags.heading5, color: colors.heading },
  { tag: tags.heading6, color: colors.heading },
  { tag: tags.emphasis, color: colors.heading },
  { tag: tags.content, color: colors.foreground },
  { tag: tags.contentSeparator, color: colors.comment },
  { tag: tags.list, color: colors.foreground },
  { tag: tags.strikethrough, color: colors.comment },

  // uiw: [atom, bool, special(variableName)]
  { tag: [tags.atom, tags.bool, tags.special(tags.variableName)], color: colors.atom },
  { tag: tags.null, color: colors.atom },
  { tag: tags.literal, color: colors.atom },
  { tag: tags.constant(tags.name), color: colors.atom },
  { tag: tags.standard(tags.name), color: colors.atom },

  // function names → className/purple group (common GitHub highlighting)
  { tag: tags.function(tags.variableName), color: colors.className },
  { tag: tags.function(tags.propertyName), color: colors.className },
  { tag: tags.definition(tags.function(tags.variableName)), color: colors.className },

  { tag: tags.deleted, color: colors.deleted },
  { tag: tags.inserted, color: colors.inserted },
  { tag: tags.changed, color: colors.changed },
  { tag: tags.invalid, color: colors.invalid },
];

const toStyle = (color: ThemeColor) => `--diff-view-light:${color.light};--diff-view-dark:${color.dark}`;

export const createCssVarHighlighter = (rules: TokenColorRule[] = defaultTokenColors): Highlighter =>
  tagHighlighter(rules.map(({ tag, color }) => ({ tag, class: toStyle(color) })));

const sameTag = (a: Tag | readonly Tag[], b: Tag | readonly Tag[]) => {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, index) => item === b[index]);
  }
  return false;
};

/**
 * Merge override rules onto a base palette.
 * Rules with the same `tag` reference are replaced; others are appended.
 */
export const mergeTokenColors = (base: TokenColorRule[], overrides: TokenColorRule[]): TokenColorRule[] => {
  const filtered = base.filter((rule) => !overrides.some((item) => sameTag(rule.tag, item.tag)));
  return [...filtered, ...overrides];
};

let activeTokenColors: TokenColorRule[] = defaultTokenColors;
let activeHighlighter: Highlighter = createCssVarHighlighter(activeTokenColors);

export const getTokenColors = () => activeTokenColors;

export const getCssVarHighlighter = () => activeHighlighter;

/**
 * Set token colors used by `treeToHast` / `getAST`.
 *
 * @param rules Token color rules
 * @param options.extend When true, merge `rules` onto the default palette
 *   (same `tag` replaces the default rule). When false, replace the palette.
 */
export const setTokenColors = (rules: TokenColorRule[], options?: { extend?: boolean }) => {
  activeTokenColors = options?.extend ? mergeTokenColors(defaultTokenColors, rules) : [...rules];
  activeHighlighter = createCssVarHighlighter(activeTokenColors);
  return activeHighlighter;
};

/**
 * Reset token colors to the built-in GitHub-like palette.
 */
export const resetTokenColors = () => setTokenColors(defaultTokenColors);

/** @deprecated Use `getCssVarHighlighter()` — kept for existing imports */
export const cssVarHighlighter: Highlighter = new Proxy({} as Highlighter, {
  get(_target, prop, receiver) {
    return Reflect.get(activeHighlighter as object, prop, receiver);
  },
});
