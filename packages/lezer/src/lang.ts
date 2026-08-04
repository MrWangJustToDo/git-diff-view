import type { DiffAST } from "@git-diff-view/utils";

export type DiffHighlighterLang =
  | "javascript"
  | "js"
  | "jsx"
  | "typescript"
  | "ts"
  | "tsx"
  | "json"
  | "python"
  | "py"
  | "java"
  | "cpp"
  | "c"
  | "c++"
  | "css"
  | "html"
  | "xml"
  | "rust"
  | "rs"
  | "go"
  | "golang"
  | "php"
  | "yaml"
  | "yml"
  | "markdown"
  | "md"
  | "sass"
  | "scss";

// type helper function
export function _getAST(raw: string, fileName?: string, lang?: DiffHighlighterLang, theme?: "light" | "dark"): DiffAST;
export function _getAST(raw: string, fileName?: string, lang?: string, theme?: "light" | "dark"): DiffAST;
export function _getAST(
  _raw: string,
  _fileName?: string,
  _lang?: DiffHighlighterLang | string,
  _theme?: "light" | "dark"
) {
  if (__DEV__) {
    console.warn("This is a type helper function, do not call it directly.");
  }
  return {} as DiffAST;
}
