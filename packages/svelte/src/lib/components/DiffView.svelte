<script lang="ts" generics="T extends any">
	import { diffFontSizeName, DiffModeEnum } from '@git-diff-view/utils';
	import { DiffFile, type DiffHighlighter, SplitSide } from '@git-diff-view/core';
	import type { Snippet } from 'svelte';

	interface Props {
		data?: {
			oldFile?: { fileName?: string | null; fileLang?: string | null; content?: string | null };
			newFile?: { fileName?: string | null; fileLang?: string | null; content?: string | null };
			hunks: string[];
		};
		extendData?: { oldFile?: Record<string, { data: T }>; newFile?: Record<string, { data: T }> };
		initialWidgetState?: { side: SplitSide; lineNumber: number };
		diffFile?: DiffFile;
		class?: string;
		registerHighlighter?: Omit<DiffHighlighter, 'getHighlighterEngine'>;
		diffViewMode?: DiffModeEnum;
		diffViewWrap?: boolean;
		diffViewTheme?: 'light' | 'dark';
		diffViewFontSize?: number;
		diffViewHighlight?: boolean;
		diffViewAddWidget?: boolean;
		renderWidgetLine?: ({
			diffFile,
			side,
			lineNumber,
			onClose
		}: {
			lineNumber: number;
			side: SplitSide;
			diffFile: DiffFile;
			onClose: () => void;
		}) => Snippet;
		renderExtendLine?: ({
			diffFile,
			side,
			data,
			lineNumber,
			onUpdate
		}: {
			lineNumber: number;
			side: SplitSide;
			data: T;
			diffFile: DiffFile;
			onUpdate: () => void;
		}) => Snippet;
		onAddWidgetClick?: (lineNumber: number, side: SplitSide) => void;
	}

	let props: Props = $props();

	const getInstance = () => {
		if (props.diffFile) {
			const diffFile = DiffFile.createInstance({});
			diffFile._mergeFullBundle(props.diffFile._getFullBundle());
			return diffFile;
		} else if (props.data) {
			const data = props.data;
			return new DiffFile(
				data.oldFile?.fileName || '',
				data.oldFile?.content || '',
				data.newFile?.fileName || '',
				data.newFile?.content || '',
				data.hunks || [],
				data.oldFile?.fileLang || '',
				data.newFile?.fileLang || ''
			);
		}
		return null;
	};

	const diffFile = $state(getInstance());

	const getId = () => diffFile?.getId?.();

	const id = $state(getId());

	const widgetState = $state<{ side?: SplitSide; lineNumber?: number }>({});

	const wrapperRef = $state<HTMLElement | null>(null);

	const setWidget = (v: { side?: SplitSide; lineNumber?: number }) => {
		if (props) widgetState.side = v.side;
		widgetState.lineNumber = v.lineNumber;
	};
</script>
