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
		diffAsideWidthName,
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
		side: SplitSide;
		diffFile: DiffFile;
		lineNumber: number;
	}

	let props: Props = $props();

	const widget = $derived.by(getWidget());

	const enableAddWidget = $derived.by(getEnableAddWidget());

	const enableHighlight = $derived.by(getEnableHighlight());

	const onAddWidgetClick = $derived.by(getOnAddWidgetClick());

	const currentLine = $derived.by(() =>
		props.side === SplitSide.old
			? props.diffFile.getSplitLeftLine(props.index)
			: props.diffFile.getSplitRightLine(props.index)
	);

	const currentLineHasDiff = $derived.by(() => !!currentLine?.diff);

	const currentLineHasChange = $derived.by(() => checkDiffLineIncludeChange(currentLine?.diff));

	const currentLineHasHidden = $derived.by(() => currentLine?.isHidden);

	const currentLineHasContent = $derived.by(() => !!currentLine?.lineNumber);

	const getCurrentSyntaxLine = () =>
		props.side === SplitSide.old
			? props.diffFile.getOldSyntaxLine(currentLine?.lineNumber || 0)
			: props.diffFile.getNewSyntaxLine(currentLine?.lineNumber || 0);

	const getCurrentPlainLine = () =>
		props.side === SplitSide.old
			? props.diffFile.getOldPlainLine(currentLine?.lineNumber || 0)
			: props.diffFile.getNewPlainLine(currentLine?.lineNumber || 0);

	let currentSyntaxLine = $state(getCurrentSyntaxLine());

	let currentPlainLine = $state(getCurrentPlainLine());

	const init = () => {
		currentSyntaxLine = getCurrentSyntaxLine();
		currentPlainLine = getCurrentPlainLine();
	};

	let unSubscribe = { current: () => {} };

	$effect(() => {
		unSubscribe.current();

		init();

		unSubscribe.current = props.diffFile.subscribe(init);
	});

	const onOpenAddWidget = (lineNumber: number, side: SplitSide) => {
		widget.side = side;
		widget.lineNumber = lineNumber;
	};

	const isAdded = () => currentLine?.diff?.type === DiffLineType.Add;

	const isDelete = () => currentLine?.diff?.type === DiffLineType.Delete;
</script>

{#if !currentLineHasHidden}
	<tr
		data-line={props.lineNumber}
		data-state={currentLineHasDiff || !currentLineHasContent ? 'diff' : 'plain'}
		data-side={SplitSide[props.side]}
		class={'diff-line' + (currentLineHasContent ? ' group' : '')}
	>
		{#if currentLineHasContent}
			<td
				class={`diff-line-${SplitSide[props.side]}-num sticky left-0 z-[1] w-[1%] min-w-[40px] select-none pl-[10px] pr-[10px] text-right align-top`}
				style={`
					background-color: ${getLineNumberBG(isAdded(), isDelete(), currentLineHasDiff)},
					color: var(${currentLineHasDiff ? plainLineNumberColorName : expandLineNumberColorName}),
					width: var(${diffAsideWidthName}),
					min-width': var(${diffAsideWidthName}),
					max-width': var(${diffAsideWidthName})
				`}
			>
				{#if currentLineHasDiff && enableAddWidget}
					<DiffSplitAddWidget
						index={props.index}
						lineNumber={currentLine?.lineNumber || 0}
						side={props.side}
						diffFile={props.diffFile}
						onWidgetClick={onAddWidgetClick}
						className="absolute left-[100%] z-[1] translate-x-[-50%]"
						{onOpenAddWidget}
					/>
				{/if}
				<span
					data-line-num={currentLine?.lineNumber}
					style={` opacity: ${currentLineHasChange ? undefined : 0.5} `}
				>
					{currentLine?.lineNumber}
				</span>
			</td>
			<td
				class={`diff-line-${SplitSide[props.side]}-content pr-[10px] align-top`}
				style={` background-color: ${getContentBG(isAdded(), isDelete(), currentLineHasDiff)} `}
			>
				<DiffContent
					enableWrap={false}
					diffFile={props.diffFile}
					rawLine={currentLine?.value || ''}
					diffLine={currentLine?.diff}
					plainLine={currentPlainLine}
					syntaxLine={currentSyntaxLine}
					enableHighlight={!!enableHighlight}
				/>
			</td>
		{:else}
			<td
				class={`diff-line-${SplitSide[props.side]}-placeholder select-none`}
				style={`background-color': var(${emptyBGName}) `}
				colspan={2}
			>
				<span>&ensp;</span>
			</td>
		{/if}
	</tr>
{/if}
