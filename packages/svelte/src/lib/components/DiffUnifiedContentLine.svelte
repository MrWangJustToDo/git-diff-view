<script lang="ts">
	import { getEnableHighlight } from '$lib/context/enableHighlight.js';
	import { getEnableWrap } from '$lib/context/enableWrap.js';
	import { getOnAddWidgetClick } from '$lib/context/onAddWidgetClick.js';
	import { getWidget } from '$lib/context/widget.js';
	import {
		checkDiffLineIncludeChange,
		DiffLine,
		SplitSide,
		type DiffFile,
		type File
	} from '@git-diff-view/core';
	import {
		addContentBGName,
		addLineNumberBGName,
		delContentBGName,
		delLineNumberBGName,
		expandContentBGName,
		expandLineNumberColorName,
		plainContentBGName,
		plainLineNumberBGName,
		plainLineNumberColorName
	} from '$lib/utils/color.js';
	import { diffAsideWidthName } from '$lib/utils/size.js';
	import DiffUnifiedAddWidget from './DiffUnifiedAddWidget.svelte';
	import DiffContent from './DiffContent.svelte';
	import { getEnableAddWidget } from '$lib/context/enableAddWidget.js';
	import { onDestroy } from 'svelte';

	interface Props {
		index: number;
		diffFile: DiffFile;
		lineNumber: number;
	}

	let props: Props = $props();

	const unifiedItem = $derived.by(() => props.diffFile.getUnifiedLine(props.index));

	const enableWrap = $derived.by(getEnableWrap());

	const widget = $derived.by(getWidget());

	const onAddWidgetClick = $derived.by(getOnAddWidgetClick());

	const enableHighlight = $derived.by(getEnableHighlight());

	const enableAddWidget = $derived.by(getEnableAddWidget());

	const currentItemHasHidden = $derived.by(() => unifiedItem?.isHidden);

	const currentItemHasChange = $derived.by(() => checkDiffLineIncludeChange(unifiedItem?.diff));

	const getCurrentSyntaxLine = () =>
		unifiedItem?.newLineNumber
			? props.diffFile.getNewSyntaxLine(unifiedItem?.newLineNumber || 0)
			: unifiedItem?.oldLineNumber
				? props.diffFile.getOldSyntaxLine(unifiedItem?.oldLineNumber || 0)
				: undefined;

	let currentSyntaxLine = $state(getCurrentSyntaxLine());

	const getCurrentPlainLine = () =>
		unifiedItem?.newLineNumber
			? props.diffFile.getNewPlainLine(unifiedItem?.newLineNumber || 0)
			: unifiedItem?.oldLineNumber
				? props.diffFile.getOldPlainLine(unifiedItem?.oldLineNumber || 0)
				: undefined;

	let currentPlainLine = $state(getCurrentPlainLine());

	let unSubscribe = { current: () => {} };

	$effect(() => {
		unSubscribe?.current?.();

		const init = () => {
			currentSyntaxLine = getCurrentSyntaxLine();
			currentPlainLine = getCurrentPlainLine();
		};

		init();

		unSubscribe.current = props.diffFile.subscribe(init);
	});

	onDestroy(() => unSubscribe.current());

	const onClickAddWidget = (lineNumber: number, side: SplitSide) => {
		widget.side = side;
		widget.lineNumber = lineNumber;
	};
</script>

{#if !currentItemHasHidden}
	{#if currentItemHasChange}
		{#snippet renderOldLine(props: {
			index: number;
			lineNumber: number;
			rawLine: string;
			plainLine?: File['plainFile'][number];
			syntaxLine?: File['syntaxFile'][number];
			diffLine?: DiffLine;
			diffFile: DiffFile;
			enableWrap: boolean;
			enableAddWidget: boolean;
			enableHighlight: boolean;
			onOpenAddWidget: (lineNumber: number, side: SplitSide) => void;
			onAddWidgetClick?: (lineNumber: number, side: SplitSide) => void;
		})}
			<tr data-line={props.index} data-state="diff" class="diff-line group">
				<td
					class="diff-line-num sticky left-0 z-[1] w-[1%] min-w-[100px] select-none whitespace-nowrap pl-[10px] pr-[10px] text-right align-top"
					style={`
          color: var(${plainLineNumberColorName});
          background-color: var(${delLineNumberBGName});
          width: calc(calc(var(${diffAsideWidthName}) + 5px) * 2);
          max-width: calc(calc(var(${diffAsideWidthName}) + 5px) * 2);
          min-width: calc(calc(var(${diffAsideWidthName}) + 5px) * 2);
        `}
				>
					{#if props.enableAddWidget}
						<DiffUnifiedAddWidget
							index={props.index - 1}
							lineNumber={props.lineNumber}
							diffFile={props.diffFile}
							side={SplitSide.old}
							onWidgetClick={props.onAddWidgetClick}
							onOpenAddWidget={props.onOpenAddWidget}
						/>
					{/if}
					<div class="flex">
						<span data-line-old-num={props.lineNumber} class="inline-block w-[50%]">
							{props.lineNumber}
						</span>
						<span class="w-[10px] shrink-0"></span>
						<span class="inline-block w-[50%]"></span>
					</div>
				</td>
				<td
					class="diff-line-content pr-[10px] align-top"
					style={`background-color: var(${delContentBGName}) `}
				>
					<DiffContent
						enableWrap={props.enableWrap}
						diffFile={props.diffFile}
						enableHighlight={props.enableHighlight}
						rawLine={props.rawLine}
						diffLine={props.diffLine}
						plainLine={props.plainLine}
						syntaxLine={props.syntaxLine}
					/>
				</td>
			</tr>
		{/snippet}
		{#snippet renderNewLine(props: {
			index: number;
			lineNumber: number;
			rawLine: string;
			plainLine?: File['plainFile'][number];
			syntaxLine?: File['syntaxFile'][number];
			diffLine?: DiffLine;
			diffFile: DiffFile;
			enableWrap: boolean;
			enableAddWidget: boolean;
			enableHighlight: boolean;
			onOpenAddWidget: (lineNumber: number, side: SplitSide) => void;
			onAddWidgetClick?: (lineNumber: number, side: SplitSide) => void;
		})}
			<tr data-line={props.index} data-state="diff" class="diff-line group">
				<td
					class="diff-line-num sticky left-0 z-[1] w-[1%] min-w-[100px] select-none whitespace-nowrap pl-[10px] pr-[10px] text-right align-top"
					style={`
          color: var(${plainLineNumberColorName});
          background-color: var(${addLineNumberBGName});
          width: calc(calc(var(${diffAsideWidthName}) + 5px) * 2);
          max-width: calc(calc(var(${diffAsideWidthName}) + 5px) * 2);
          min-width: calc(calc(var(${diffAsideWidthName}) + 5px) * 2);
        `}
				>
					{#if props.enableAddWidget}
						<DiffUnifiedAddWidget
							index={props.index - 1}
							lineNumber={props.lineNumber}
							diffFile={props.diffFile}
							side={SplitSide.new}
							onWidgetClick={props.onAddWidgetClick}
							onOpenAddWidget={props.onOpenAddWidget}
						/>
					{/if}
					<div class="flex">
						<span class="inline-block w-[50%]"></span>
						<span class="w-[10px] shrink-0"></span>
						<span data-line-new-num={props.lineNumber} class="inline-block w-[50%]">
							{props.lineNumber}
						</span>
					</div>
				</td>
				<td
					class="diff-line-content pr-[10px] align-top"
					style={` background-color: var(${addContentBGName}) `}
				>
					<DiffContent
						enableWrap={props.enableWrap}
						diffFile={props.diffFile}
						enableHighlight={props.enableHighlight}
						rawLine={props.rawLine}
						diffLine={props.diffLine}
						plainLine={props.plainLine}
						syntaxLine={props.syntaxLine}
					/>
				</td>
			</tr>
		{/snippet}
		{#if unifiedItem.oldLineNumber}
			{@render renderOldLine({
				index: props.lineNumber,
				enableWrap: enableWrap,
				diffFile: props.diffFile,
				rawLine: unifiedItem?.value || '',
				diffLine: unifiedItem?.diff,
				plainLine: currentPlainLine,
				syntaxLine: currentSyntaxLine,
				enableHighlight: enableHighlight,
				enableAddWidget: enableAddWidget,
				lineNumber: unifiedItem.oldLineNumber || 0,
				onOpenAddWidget: onClickAddWidget,
				onAddWidgetClick
			})}
		{/if}
		{#if unifiedItem.newLineNumber}
			{@render renderNewLine({
				index: props.lineNumber,
				enableWrap: enableWrap,
				diffFile: props.diffFile,
				rawLine: unifiedItem?.value || '',
				diffLine: unifiedItem?.diff,
				plainLine: currentPlainLine,
				syntaxLine: currentSyntaxLine,
				enableHighlight: enableHighlight,
				enableAddWidget: enableAddWidget,
				lineNumber: unifiedItem.newLineNumber || 0,
				onOpenAddWidget: onClickAddWidget,
				onAddWidgetClick
			})}
		{/if}
	{:else}
		<tr
			data-line={props.lineNumber}
			data-state={unifiedItem.diff ? 'diff' : 'plain'}
			class="diff-line group"
		>
			<td
				class="diff-line-num sticky left-0 z-[1] w-[1%] min-w-[100px] select-none whitespace-nowrap pl-[10px] pr-[10px] text-right align-top"
				style={`
					color: var(${unifiedItem?.diff ? plainLineNumberColorName : expandLineNumberColorName});
					background-color: ${
						unifiedItem?.diff ? `var(${plainLineNumberBGName})` : `var(${expandContentBGName})`
					};
					width: calc(calc(var(${diffAsideWidthName}) + 5px) * 2);
					max-width: calc(calc(var(${diffAsideWidthName}) + 5px) * 2);
					min-width: calc(calc(var(${diffAsideWidthName}) + 5px) * 2;
				`}
			>
				{#if enableAddWidget && unifiedItem?.diff}
					<DiffUnifiedAddWidget
						index={props.index}
						diffFile={props.diffFile}
						lineNumber={unifiedItem?.newLineNumber || 0}
						side={SplitSide.new}
						onOpenAddWidget={onClickAddWidget}
						onWidgetClick={onAddWidgetClick}
					/>
				{/if}
				<div class="flex opacity-[0.5]">
					<span data-line-old-num={unifiedItem?.oldLineNumber || 0} class="inline-block w-[50%]">
						{unifiedItem?.oldLineNumber || 0}
					</span>
					<span class="w-[10px] shrink-0"></span>
					<span data-line-new-num={unifiedItem?.newLineNumber || 0} class="inline-block w-[50%]">
						{unifiedItem?.newLineNumber || 0}
					</span>
				</div>
			</td>
			<td
				class="diff-line-content pr-[10px] align-top"
				style={`
					background-color: ${
						unifiedItem?.diff ? `var(${plainContentBGName})` : `var(${expandContentBGName})`
					}
				`}
			>
				<DiffContent
					enableWrap={!!enableWrap}
					diffFile={props.diffFile}
					enableHighlight={!!enableHighlight}
					rawLine={unifiedItem?.value || ''}
					diffLine={unifiedItem?.diff}
					plainLine={currentPlainLine}
					syntaxLine={currentSyntaxLine}
				/>
			</td>
		</tr>
	{/if}
{/if}
