import { _cacheMap, DiffFile, SplitSide, type DiffHighlighter } from '@git-diff-view/core';
import { DiffModeEnum } from '@git-diff-view/utils';

// eslint-disable-next-line import/namespace
import { default as DiffView } from './DiffView.svelte';

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
}

_cacheMap.name = '@git-diff-view/svelte';

export { SplitSide, DiffModeEnum };

export { DiffView };
