<script lang="ts" generics="T extends unknown">
	import { DiffModeEnum } from '$lib/utils/symbol.js';
	import {
		DiffFile,
		type DiffHighlighter,
		SplitSide,
		createDiffMultiSelectManager,
		multiSelectClassNames,
		type MultiSelectResult,
		type LineRange,
		type MultiSelectState,
		type DiffMultiSelectManager,
		type MultiSelectOptions,
		type extendDataToPreselectedLines
	} from '@git-diff-view/core';
	import { onDestroy, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	import DiffView from './DiffView.svelte';

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
		onAddWidgetClick?: (props: {
			lineNumber: number;
			fromLineNumber?: number;
			side: SplitSide;
		}) => void;
		renderWidgetLine?: Snippet<
			[
				{
					lineNumber: number;
					fromLineNumber: number;
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
		onInstanceCreated?: (instance: DiffViewWithMultiSelectRef) => void;
	}

	interface DiffViewWithMultiSelectRef {
		getDiffFileInstance: () => DiffFile | null;
		getSelectionResult: () => MultiSelectResult | null;
		getSelectionState: () => MultiSelectState;
		clearSelection: () => void;
		setPreselectedLines: (lines: { old: number[]; new: number[] }) => void;
	}

	let props: Props = $props();

	let containerRef = $state<HTMLDivElement | null>(null);
	let innerDiffFile = $state<DiffFile | null>(null);
	type MultiResult = ReturnType<typeof extendDataToPreselectedLines>;

	let managerRef: DiffMultiSelectManager | null = null;
	let multiResultRef: MultiResult | undefined;

	const updateMultiResult = (result?: MultiResult) => {
		multiResultRef = result;
		managerRef?.setPreselectedLines(result || { old: [], new: [] });
	};

	const enableMultiSelect = $derived(props.enableMultiSelect ?? true);
	const isUnifiedMode = $derived(
		!((props.diffViewMode ?? DiffModeEnum.SplitGitHub) & DiffModeEnum.Split)
	);

	const handleDiffFileCreated = (diffFile: DiffFile | null) => {
		innerDiffFile = diffFile;
	};

	const initManager = () => {
		const container = containerRef;
		const diffFile = innerDiffFile;

		if (!container || !diffFile || !enableMultiSelect) {
			managerRef?.destroy();
			managerRef = null;
			return;
		}

		const managerOptions: MultiSelectOptions = {
			enabled: enableMultiSelect,
			isUnifiedMode: isUnifiedMode,
			selectedClassName: multiSelectClassNames.selected,
			onSelectionChange: (range, state) => {
				if (state.isSelecting) {
					containerRef?.classList.add(multiSelectClassNames.selecting);
				} else {
					containerRef?.classList.remove(multiSelectClassNames.selecting);
				}
				props.onMultiSelectChange?.(range, state);
			},
		onSelectionComplete: (result) => {
			containerRef?.classList.remove(multiSelectClassNames.selecting);
			if (result && result.lines.length > 0) {
				props.onMultiSelectComplete?.(result);
				const finalResult = {
					[result.range.side as 'old' | 'new']: [
						result.range.startLineNumber,
						result.range.endLineNumber
					]
				} as MultiResult;
				updateMultiResult(finalResult);
			} else {
				updateMultiResult(undefined);
			}
		},
			scopeToHunk: props.scopeMultiSelectToHunk
		};

		if (managerRef) {
			managerRef.updateContainer(container);
			managerRef.updateDiffFile(diffFile);
			managerRef.updateOptions(managerOptions);
		} else {
			managerRef = createDiffMultiSelectManager(container, diffFile, managerOptions);
		}
	};

	let isWrapModeInitial = true;
	$effect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		props.diffViewWrap;
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		props.diffViewMode;
		if (isWrapModeInitial) {
			isWrapModeInitial = false;
			return;
		}
		updateMultiResult(undefined);
	});

	$effect(initManager);

	const handleAddWidgetClick = (lineNum: number, side: SplitSide) => {
		managerRef?.clearSelection();
		const multiResult = multiResultRef;
		if (multiResult) {
			const currentSide = SplitSide[side] as unknown as 'new' | 'old';
			const currentMultiResult = multiResult[currentSide] as number[];
			const otherSide = currentSide === 'new' ? 'old' : 'new';
			const otherMultiResult = multiResult[otherSide] as number[];
			if (currentMultiResult?.length) {
				const max = Math.max(...currentMultiResult);
				if (max === lineNum) {
					const finalResult = { [currentSide]: currentMultiResult };
					updateMultiResult(finalResult as MultiResult);
					props.onAddWidgetClick?.({
						lineNumber: max,
						fromLineNumber: Math.min(...currentMultiResult),
						side
					});
					return;
				}
			}
			if (isUnifiedMode && otherMultiResult?.length) {
				const max = Math.max(...otherMultiResult);
				const diffFile = innerDiffFile;
				const index = diffFile?.getUnifiedLineIndexByLineNumber(lineNum, side) ?? -1;
				const unifiedItem = diffFile?.getUnifiedLine(index);
				const otherSideLineNum =
					side === SplitSide.old ? unifiedItem?.newLineNumber : unifiedItem?.oldLineNumber;
				if (max === otherSideLineNum) {
					const finalResult = { [otherSide]: otherMultiResult };
					updateMultiResult(finalResult as MultiResult);
					props.onAddWidgetClick?.({
						lineNumber: max,
						fromLineNumber: Math.min(...otherMultiResult),
						side: otherSide === 'old' ? SplitSide.old : SplitSide.new
					});
					return;
				}
			}
			updateMultiResult(undefined);
			props.onAddWidgetClick?.({ lineNumber: lineNum, fromLineNumber: lineNum, side });
		} else {
			updateMultiResult(undefined);
			props.onAddWidgetClick?.({ lineNumber: lineNum, fromLineNumber: lineNum, side });
		}
	};

	const getSelectionResult = () => {
		return managerRef?.getSelectionResult() ?? null;
	};

	const getSelectionState = () => {
		return (
			managerRef?.getState() ?? {
				isSelecting: false,
				startInfo: null,
				currentRange: null
			}
		);
	};

	const clearSelection = () => {
		managerRef?.clearSelection();
	};

	const setPreselectedLines = updateMultiResult;

	$effect(() => {
		props.onInstanceCreated?.({
			getDiffFileInstance: () => innerDiffFile,
			getSelectionResult,
			getSelectionState,
			clearSelection,
			setPreselectedLines
		});
	});

	onDestroy(() => {
		managerRef?.destroy();
		managerRef = null;
	});
</script>

{#snippet internalRenderWidgetLine({
	lineNumber,
	side,
	diffFile,
	onClose
}: {
	lineNumber: number;
	side: SplitSide;
	diffFile: DiffFile;
	onClose: () => void;
})}
	{#if props.renderWidgetLine}
		{@const sideKey = side === SplitSide.old ? 'old' : 'new'}
		{@const multiResultItem = multiResultRef?.[sideKey] as number[]}
		{@const fromLineNumber = multiResultItem ? Math.min(...multiResultItem) : lineNumber}
		{@const toLineNumber = multiResultItem ? Math.max(...multiResultItem) : lineNumber}
		{@render props.renderWidgetLine({
			lineNumber: toLineNumber,
			fromLineNumber,
			side,
			diffFile,
			onClose
		})}
	{/if}
{/snippet}

<div class="diff-multiselect-wrapper" bind:this={containerRef}>
	<DiffView
		data={props.data}
		diffFile={props.diffFile}
		class={props.class}
		style={props.style}
		registerHighlighter={props.registerHighlighter}
		diffViewMode={props.diffViewMode}
		diffViewWrap={props.diffViewWrap}
		diffViewTheme={props.diffViewTheme}
		diffViewFontSize={props.diffViewFontSize}
		diffViewHighlight={props.diffViewHighlight}
		diffViewAddWidget={props.diffViewAddWidget}
		initialWidgetState={props.initialWidgetState}
		extendData={props.extendData}
		onAddWidgetClick={handleAddWidgetClick}
		onDiffFileCreated={handleDiffFileCreated}
		renderWidgetLine={props.renderWidgetLine ? internalRenderWidgetLine : undefined}
		renderExtendLine={props.renderExtendLine}
	/>
</div>
