<script lang="ts" generics="T extends any">
	import { diffFontSizeName } from '$lib/utils/size.js';
	import { DiffModeEnum } from '$lib/utils/symbol.js';
	import { DiffFile, type DiffHighlighter, SplitSide } from '@git-diff-view/core';
	import type { Snippet } from 'svelte';
	import { useIsMounted } from '$lib/hooks/useIsMounted.svelte.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setFontSize } from '$lib/context/fontSize.js';
	import { setEnableWrap } from '$lib/context/enableWrap.js';
	import { setRenderWidget } from '$lib/context/renderWidget.js';
	import { setId } from '$lib/context/id.js';
	import { setExtend } from '$lib/context/extend.js';
	import { setWidget as setWidgetContext } from '$lib/context/widget.js';
	import { setRenderExtend } from '$lib/context/renderExtend.js';
	import { setOnAddWidgetClick } from '$lib/context/onAddWidgetClick.js';
	import { setEnableHighlight } from '$lib/context/enableHighlight.js';
	import { setEnableAddWidget } from '$lib/context/enableAddWidget.js';
	import { setMode } from '$lib/context/mode.js';

	import DiffSplitView from './DiffSplitView.svelte';
	import DiffUnifiedView from './DiffUnifiedView.svelte';

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

	let props: Props = $props();

	let lastDiffFile: { current: DiffFile | null } = { current: null };

	const getInstance = () => {
		lastDiffFile.current?.clear?.();
		if (props.diffFile) {
			const diffFile = DiffFile.createInstance({});

			diffFile._mergeFullBundle(props.diffFile._getFullBundle());

			lastDiffFile.current = diffFile;

			return diffFile;
		} else if (props.data) {
			const data = props.data;

			const diffFile = new DiffFile(
				data.oldFile?.fileName || '',
				data.oldFile?.content || '',
				data.newFile?.fileName || '',
				data.newFile?.content || '',
				data.hunks || [],
				data.oldFile?.fileLang || '',
				data.newFile?.fileLang || ''
			);

			lastDiffFile.current = diffFile;

			return diffFile;
		}
		return null;
	};

	const diffFile = $derived.by(getInstance);

	const getId = () => diffFile?.getId?.();

	const id = $derived.by(getId);

	const widgetState = $state<{ side?: SplitSide; lineNumber?: number }>({
		side: props.initialWidgetState?.side,
		lineNumber: props.initialWidgetState?.lineNumber
	});

	let wrapperRef = $state<HTMLElement | null>(null);

	const setWidget = (v: { side?: SplitSide; lineNumber?: number }) => {
		if (props) widgetState.side = v.side;
		widgetState.lineNumber = v.lineNumber;
	};

	const enableHighlight = $derived(props.diffViewHighlight ?? true);

	const theme = $derived(props.diffViewTheme);

	$effect(() => {
		widgetState.side = props.initialWidgetState?.side;
		widgetState.lineNumber = props.initialWidgetState?.lineNumber;
	});

	$effect(() => {
		if (props.data || props.diffFile) {
			widgetState.side = undefined;
			widgetState.lineNumber = undefined;
		}
	});

	const unSubscribe = { current: () => {} };

	const isMounted = $derived.by(useIsMounted());

	const initSubscribe = () => {
		unSubscribe?.current?.();
		if (!isMounted || !diffFile || !props.diffFile) return;
		props.diffFile._addClonedInstance(diffFile);
		unSubscribe.current = () => props.diffFile?._delClonedInstance(diffFile);
	};

	$effect(initSubscribe);

	const initDiff = () => {
		if (!diffFile || !isMounted) return;
		diffFile.initTheme(theme);
		diffFile.initRaw();
		diffFile.buildSplitDiffLines();
		diffFile.buildUnifiedDiffLines();
	};

	$effect(initDiff);

	const initSyntax = () => {
		if (!diffFile || !isMounted || !enableHighlight) return;
		diffFile.initSyntax({
			registerHighlighter: props.registerHighlighter
		});
		diffFile.notifyAll();
	};

	$effect(initSyntax);

	const unSubscribeAttr = { current: () => {} };

	const initAttribute = () => {
		unSubscribeAttr?.current?.();

		if (!isMounted || !diffFile || !wrapperRef) return;

		theme;

		const init = () => {
			wrapperRef?.setAttribute('data-theme', diffFile._getTheme() || 'light');
			wrapperRef?.setAttribute('data-highlighter', diffFile._getHighlighterName());
		};

		init();

		unSubscribeAttr.current = diffFile.subscribe(init);
	};

	$effect(initAttribute);

	setFontSize(props);

	setEnableWrap(props);

	setRenderWidget(props);

	setRenderExtend(props);

	setOnAddWidgetClick(props);

	setEnableHighlight(props);

	setEnableAddWidget(props);

	setMode(props);

	setWidgetContext(widgetState);

	setExtend<T>(props);

	setId(() => diffFile?.getId() || '');
</script>

{#if diffFile}
	<div
		class="diff-tailwindcss-wrapper"
		data-component="git-diff-view"
		data-theme={diffFile?._getTheme() || 'light'}
		data-highlighter={diffFile?._getHighlighterName()}
		{@attach (e) => (wrapperRef = e)}
	>
		<div class="diff-style-root" style={`${diffFontSizeName}:${props.diffViewFontSize || 14}px`}>
			<div
				id={isMounted ? `diff-root${id}` : undefined}
				class={`diff-view-wrapper` + (props.class ? ` ${props.class}` : '')}
				style={props.style}
			>
				{#if !props.diffViewMode || props.diffViewMode & DiffModeEnum.Split}
					<DiffSplitView {diffFile} />
				{:else}
					<DiffUnifiedView {diffFile} />
				{/if}
			</div>
		</div>
	</div>
{/if}
