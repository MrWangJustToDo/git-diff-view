<script lang="ts">
	import { getEnableAddWidget } from '$lib/context/enableAddWidget.js';
	import { getEnableHighlight } from '$lib/context/enableHighlight.js';
	import { getOnAddWidgetClick } from '$lib/context/onAddWidgetClick.js';
	import { getWidget } from '$lib/context/widget.js';
	import {
		checkDiffLineIncludeChange,
		DiffLineType,
		SplitSide,
		type DiffFile
	} from '@git-diff-view/core';
	import {
		borderColorName,
		emptyBGName,
		expandLineNumberColorName,
		getContentBG,
		getLineNumberBG,
		plainLineNumberColorName
	} from '@git-diff-view/utils';
	import DiffSplitAddWidget from './DiffSplitAddWidget.svelte';
	import DiffContent from './DiffContent.svelte';

	interface Props {
		index: number;
		diffFile: DiffFile;
		lineNumber: number;
	}

	let props: Props = $props();

	const widget = $derived.by(getWidget());

	const enableAddWidget = $derived.by(getEnableAddWidget());

	const enableHighlight = $derived.by(getEnableHighlight());

	const onAddWidgetClick = $derived.by(getOnAddWidgetClick());

	const oldLine = $derived.by(() => props.diffFile.getSplitLeftLine(props.index));

	const newLine = $derived.by(() => props.diffFile.getSplitRightLine(props.index));

	const getOldSyntaxLine = () => props.diffFile.getOldSyntaxLine(oldLine?.lineNumber || 0);

	const getNewSyntaxLine = () => props.diffFile.getNewSyntaxLine(newLine?.lineNumber || 0);

	const getOldPlainLine = () => props.diffFile.getOldPlainLine(oldLine?.lineNumber || 0);

	const getNewPlainLine = () => props.diffFile.getNewPlainLine(newLine?.lineNumber || 0);

	let oldSyntaxLine = $state(getOldSyntaxLine());

	let newSyntaxLine = $state(getNewSyntaxLine());

	let oldPlainLine = $state(getOldPlainLine());

	let newPlainLine = $state(getNewPlainLine());

	const hasDiff = $derived.by(() => !!oldLine?.diff || !!newLine?.diff);

	const hasChange = $derived.by(
		() => checkDiffLineIncludeChange(oldLine?.diff) || checkDiffLineIncludeChange(newLine?.diff)
	);

	const hasHidden = $derived.by(() => oldLine?.isHidden && newLine?.isHidden);

	const oldLineIsDelete = () => oldLine?.diff?.type === DiffLineType.Delete;

	const newLineIsAdded = () => newLine?.diff?.type === DiffLineType.Add;

	const init = () => {
		oldSyntaxLine = getOldSyntaxLine();
		newSyntaxLine = getNewSyntaxLine();
		oldPlainLine = getOldPlainLine();
		newPlainLine = getNewPlainLine();
	};

	const unSubscribe = { current: () => {} };

	$effect(() => {
		unSubscribe.current();

		init();

		unSubscribe.current = props.diffFile.subscribe(init);
	});

	const onOpenAddWidget = (lineNumber: number, side: SplitSide) => {
		widget.side = side;
		widget.lineNumber = lineNumber;
	};
</script>

{#if !hasHidden}
	<tr data-line={props.lineNumber} data-state={hasDiff ? 'diff' : 'plain'} class="diff-line">
		{#if oldLine?.lineNumber}
			<td
				class="diff-line-old-num group relative w-[1%] min-w-[40px] select-none pl-[10px] pr-[10px] text-right align-top"
				style={`
					background-color: ${getLineNumberBG(false, oldLineIsDelete(), hasDiff)};
					color: var(${hasDiff ? plainLineNumberColorName : expandLineNumberColorName})
				`}
			>
				{#if hasDiff && enableAddWidget}
					<DiffSplitAddWidget
						index={props.index}
						lineNumber={oldLine?.lineNumber || 0}
						side={SplitSide.old}
						diffFile={props.diffFile}
						onWidgetClick={onAddWidgetClick}
						className="absolute left-[100%] z-[1] translate-x-[-50%]"
						{onOpenAddWidget}
					/>
				{/if}
				<span
					data-line-num={oldLine?.lineNumber}
					style={`opacity: ${hasChange ? undefined : 0.5} `}
				>
					{oldLine?.lineNumber}
				</span>
			</td>
			<td
				class="diff-line-old-content group relative pr-[10px] align-top"
				style={` background-color: ${getContentBG(false, oldLineIsDelete(), hasDiff)} `}
				data-side={SplitSide[SplitSide.old]}
			>
				{#if hasDiff && enableAddWidget}
					<DiffSplitAddWidget
						index={props.index}
						lineNumber={oldLine?.lineNumber || 0}
						side={SplitSide.old}
						diffFile={props.diffFile}
						onWidgetClick={onAddWidgetClick}
						className="absolute right-[100%] z-[1] translate-x-[50%]"
						{onOpenAddWidget}
					/>
				{/if}
				<DiffContent
					enableWrap={true}
					diffFile={props.diffFile}
					rawLine={oldLine?.value || ''}
					diffLine={oldLine?.diff}
					plainLine={oldPlainLine}
					syntaxLine={oldSyntaxLine}
					enableHighlight={!!enableHighlight}
				/>
			</td>
		{:else}
			<td
				class="diff-line-old-placeholder select-none"
				style={`background-color: var(${emptyBGName}) `}
				colspan={2}
			>
				<span>&ensp;</span>
			</td>
		{/if}
		{#if newLine?.lineNumber}
			<td
				class="diff-line-new-num group relative w-[1%] min-w-[40px] select-none border-l-[1px] pl-[10px] pr-[10px] text-right align-top"
				style={`
					background-color: ${getLineNumberBG(newLineIsAdded(), false, hasDiff)};
					color: var(${hasDiff ? plainLineNumberColorName : expandLineNumberColorName});
					border-left-color: var(${borderColorName});
					border-left-style: solid
				`}
			>
				{#if hasDiff && enableAddWidget}
					<DiffSplitAddWidget
						index={props.index}
						lineNumber={newLine?.lineNumber || 0}
						side={SplitSide.new}
						diffFile={props.diffFile}
						onWidgetClick={onAddWidgetClick}
						className="absolute left-[100%] z-[1] translate-x-[-50%]"
						{onOpenAddWidget}
					/>
				{/if}
				<span
					data-line-num={newLine?.lineNumber}
					style={` opacity: ${hasChange ? undefined : 0.5} `}
				>
					{newLine?.lineNumber}
				</span>
			</td>
			<td
				class="diff-line-new-content group relative pr-[10px] align-top"
				style={`background-color: ${getContentBG(newLineIsAdded(), false, hasDiff)} `}
				data-side={SplitSide[SplitSide.new]}
			>
				{#if hasDiff && enableAddWidget}
					<DiffSplitAddWidget
						index={props.index}
						lineNumber={newLine?.lineNumber || 0}
						side={SplitSide.new}
						diffFile={props.diffFile}
						onWidgetClick={onAddWidgetClick}
						className="absolute right-[100%] z-[1] translate-x-[50%]"
						{onOpenAddWidget}
					/>
				{/if}
				<DiffContent
					enableWrap={true}
					diffFile={props.diffFile}
					rawLine={newLine?.value || ''}
					diffLine={newLine?.diff}
					plainLine={newPlainLine}
					syntaxLine={newSyntaxLine}
					enableHighlight={!!enableHighlight}
				/>
			</td>
		{:else}
			<td
				class="diff-line-new-placeholder select-none border-l-[1px]"
				style={`
					background-color: var(${emptyBGName});
					border-left-color: var(${borderColorName});
					border-left-style: solid;
				`}
				colspan={2}
			>
				<span>&ensp;</span>
			</td>
		{/if}
	</tr>
{/if}
