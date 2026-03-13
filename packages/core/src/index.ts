/* eslint-disable import/export */
export * from "./parse";
export * from "./file";
export * from "./diff-file";
export * from "./escape-html";
export * from "./diff-file-utils";

// Re-export only types from @git-diff-view/lowlight to avoid bundling
// all highlight.js languages. Users who want the built-in lowlight
// highlighter should import it from @git-diff-view/lowlight directly.
export type { DiffHighlighter, DiffHighlighterLang, DiffAST, SyntaxLine, SyntaxNode } from "@git-diff-view/lowlight";

export const versions = __VERSION__;
