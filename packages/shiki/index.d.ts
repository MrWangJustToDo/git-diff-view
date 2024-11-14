// Generated by dts-bundle-generator v9.5.1

import { codeToHast, createHighlighter } from 'shiki';

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
export type DiffHighlighterLang = "cpp" | "java" | "javascript" | "css" | "c#" | "c" | "c++" | "vue" | "vue-html" | "astro" | "bash" | "make" | "markdown" | "makefile" | "bat" | "cmake" | "cmd" | "csv" | "docker" | "dockerfile" | "go" | "python" | "html" | "jsx" | "tsx" | "typescript" | "sql" | "xml" | "sass" | "ssh-config" | "kotlin" | "json" | "swift" | "txt" | "diff";
declare function getAst(raw: string, fileName?: string, lang?: DiffHighlighterLang, theme?: "light" | "dark"): DiffAST;
declare function getAst(raw: string, fileName?: string, lang?: string, theme?: "light" | "dark"): DiffAST;
export type DePromise<T> = T extends Promise<infer U> ? DePromise<U> : T;
export type DiffAST = DePromise<ReturnType<typeof codeToHast>>;
export type DiffHighlighter = {
	name: string;
	type: "class" | "style" | string;
	maxLineToIgnoreSyntax: number;
	setMaxLineToIgnoreSyntax: (v: number) => void;
	ignoreSyntaxHighlightList: (string | RegExp)[];
	setIgnoreSyntaxHighlightList: (v: (string | RegExp)[]) => void;
	getAST: typeof getAst;
	processAST: (ast: DiffAST) => {
		syntaxFileObject: Record<number, SyntaxLine>;
		syntaxFileLineNumber: number;
	};
	hasRegisteredCurrentLang: (lang: string) => boolean;
	getHighlighterEngine: () => DePromise<ReturnType<typeof createHighlighter>> | null;
};
export declare const highlighterReady: Promise<DiffHighlighter>;
export declare const versions: string;
export * from "shiki";

export {
	codeToHast,
	createHighlighter,
};

export {};
