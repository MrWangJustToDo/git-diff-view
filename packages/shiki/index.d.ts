// Generated by dts-bundle-generator v9.5.1

import { codeToHast, getHighlighter } from 'shiki';

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
export type DePromise<T> = T extends Promise<infer U> ? U : T;
export type DiffAST = DePromise<ReturnType<typeof codeToHast>>;
export type DiffHighlighter = {
	name: string;
	maxLineToIgnoreSyntax: number;
	setMaxLineToIgnoreSyntax: (v: number) => void;
	ignoreSyntaxHighlightList: (string | RegExp)[];
	setIgnoreSyntaxHighlightList: (v: (string | RegExp)[]) => void;
	getAST: (raw: string, fileName?: string, lang?: string) => DiffAST;
	processAST: (ast: DiffAST) => {
		syntaxFileObject: Record<number, SyntaxLine>;
		syntaxFileLineNumber: number;
	};
	hasRegisteredCurrentLang: (lang: string) => boolean;
	getHighlighterEngine: () => DePromise<ReturnType<typeof getHighlighter>> | null;
};
export declare const highlighterReady: Promise<DiffHighlighter>;
export declare const versions: string;
export * from "shiki";

export {
	codeToHast,
	getHighlighter,
};

export {};
