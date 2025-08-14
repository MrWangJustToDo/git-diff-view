import type { DiffAST } from "@git-diff-view/utils";

export type DiffHighlighterLang =
  | "cpp"
  | "java"
  | "javascript"
  | "css"
  | "c#"
  | "c"
  | "c++"
  | "vue"
  | "vue-html"
  | "astro"
  | "bash"
  | "make"
  | "markdown"
  | "makefile"
  | "bat"
  | "cmake"
  | "cmd"
  | "csv"
  | "docker"
  | "dockerfile"
  | "go"
  | "python"
  | "html"
  | "jsx"
  | "tsx"
  | "typescript"
  | "sql"
  | "xml"
  | "sass"
  | "ssh-config"
  | "kotlin"
  | "json"
  | "swift"
  | "txt"
  | "diff";

// type helper function
export function _getAST(raw: string, fileName?: string, lang?: DiffHighlighterLang, theme?: "light" | "dark"): DiffAST;
export function _getAST(raw: string, fileName?: string, lang?: string, theme?: "light" | "dark"): DiffAST;
export function _getAST(
  _raw: string,
  _fileName?: string,
  _lang?: DiffHighlighterLang | string,
  _theme?: "light" | "dark"
) {
  return {} as DiffAST;
}
