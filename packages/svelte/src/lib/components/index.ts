import {
	_cacheMap,
	DiffFile,
	SplitSide,
	type DiffHighlighter,
	type MultiSelectResult,
	type LineRange,
	type MultiSelectState
} from '@git-diff-view/core';

import { DiffModeEnum } from '$lib/utils/symbol.js';

// eslint-disable-next-line import/namespace
import { default as DiffView } from './DiffView.svelte';
// eslint-disable-next-line import/namespace
import { default as DiffViewWithMultiSelect } from './DiffViewWithMultiSelect.svelte';

import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface DiffViewProps<T> {
	data?: {
		oldFile?: { fileName?: string | null; fileLang?: string | null; content?: string | null };
		newFile?: { fileName?: string | null; fileLang?: string | null; content?: string | null };
		hunks: string[];
	};
	extendData?: { oldFile?: Record<string, { data: T }>; newFile?: Record<string, { data: T }> };
	initialWidgetState?: { side: SplitSide; lineNumber: number };
	diffFile?: DiffFile;
	class?: string;
	style?: HTMLAttributes<HTMLDivElement>['style'];
	registerHighlighter?: Omit<DiffHighlighter, 'getHighlighterEngine'>;
	diffViewMode?: DiffModeEnum;
	diffViewWrap?: boolean;
	diffViewTheme?: 'light' | 'dark';
	diffViewFontSize?: number;
	diffViewHighlight?: boolean;
	diffViewAddWidget?: boolean;
	renderWidgetLine?: Snippet<
		[
			{
				lineNumber: number;
				side: SplitSide;
				diffFile: DiffFile;
				onClose: () => void;
			}
		]
	>;
	renderExtendLine?: Snippet<
		[
			{
				lineNumber: number;
				side: SplitSide;
				data: T;
				diffFile: DiffFile;
				onUpdate: () => void;
			}
		]
	>;
	onAddWidgetClick?: (lineNumber: number, side: SplitSide) => void;
	onDiffFileCreated?: (diffFile: DiffFile | null) => void;
}

/**
 * Extended data item with fromLine support for multi-line comments
 */
export interface MultiSelectExtendDataItem<T = unknown> {
	data: T;
	/**
	 * Starting line number for multi-line selection
	 * If not provided, defaults to the key (end line number)
	 */
	fromLine?: number;
}

/**
 * Extended data format for multi-select diff view
 */
export type MultiSelectExtendData<T = unknown> = {
	oldFile?: Record<string, MultiSelectExtendDataItem<T>>;
	newFile?: Record<string, MultiSelectExtendDataItem<T>>;
};

export interface DiffViewWithMultiSelectProps<T> {
	data?: {
		oldFile?: { fileName?: string | null; fileLang?: string | null; content?: string | null };
		newFile?: { fileName?: string | null; fileLang?: string | null; content?: string | null };
		hunks: string[];
	};
	/**
	 * Extended data with fromLine support for multi-line comments
	 */
	extendData?: MultiSelectExtendData<T>;
	initialWidgetState?: { side: SplitSide; lineNumber: number };
	diffFile?: DiffFile;
	class?: string;
	style?: HTMLAttributes<HTMLDivElement>['style'];
	registerHighlighter?: Omit<DiffHighlighter, 'getHighlighterEngine'>;
	diffViewMode?: DiffModeEnum;
	diffViewWrap?: boolean;
	diffViewTheme?: 'light' | 'dark';
	diffViewFontSize?: number;
	diffViewHighlight?: boolean;
	diffViewAddWidget?: boolean;
	/**
	 * Enable multi-select feature
	 * @default true
	 */
	enableMultiSelect?: boolean;
	/**
	 * Callback when multi-line selection is complete
	 */
	onMultiSelectComplete?: (result: MultiSelectResult) => void;
	/**
	 * Callback when selection changes (during drag)
	 */
	onMultiSelectChange?: (range: LineRange | null, state: MultiSelectState) => void;
	/**
	 * Custom function to scope selection to one hunk
	 */
	scopeMultiSelectToHunk?: (range: LineRange) => LineRange | null;
	onAddWidgetClick?: (props: { lineNumber: number; fromLineNumber?: number; side: SplitSide }) => void;
	renderWidgetLine?: Snippet<
		[
			{
				lineNumber: number;
				side: SplitSide;
				diffFile: DiffFile;
				onClose: () => void;
			}
		]
	>;
	renderExtendLine?: Snippet<
		[
			{
				lineNumber: number;
				fromLineNumber: number;
				side: SplitSide;
				data: T;
				diffFile: DiffFile;
				onUpdate: () => void;
			}
		]
	>;
}

export interface DiffViewWithMultiSelectRef {
	getDiffFileInstance: () => DiffFile | null;
	getSelectionResult: () => MultiSelectResult | null;
	getSelectionState: () => MultiSelectState;
	clearSelection: () => void;
	setPreselectedLines: (lines: { old: number[]; new: number[] }) => void;
}

_cacheMap.name = '@git-diff-view/svelte';

export { SplitSide, DiffModeEnum };

export { DiffView, DiffViewWithMultiSelect };
