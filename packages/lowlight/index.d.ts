// Generated by dts-bundle-generator v9.5.1

export type SyntaxNode = {
	type: string;
	value: string;
	lineNumber: number;
	startIndex: number;
	endIndex: number;
	properties?: {
		className?: string[];
		[key: string]: any;
	};
	children?: SyntaxNode[];
};
export type SyntaxLine = {
	value: string;
	lineNumber: number;
	valueLength: number;
	nodeList: {
		node: SyntaxNode;
		wrapper?: SyntaxNode;
	}[];
};
export declare const processAST: (ast: DiffAST) => {
	syntaxFileObject: Record<number, SyntaxLine>;
	syntaxFileLineNumber: number;
};
export type DiffHighlighterLang = "arduino" | "bash" | "c" | "cpp" | "csharp" | "css" | "diff" | "go" | "graphql" | "ini" | "java" | "javascript" | "jsx" | "json" | "kotlin" | "less" | "lua" | "makefile" | "markdown" | "objectivec" | "perl" | "php" | "php-template" | "plaintext" | "python" | "python-repl" | "r" | "ruby" | "rust" | "scss" | "shell" | "sql" | "swift" | "typescript" | "tsx" | "vbnet" | "wasm" | "xml" | "yaml" | "abnf" | "accesslog" | "actionscript" | "ada" | "angelscript" | "apache" | "applescript" | "arcade" | "armasm" | "asciidoc" | "aspectj" | "autohotkey" | "autoit" | "avrasm" | "awk" | "axapta" | "basic" | "bnf" | "brainfuck" | "cal" | "capnproto" | "ceylon" | "clean" | "clojure" | "clojure-repl" | "cmake" | "coffeescript" | "coq" | "cos" | "crmsh" | "crystal" | "csp" | "d" | "dart" | "delphi" | "django" | "dns" | "dockerfile" | "dos" | "dsconfig" | "dts" | "dust" | "ebnf" | "elixir" | "elm" | "erb" | "erlang" | "erlang-repl" | "excel" | "fix" | "flix" | "fortran" | "fsharp" | "gams" | "gauss" | "gcode" | "gherkin" | "glsl" | "gml" | "golo" | "gradle" | "groovy" | "haml" | "handlebars" | "haskell" | "haxe" | "hsp" | "http" | "hy" | "inform7" | "irpf90" | "isbl" | "jboss-cli" | "julia" | "julia-repl" | "lasso" | "latex" | "ldif" | "leaf" | "lisp" | "livecodeserver" | "livescript" | "llvm" | "lsl" | "mathematica" | "matlab" | "maxima" | "mel" | "mercury" | "mipsasm" | "mizar" | "mojolicious" | "monkey" | "moonscript" | "n1ql" | "nestedtext" | "nginx" | "nim" | "nix" | "node-repl" | "nsis" | "ocaml" | "openscad" | "oxygene" | "parser3" | "pf" | "pgsql" | "pony" | "powershell" | "processing" | "profile" | "prolog" | "properties" | "protobuf" | "puppet" | "purebasic" | "q" | "qml" | "reasonml" | "rib" | "roboconf" | "routeros" | "rsl" | "ruleslanguage" | "sas" | "scala" | "scheme" | "scilab" | "smali" | "smalltalk" | "sml" | "sqf" | "stan" | "stata" | "step21" | "stylus" | "subunit" | "taggerscript" | "tap" | "tcl" | "thrift" | "tp" | "twig" | "vala" | "vbscript" | "vbscript-html" | "verilog" | "vhdl" | "vim" | "wren" | "x86asm" | "xl" | "xquery" | "zephi" | "vue" | "vue-html";
export declare function _getAST(raw: string, fileName?: string, lang?: DiffHighlighterLang, theme?: "light" | "dark"): DiffAST;
export declare function _getAST(raw: string, fileName?: string, lang?: string, theme?: "light" | "dark"): DiffAST;
declare const lowlight: {
	highlight: (language: string, value: string, options?: Readonly<import("lowlight").Options>) => import("hast").Root;
	highlightAuto: (value: string, options?: Readonly<import("lowlight").AutoOptions>) => import("hast").Root;
	listLanguages: () => string[];
	register: {
		(grammars: Readonly<Record<string, import("highlight.js").LanguageFn>>): undefined;
		(name: string, grammar: import("highlight.js").LanguageFn): undefined;
	};
	registerAlias: {
		(aliases: Readonly<Record<string, string | readonly string[]>>): undefined;
		(language: string, alias: string | readonly string[]): undefined;
	};
	registered: (aliasOrName: string) => boolean;
};
export type DiffAST = ReturnType<typeof lowlight.highlight>;
export type DiffHighlighter = {
	name: string;
	type: "class" | "style" | string;
	maxLineToIgnoreSyntax: number;
	setMaxLineToIgnoreSyntax: (v: number) => void;
	ignoreSyntaxHighlightList: (string | RegExp)[];
	setIgnoreSyntaxHighlightList: (v: (string | RegExp)[]) => void;
	getAST: typeof _getAST;
	processAST: (ast: DiffAST) => {
		syntaxFileObject: Record<number, SyntaxLine>;
		syntaxFileLineNumber: number;
	};
	hasRegisteredCurrentLang: (lang: string) => boolean;
	getHighlighterEngine: () => typeof lowlight;
};
export declare const versions: string;
export declare const highlighter: DiffHighlighter;

export {};
