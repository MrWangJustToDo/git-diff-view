// Generated by dts-bundle-generator v9.5.1

import { CSSProperties, ForwardedRef, ReactNode } from 'react';

declare class Cache$1<K, V> extends Map<K, V> {
	name: string;
	setMaxLength(length: number): void;
	set(key: K, value: V): this;
}
declare class File$1 {
	readonly raw: string;
	readonly lang: string;
	readonly fileName?: string;
	ast?: DiffAST;
	rawFile: Record<number, string>;
	hasDoRaw: boolean;
	rawLength?: number;
	syntaxFile: Record<number, SyntaxLine>;
	hasDoSyntax: boolean;
	syntaxLength?: number;
	highlighterName?: DiffHighlighter["name"];
	highlighterType?: DiffHighlighter["type"];
	maxLineNumber: number;
	static createInstance(data: File$1): File$1;
	constructor(raw: string, lang: string, fileName?: string);
	doSyntax({ registerHighlighter, theme, }: {
		registerHighlighter?: Omit<DiffHighlighter, "getHighlighterEngine">;
		theme?: "light" | "dark";
	}): void;
	doRaw(): void;
}
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
export declare class DiffFile {
	readonly uuid?: string;
	_version_: string;
	_oldFileName: string;
	_oldFileContent: string;
	_oldFileLang: string;
	_newFileName: string;
	_newFileContent: string;
	_newFileLang: string;
	_diffList: string[];
	diffLineLength: number;
	splitLineLength: number;
	unifiedLineLength: number;
	fileLineLength: number;
	hasExpandSplitAll: boolean;
	hasExpandUnifiedAll: boolean;
	hasSomeLineCollapsed: boolean;
	static createInstance(data: FileData, bundle?: ReturnType<DiffFile["getBundle"] | DiffFile["_getFullBundle"]>): DiffFile;
	constructor(_oldFileName: string, _oldFileContent: string, _newFileName: string, _newFileContent: string, _diffList: string[], _oldFileLang?: string, _newFileLang?: string, uuid?: string);
	initId(): void;
	getId(): string;
	clearId(): void;
	initTheme(theme?: "light" | "dark"): void;
	initRaw(): void;
	initSyntax({ registerHighlighter }?: {
		registerHighlighter?: Omit<DiffHighlighter, "getHighlighterEngine">;
	}): void;
	init(): void;
	buildSplitDiffLines(): void;
	buildUnifiedDiffLines(): void;
	getSplitLeftLine: (index: number) => SplitLineItem;
	getSplitRightLine: (index: number) => SplitLineItem;
	getSplitHunkLine: (index: number) => DiffHunkItem;
	onSplitHunkExpand: (dir: "up" | "down" | "all", index: number, needTrigger?: boolean) => void;
	getUnifiedLine: (index: number) => UnifiedLineItem;
	getUnifiedHunkLine: (index: number) => DiffHunkItem;
	onUnifiedHunkExpand: (dir: "up" | "down" | "all", index: number, needTrigger?: boolean) => void;
	onAllExpand: (mode: "split" | "unified") => void;
	onAllCollapse: (mode: "split" | "unified") => void;
	getOldSyntaxLine: (lineNumber: number) => SyntaxLine;
	getNewSyntaxLine: (lineNumber: number) => SyntaxLine;
	subscribe: (listener: (() => void) & {
		isSyncExternal?: boolean;
	}) => () => void;
	notifyAll: (skipSyncExternal?: boolean) => void;
	getUpdateCount: () => number;
	getExpandEnabled: () => boolean;
	getBundle: () => {
		hasInitRaw: boolean;
		hasInitSyntax: boolean;
		hasBuildSplit: boolean;
		hasBuildUnified: boolean;
		oldFileLines: Record<number, string>;
		oldFileDiffLines: Record<string, DiffLineItem>;
		oldFileSyntaxLines: Record<number, SyntaxLine>;
		oldFilePlaceholderLines: Record<string, boolean>;
		newFileLines: Record<number, string>;
		newFileDiffLines: Record<string, DiffLineItem>;
		newFileSyntaxLines: Record<number, SyntaxLine>;
		newFilePlaceholderLines: Record<string, boolean>;
		splitLineLength: number;
		unifiedLineLength: number;
		fileLineLength: number;
		splitLeftLines: SplitLineItem[];
		splitRightLines: SplitLineItem[];
		splitHunkLines: Record<string, DiffHunkItem>;
		unifiedLines: UnifiedLineItem[];
		unifiedHunkLines: Record<string, DiffHunkItem>;
		highlighterName: string;
		composeByDiff: boolean;
		hasSomeLineCollapsed: boolean;
		version: string;
		theme: "light" | "dark";
		isFullMerge: boolean;
	};
	mergeBundle: (data: ReturnType<DiffFile["getBundle"]>, notifyUpdate?: boolean) => void;
	_getHighlighterName: () => string;
	_getIsPureDiffRender: () => boolean;
	_getTheme: () => "light" | "dark";
	_addClonedInstance: (instance: DiffFile) => void;
	_notifyOthers: (instance: DiffFile) => void;
	_delClonedInstance: (instance: DiffFile) => void;
	_getFullBundle: () => {
		oldFileResult: File$1;
		newFileResult: File$1;
		diffLines: DiffLineItem[];
		diffListResults: IRawDiff[];
		isFullMerge: boolean;
		hasInitRaw: boolean;
		hasInitSyntax: boolean;
		hasBuildSplit: boolean;
		hasBuildUnified: boolean;
		oldFileLines: Record<number, string>;
		oldFileDiffLines: Record<string, DiffLineItem>;
		oldFileSyntaxLines: Record<number, SyntaxLine>;
		oldFilePlaceholderLines: Record<string, boolean>;
		newFileLines: Record<number, string>;
		newFileDiffLines: Record<string, DiffLineItem>;
		newFileSyntaxLines: Record<number, SyntaxLine>;
		newFilePlaceholderLines: Record<string, boolean>;
		splitLineLength: number;
		unifiedLineLength: number;
		fileLineLength: number;
		splitLeftLines: SplitLineItem[];
		splitRightLines: SplitLineItem[];
		splitHunkLines: Record<string, DiffHunkItem>;
		unifiedLines: UnifiedLineItem[];
		unifiedHunkLines: Record<string, DiffHunkItem>;
		highlighterName: string;
		composeByDiff: boolean;
		hasSomeLineCollapsed: boolean;
		version: string;
		theme: "light" | "dark";
	};
	_mergeFullBundle: (data: ReturnType<DiffFile["_getFullBundle"]>, notifyUpdate?: boolean) => void;
	_destroy: () => void;
	clear: () => void;
}
/** each diff is made up of a number of hunks */
export declare class DiffHunk {
	readonly header: DiffHunkHeader;
	readonly lines: ReadonlyArray<DiffLine>;
	readonly unifiedDiffStart: number;
	readonly unifiedDiffEnd: number;
	readonly expansionType: DiffHunkExpansionType;
	/**
	 * @param header The details from the diff hunk header about the line start and patch length.
	 * @param lines The contents - context and changes - of the diff section.
	 * @param unifiedDiffStart The diff hunk's start position in the overall file diff.
	 * @param unifiedDiffEnd The diff hunk's end position in the overall file diff.
	 */
	constructor(header: DiffHunkHeader, lines: ReadonlyArray<DiffLine>, unifiedDiffStart: number, unifiedDiffEnd: number, expansionType: DiffHunkExpansionType);
	equals(other: DiffHunk): boolean;
}
/** details about the start and end of a diff hunk */
export declare class DiffHunkHeader {
	readonly oldStartLine: number;
	readonly oldLineCount: number;
	readonly newStartLine: number;
	readonly newLineCount: number;
	/**
	 * @param oldStartLine The line in the old (or original) file where this diff hunk starts.
	 * @param oldLineCount The number of lines in the old (or original) file that this diff hunk covers
	 * @param newStartLine The line in the new file where this diff hunk starts.
	 * @param newLineCount The number of lines in the new file that this diff hunk covers.
	 */
	constructor(oldStartLine: number, oldLineCount: number, newStartLine: number, newLineCount: number);
	toDiffLineRepresentation(): string;
	equals(other: DiffHunkHeader): boolean;
}
/** track details related to each line in the diff */
export declare class DiffLine {
	readonly text: string;
	readonly type: DiffLineType;
	readonly originalLineNumber: number | null;
	readonly oldLineNumber: number | null;
	readonly newLineNumber: number | null;
	readonly noTrailingNewLine: boolean;
	changes?: IRange;
	diffChanges?: DiffRange;
	constructor(text: string, type: DiffLineType, originalLineNumber: number | null, oldLineNumber: number | null, newLineNumber: number | null, noTrailingNewLine?: boolean, changes?: IRange, diffChanges?: DiffRange);
	withNoTrailingNewLine(noTrailingNewLine: boolean): DiffLine;
	isIncludeableLine(): boolean;
	equals(other: DiffLine): boolean;
	clone(text: string): DiffLine;
}
/**
 * A parser for the GNU unified diff format
 *
 * See https://www.gnu.org/software/diffutils/manual/html_node/Detailed-Unified.html
 */
export declare class DiffParser {
	/**
	 * Line start pointer.
	 *
	 * The offset into the text property where the current line starts (ie either zero
	 * or one character ahead of the last newline character).
	 */
	private ls;
	/**
	 * Line end pointer.
	 *
	 * The offset into the text property where the current line ends (ie it points to
	 * the newline character) or -1 if the line boundary hasn't been determined yet
	 */
	private le;
	/**
	 * The text buffer containing the raw, unified diff output to be parsed
	 */
	private text;
	constructor();
	/**
	 * Resets the internal parser state so that it can be reused.
	 *
	 * This is done automatically at the end of each parse run.
	 */
	private reset;
	/**
	 * Aligns the internal character pointers at the boundaries of
	 * the next line.
	 *
	 * Returns true if successful or false if the end of the diff
	 * has been reached.
	 */
	private nextLine;
	/**
	 * Advances to the next line and returns it as a substring
	 * of the raw diff text. Returns null if end of diff was
	 * reached.
	 */
	private readLine;
	/** Tests if the current line starts with the given search text */
	private lineStartsWith;
	/** Tests if the current line ends with the given search text */
	private lineEndsWith;
	/**
	 * Returns the starting character of the next line without
	 * advancing the internal state. Returns null if advancing
	 * would mean reaching the end of the diff.
	 */
	private peek;
	/**
	 * Parse the diff header, meaning everything from the
	 * start of the diff output to the end of the line beginning
	 * with +++
	 *
	 * Example diff header:
	 *
	 *   diff --git a/app/src/lib/diff-parser.ts b/app/src/lib/diff-parser.ts
	 *   index e1d4871..3bd3ee0 100644
	 *   --- a/app/src/lib/diff-parser.ts
	 *   +++ b/app/src/lib/diff-parser.ts
	 *
	 * Returns an object with information extracted from the diff
	 * header (currently whether it's a binary patch) or null if
	 * the end of the diff was reached before the +++ line could be
	 * found (which is a valid state).
	 */
	private parseDiffHeader;
	/**
	 * Attempts to convert a RegExp capture group into a number.
	 * If the group doesn't exist or wasn't captured the function
	 * will return the value of the defaultValue parameter or throw
	 * an error if no default value was provided. If the captured
	 * string can't be converted to a number an error will be thrown.
	 */
	private numberFromGroup;
	/**
	 * Parses a hunk header or throws an error if the given line isn't
	 * a well-formed hunk header.
	 *
	 * We currently only extract the line number information and
	 * ignore any hunk headings.
	 *
	 * Example hunk header (text within ``):
	 *
	 * `@@ -84,10 +82,8 @@ export function parseRawDiff(lines: ReadonlyArray<string>): Diff {`
	 *
	 * Where everything after the last @@ is what's known as the hunk, or section, heading
	 */
	private parseHunkHeader;
	/**
	 * Convenience function which lets us leverage the type system to
	 * prove exhaustive checks in parseHunk.
	 *
	 * Takes an arbitrary string and checks to see if the first character
	 * of that string is one of the allowed prefix characters for diff
	 * lines (ie lines in between hunk headers).
	 */
	private parseLinePrefix;
	/**
	 * Parses a hunk, including its header or throws an error if the diff doesn't
	 * contain a well-formed diff hunk at the current position.
	 *
	 * Expects that the position has been advanced to the beginning of a presumed
	 * diff hunk header.
	 *
	 * @param linesConsumed The number of unified diff lines consumed up until
	 *                      this point by the diff parser. Used to give the
	 *                      position and length (in lines) of the parsed hunk
	 *                      relative to the overall parsed diff. These numbers
	 *                      have no real meaning in the context of a diff and
	 *                      are only used to aid the app in line-selections.
	 */
	private parseHunk;
	/**
	 * Parse a well-formed unified diff into hunks and lines.
	 *
	 * @param text A unified diff produced by git diff, git log --patch
	 *             or any other git plumbing command that produces unified
	 *             diffs.
	 */
	parse(text: string): IRawDiff;
}
/** How many new lines will be added to a diff hunk by default. */
export declare const DefaultDiffExpansionStep = 40;
/**
 * Regular expression matching invisible bidirectional Unicode characters that
 * may be interpreted or compiled differently than what it appears. More info:
 * https://github.co/hiddenchars
 */
export declare const HiddenBidiCharsRegex: RegExp;
export declare const _cacheMap: Cache$1<string, File$1>;
export declare const checkDiffLineIncludeChange: (diffLine?: DiffLine) => boolean;
export declare const composeLen = 40;
export declare const getDiffRange: (additions: DiffLine[], deletions: DiffLine[], { getAdditionRaw, getDeletionRaw, }: {
	getAdditionRaw: (lineNumber: number) => string;
	getDeletionRaw: (lineNumber: number) => string;
}) => void;
export declare const getFile: (raw: string, lang: string, theme: "light" | "dark", fileName?: string, uuid?: string) => File$1;
export declare const getLang: (fileName: string) => string;
export declare const getSplitContentLines: (diffFile: DiffFile) => DiffSplitContentLineItem[];
export declare const getSplitLines: (diffFile: DiffFile) => DiffSplitLineItem[];
export declare const getUnifiedContentLine: (diffFile: DiffFile) => DiffUnifiedContentLineItem[];
export declare const getUnifiedLines: (diffFile: DiffFile) => DiffUnifiedLineItem[];
export declare const highlighter: DiffHighlighter;
export declare const numIterator: <T>(num: number, cb: (index: number) => T) => T[];
export declare const parseInstance: DiffParser;
export declare const processAST: (ast: DiffAST) => {
	syntaxFileObject: Record<number, SyntaxLine>;
	syntaxFileLineNumber: number;
};
export declare const versions: string;
export declare enum DiffFileLineType {
	hunk = 1,
	content = 2,
	widget = 3,
	extend = 4
}
export declare enum DiffHunkExpansionType {
	/** The hunk header cannot be expanded at all. */
	None = "None",
	/**
	 * The hunk header can be expanded up exclusively. Only the first hunk can be
	 * expanded up exclusively.
	 */
	Up = "Up",
	/**
	 * The hunk header can be expanded down exclusively. Only the last hunk (if
	 * it's the dummy hunk with only one line) can be expanded down exclusively.
	 */
	Down = "Down",
	/** The hunk header can be expanded both up and down. */
	Both = "Both",
	/**
	 * The hunk header represents a short gap that, when expanded, will
	 * result in merging this hunk and the hunk above.
	 */
	Short = "Short"
}
/** indicate what a line in the diff represents */
export declare enum DiffLineType {
	Context = 0,
	Add = 1,
	Delete = 2,
	Hunk = 3
}
export declare enum NewLineSymbol {
	CRLF = 1,
	CR = 2,
	LF = 3,
	NEWLINE = 4,
	NORMAL = 5
}
export declare function assertNever(_: never, message: string): never;
export declare function diffChanges(addition: DiffLine, deletion: DiffLine): {
	addRange: DiffRange;
	delRange: DiffRange;
};
/**
 * Calculates whether or not a hunk header can be expanded up, down, both, or if
 * the space represented by the hunk header is short and expansion there would
 * mean merging with the hunk above.
 *
 * @param hunkIndex     Index of the hunk to evaluate within the whole diff.
 * @param hunkHeader    Header of the hunk to evaluate.
 * @param previousHunk  Hunk previous to the one to evaluate. Null if the
 *                      evaluated hunk is the first one.
 */
export declare function getHunkHeaderExpansionType(hunkIndex: number, hunkHeader: DiffHunkHeader, previousHunk: DiffHunk | null): DiffHunkExpansionType;
/** Utility function for getting the digit count of the largest line number in an array of diff hunks */
export declare function getLargestLineNumber(hunks: DiffHunk[]): number;
/** Get the changed ranges in the strings, relative to each other. */
export declare function relativeChanges(addition: DiffLine, deletion: DiffLine): {
	addRange: IRange;
	delRange: IRange;
};
export interface DiffHunkItem extends DiffLineItem {
	isFirst: boolean;
	isLast: boolean;
	hunkInfo: HunkInfo;
	splitInfo?: HunkLineInfo & HunkInfo;
	unifiedInfo?: HunkLineInfo & HunkInfo;
}
export interface DiffLineItem extends DiffLine {
	index: number;
	prevHunkLine?: DiffHunkItem;
}
export interface DiffRange {
	readonly range: {
		type: 1 | -1 | 0;
		str: string;
		location: number;
		length: number;
	}[];
	readonly hasLineChange?: boolean;
	readonly newLineSymbol?: NewLineSymbol;
}
export interface IRange {
	readonly range: {
		/** The starting location for the range. */
		readonly location: number;
		/** The length of the range. */
		readonly length: number;
	};
	readonly hasLineChange?: boolean;
	readonly newLineSymbol?: NewLineSymbol;
}
/** the contents of a diff generated by Git */
export interface IRawDiff {
	/**
	 * The plain text contents of the diff header. This contains
	 * everything from the start of the diff up until the first
	 * hunk header starts. Note that this does not include a trailing
	 * newline.
	 */
	readonly header: string;
	/**
	 * The plain text contents of the diff. This contains everything
	 * after the diff header until the last character in the diff.
	 *
	 * Note that this does not include a trailing newline nor does
	 * it include diff 'no newline at end of file' comments. For
	 * no-newline information, consult the DiffLine noTrailingNewLine
	 * property.
	 */
	readonly contents: string;
	/**
	 * Each hunk in the diff with information about start, and end
	 * positions, lines and line statuses.
	 */
	readonly hunks: ReadonlyArray<DiffHunk>;
	/**
	 * Whether or not the unified diff indicates that the contents
	 * could not be diffed due to one of the versions being binary.
	 */
	readonly isBinary: boolean;
	/** The largest line number in the diff */
	readonly maxLineNumber: number;
	/** Whether or not the diff has invisible bidi characters */
	readonly hasHiddenBidiChars: boolean;
}
export interface SplitLineItem {
	lineNumber?: number;
	value?: string;
	diff?: DiffLineItem;
	isHidden?: boolean;
	_isHidden?: boolean;
}
export interface UnifiedLineItem {
	oldLineNumber?: number;
	newLineNumber?: number;
	value?: string;
	diff?: DiffLineItem;
	isHidden?: boolean;
	_isHidden?: boolean;
}
export type DiffAST = ReturnType<typeof lowlight.highlight>;
export type DiffHighlighter = {
	name: string;
	type: "class" | "style" | string;
	maxLineToIgnoreSyntax: number;
	setMaxLineToIgnoreSyntax: (v: number) => void;
	ignoreSyntaxHighlightList: (string | RegExp)[];
	setIgnoreSyntaxHighlightList: (v: (string | RegExp)[]) => void;
	getAST: (raw: string, fileName?: string, lang?: string, theme?: "light" | "dark") => DiffAST;
	processAST: (ast: DiffAST) => {
		syntaxFileObject: Record<number, SyntaxLine>;
		syntaxFileLineNumber: number;
	};
	hasRegisteredCurrentLang: (lang: string) => boolean;
	getHighlighterEngine: () => typeof lowlight;
};
export type DiffSplitContentLineItem = {
	type: DiffFileLineType.content;
	index: number;
	lineNumber: number;
	splitLine: {
		left: SplitLineItem;
		right: SplitLineItem;
	};
};
export type DiffSplitLineItem = {
	type: DiffFileLineType;
	index: number;
	lineNumber: number;
};
export type DiffUnifiedContentLineItem = {
	type: DiffFileLineType.content;
	index: number;
	lineNumber: number;
	unifiedLine: UnifiedLineItem;
};
export type DiffUnifiedLineItem = {
	type: DiffFileLineType;
	index: number;
	lineNumber: number;
};
export type FileData = {
	oldFile?: {
		fileName?: string | null;
		fileLang?: string | null;
		content?: string | null;
	};
	newFile?: {
		fileName?: string | null;
		fileLang?: string | null;
		content?: string | null;
	};
	hunks?: string[];
};
export type HunkInfo = {
	oldStartIndex: number;
	newStartIndex: number;
	oldLength: number;
	newLength: number;
	_oldStartIndex: number;
	_newStartIndex: number;
	_oldLength: number;
	_newLength: number;
};
export type HunkLineInfo = {
	startHiddenIndex: number;
	endHiddenIndex: number;
	plainText: string;
	_startHiddenIndex: number;
	_endHiddenIndex: number;
	_plainText: string;
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
declare const createDiffConfigStore: (props: DiffViewProps<any>, diffFileId: string) => import("reactivity-store").UseSelectorWithStore<{
	id: import("reactivity-store").Ref<string, string>;
	setId: (_id: string) => string;
	mode: import("reactivity-store").Ref<DiffModeEnum, DiffModeEnum>;
	setMode: (_mode: DiffModeEnum) => DiffModeEnum;
	enableWrap: import("reactivity-store").Ref<boolean, boolean>;
	setEnableWrap: (_enableWrap: boolean) => boolean;
	enableAddWidget: import("reactivity-store").Ref<boolean, boolean>;
	setEnableAddWidget: (_enableAddWidget: boolean) => boolean;
	enableHighlight: import("reactivity-store").Ref<boolean, boolean>;
	setEnableHighlight: (_enableHighlight: boolean) => boolean;
	fontSize: import("reactivity-store").Ref<number, number>;
	setFontSize: (_fontSize: number) => number;
	extendData: import("reactivity-store").Ref<{
		oldFile: {
			[x: string]: {
				data: any;
			};
		};
		newFile: {
			[x: string]: {
				data: any;
			};
		};
	}, {
		oldFile: {
			[x: string]: {
				data: any;
			};
		};
		newFile: {
			[x: string]: {
				data: any;
			};
		};
	} | {
		oldFile: {
			[x: string]: {
				data: any;
			};
		};
		newFile: {
			[x: string]: {
				data: any;
			};
		};
	}>;
	setExtendData: (_extendData: DiffViewProps<any>["extendData"]) => void;
	renderWidgetLine: import("reactivity-store").Ref<({ diffFile, side, lineNumber, onClose, }: {
		lineNumber: number;
		side: SplitSide;
		diffFile: DiffFile;
		onClose: () => void;
	}) => import("react").ReactNode, ({ diffFile, side, lineNumber, onClose, }: {
		lineNumber: number;
		side: SplitSide;
		diffFile: DiffFile;
		onClose: () => void;
	}) => import("react").ReactNode>;
	setRenderWidgetLine: (_renderWidgetLine: ({ diffFile, side, lineNumber, onClose, }: {
		lineNumber: number;
		side: SplitSide;
		diffFile: DiffFile;
		onClose: () => void;
	}) => import("react").ReactNode) => ({ diffFile, side, lineNumber, onClose, }: {
		lineNumber: number;
		side: SplitSide;
		diffFile: DiffFile;
		onClose: () => void;
	}) => import("react").ReactNode;
	renderExtendLine: import("reactivity-store").Ref<({ diffFile, side, data, lineNumber, onUpdate, }: {
		lineNumber: number;
		side: SplitSide;
		data: any;
		diffFile: DiffFile;
		onUpdate: () => void;
	}) => import("react").ReactNode, ({ diffFile, side, data, lineNumber, onUpdate, }: {
		lineNumber: number;
		side: SplitSide;
		data: any;
		diffFile: DiffFile;
		onUpdate: () => void;
	}) => import("react").ReactNode>;
	setRenderExtendLine: (_renderExtendLine: ({ diffFile, side, data, lineNumber, onUpdate, }: {
		lineNumber: number;
		side: SplitSide;
		data: any;
		diffFile: DiffFile;
		onUpdate: () => void;
	}) => import("react").ReactNode) => ({ diffFile, side, data, lineNumber, onUpdate, }: {
		lineNumber: number;
		side: SplitSide;
		data: any;
		diffFile: DiffFile;
		onUpdate: () => void;
	}) => import("react").ReactNode;
	onAddWidgetClick: {
		current: (lineNumber: number, side: SplitSide) => void;
	};
	setOnAddWidgetClick: (_onAddWidgetClick: {
		current: (lineNumber: number, side: SplitSide) => void;
	}) => (lineNumber: number, side: SplitSide) => void;
}>;
export declare enum DiffModeEnum {
	SplitGitHub = 1,
	SplitGitLab = 2,
	Split = 3,
	Unified = 4
}
export declare const DiffViewContext: import("react").Context<{
	useDiffContext: ReturnType<typeof createDiffConfigStore>;
}>;
export declare const useDiffViewContext: () => {
	useDiffContext: ReturnType<typeof createDiffConfigStore>;
};
export declare enum SplitSide {
	old = 1,
	new = 2
}
export type DiffViewProps<T> = {
	data?: {
		oldFile?: {
			fileName?: string | null;
			fileLang?: string | null;
			content?: string | null;
		};
		newFile?: {
			fileName?: string | null;
			fileLang?: string | null;
			content?: string | null;
		};
		hunks: string[];
	};
	extendData?: {
		oldFile?: Record<string, {
			data: T;
		}>;
		newFile?: Record<string, {
			data: T;
		}>;
	};
	diffFile?: DiffFile;
	className?: string;
	style?: CSSProperties;
	/**
	 * provide a custom highlighter
	 * eg: lowlight, refractor, starry-night, shiki
	 */
	registerHighlighter?: Omit<DiffHighlighter, "getHighlighterEngine">;
	diffViewMode?: DiffModeEnum;
	diffViewWrap?: boolean;
	diffViewTheme?: "light" | "dark";
	diffViewFontSize?: number;
	diffViewHighlight?: boolean;
	diffViewAddWidget?: boolean;
	renderWidgetLine?: ({ diffFile, side, lineNumber, onClose, }: {
		lineNumber: number;
		side: SplitSide;
		diffFile: DiffFile;
		onClose: () => void;
	}) => ReactNode;
	renderExtendLine?: ({ diffFile, side, data, lineNumber, onUpdate, }: {
		lineNumber: number;
		side: SplitSide;
		data: T;
		diffFile: DiffFile;
		onUpdate: () => void;
	}) => ReactNode;
	onAddWidgetClick?: (lineNumber: number, side: SplitSide) => void;
};
export declare const DiffView: (<T>(props: DiffViewProps<T> & {
	ref?: ForwardedRef<{
		getDiffFileInstance: () => DiffFile;
	}>;
}) => ReactNode) & {
	displayName?: string;
};
export declare const version: string;

export {
	File$1 as File,
};

export {};
