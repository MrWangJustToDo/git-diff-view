// Generated by dts-bundle-generator v9.5.1

declare class TextMeasure {
	
	measure(text: string, font?: {
		fontFamily?: string;
		fontStyle?: string;
		fontSize?: string;
	}): number;
}
export declare const getTextMeasureInstance: () => TextMeasure;
export declare const addContentBGName = "--diff-add-content--";
export declare const delContentBGName = "--diff-del-content--";
export declare const borderColorName = "--diff-border--";
export declare const addLineNumberBGName = "--diff-add-lineNumber--";
export declare const delLineNumberBGName = "--diff-del-lineNumber--";
export declare const plainContentBGName = "--diff-plain-content--";
export declare const expandContentBGName = "--diff-expand-content--";
export declare const plainLineNumberColorName = "--diff-plain-lineNumber-color--";
export declare const plainLineNumberBGName = "--diff-plain-lineNumber--";
export declare const hunkContentBGName = "--diff-hunk-content--";
export declare const hunkContentColorName = "--diff-hunk-content-color--";
export declare const hunkLineNumberBGName = "--diff-hunk-lineNumber--";
export declare const hunkLineNumberBGHoverName = "--diff-hunk-lineNumber-hover--";
export declare const addContentHighlightBGName = "--diff-add-content-highlight--";
export declare const delContentHighlightBGName = "--diff-del-content-highlight--";
export declare const addWidgetBGName = "--diff-add-widget--";
export declare const addWidgetColorName = "--diff-add-widget-color--";
export declare const emptyBGName = "--diff-empty-content--";
export declare const getContentBG: (isAdded: boolean, isDelete: boolean, hasDiff: boolean) => "var(--diff-add-content--)" | "var(--diff-del-content--)" | "var(--diff-plain-content--)" | "var(--diff-expand-content--)";
export declare const getLineNumberBG: (isAdded: boolean, isDelete: boolean, hasDiff: boolean) => "var(--diff-expand-content--)" | "var(--diff-add-lineNumber--)" | "var(--diff-del-lineNumber--)" | "var(--diff-plain-lineNumber--)";
export declare const removeAllSelection: () => void;
export declare const syncScroll: (left: HTMLElement, right: HTMLElement) => () => void;
export declare const diffFontSizeName = "--diff-font-size--";
export declare const diffAsideWidthName = "--diff-aside-width--";
export declare const memoFunc: <T extends Function>(func: T) => T;

export {};
