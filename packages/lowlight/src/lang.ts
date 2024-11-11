import type { DiffAST } from ".";

export type DiffHighlighterLang =
  | "arduino"
  | "bash"
  | "c"
  | "cpp"
  | "csharp"
  | "css"
  | "diff"
  | "go"
  | "graphql"
  | "ini"
  | "java"
  | "javascript"
  | "jsx"
  | "json"
  | "kotlin"
  | "less"
  | "lua"
  | "makefile"
  | "markdown"
  | "objectivec"
  | "perl"
  | "php"
  | "php-template"
  | "plaintext"
  | "python"
  | "python-repl"
  | "r"
  | "ruby"
  | "rust"
  | "scss"
  | "shell"
  | "sql"
  | "swift"
  | "typescript"
  | "tsx"
  | "vbnet"
  | "wasm"
  | "xml"
  | "yaml"
  | "abnf"
  | "accesslog"
  | "actionscript"
  | "ada"
  | "angelscript"
  | "apache"
  | "applescript"
  | "arcade"
  | "armasm"
  | "asciidoc"
  | "aspectj"
  | "autohotkey"
  | "autoit"
  | "avrasm"
  | "awk"
  | "axapta"
  | "basic"
  | "bnf"
  | "brainfuck"
  | "cal"
  | "capnproto"
  | "ceylon"
  | "clean"
  | "clojure"
  | "clojure-repl"
  | "cmake"
  | "coffeescript"
  | "coq"
  | "cos"
  | "crmsh"
  | "crystal"
  | "csp"
  | "d"
  | "dart"
  | "delphi"
  | "django"
  | "dns"
  | "dockerfile"
  | "dos"
  | "dsconfig"
  | "dts"
  | "dust"
  | "ebnf"
  | "elixir"
  | "elm"
  | "erb"
  | "erlang"
  | "erlang-repl"
  | "excel"
  | "fix"
  | "flix"
  | "fortran"
  | "fsharp"
  | "gams"
  | "gauss"
  | "gcode"
  | "gherkin"
  | "glsl"
  | "gml"
  | "golo"
  | "gradle"
  | "groovy"
  | "haml"
  | "handlebars"
  | "haskell"
  | "haxe"
  | "hsp"
  | "http"
  | "hy"
  | "inform7"
  | "irpf90"
  | "isbl"
  | "jboss-cli"
  | "julia"
  | "julia-repl"
  | "lasso"
  | "latex"
  | "ldif"
  | "leaf"
  | "lisp"
  | "livecodeserver"
  | "livescript"
  | "llvm"
  | "lsl"
  | "mathematica"
  | "matlab"
  | "maxima"
  | "mel"
  | "mercury"
  | "mipsasm"
  | "mizar"
  | "mojolicious"
  | "monkey"
  | "moonscript"
  | "n1ql"
  | "nestedtext"
  | "nginx"
  | "nim"
  | "nix"
  | "node-repl"
  | "nsis"
  | "ocaml"
  | "openscad"
  | "oxygene"
  | "parser3"
  | "pf"
  | "pgsql"
  | "pony"
  | "powershell"
  | "processing"
  | "profile"
  | "prolog"
  | "properties"
  | "protobuf"
  | "puppet"
  | "purebasic"
  | "q"
  | "qml"
  | "reasonml"
  | "rib"
  | "roboconf"
  | "routeros"
  | "rsl"
  | "ruleslanguage"
  | "sas"
  | "scala"
  | "scheme"
  | "scilab"
  | "smali"
  | "smalltalk"
  | "sml"
  | "sqf"
  | "stan"
  | "stata"
  | "step21"
  | "stylus"
  | "subunit"
  | "taggerscript"
  | "tap"
  | "tcl"
  | "thrift"
  | "tp"
  | "twig"
  | "vala"
  | "vbscript"
  | "vbscript-html"
  | "verilog"
  | "vhdl"
  | "vim"
  | "wren"
  | "x86asm"
  | "xl"
  | "xquery"
  | "zephi";


// type helper function
export function getAst(raw: string, fileName?: string, lang?: DiffHighlighterLang, theme?: "light" | "dark"): DiffAST;
export function getAst(raw: string, fileName?: string, lang?: string, theme?: "light" | "dark"): DiffAST;
export function getAst(_raw: string, _fileName?: string, _lang?: DiffHighlighterLang | string, _theme?: "light" | "dark") {
  return {} as DiffAST;
}
