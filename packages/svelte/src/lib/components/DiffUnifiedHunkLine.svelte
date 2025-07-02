<script lang="ts">
	import ExpandUp from './DiffExpandUp.svelte';
	import ExpandDown from './DiffExpandDown.svelte';
	import ExpandAll from './DiffExpandAll.svelte';
	import { getEnableWrap } from '$lib/context/enableWrap.js';
	import { composeLen, type DiffFile } from '@git-diff-view/core';
	import {
		hunkContentBGName,
		hunkContentColorName,
		hunkLineNumberBGName,
		plainLineNumberColorName
	} from '$lib/utils/color.js';
	import { diffAsideWidthName } from '$lib/utils/size.js';

	interface Props {
		index: number;
		diffFile: DiffFile;
		lineNumber: number;
	}

	let props: Props = $props();

	const currentHunk = $derived.by(() => props.diffFile.getUnifiedHunkLine(props.index));

	const enableExpand = $derived.by(() => props.diffFile.getExpandEnabled());

	const couldExpand = $derived.by(() => enableExpand && currentHunk && currentHunk.unifiedInfo);

	const enableWrap = $derived.by(getEnableWrap());

	const checkCurrentIsShow = () => {
		return (
			currentHunk &&
			currentHunk.unifiedInfo &&
			currentHunk.unifiedInfo.startHiddenIndex < currentHunk.unifiedInfo.endHiddenIndex
		);
	};

	let currentIsShow = $state(checkCurrentIsShow());

	const checkCurrentIsEnableAll = () => {
		return (
			currentHunk &&
			currentHunk.unifiedInfo &&
			currentHunk.unifiedInfo.endHiddenIndex - currentHunk.unifiedInfo.startHiddenIndex < composeLen
		);
	};

	let currentIsEnableAll = $state(checkCurrentIsEnableAll());

	const currentIsFirstLine = $derived.by(() => currentHunk && currentHunk.isFirst);

	const currentIsLastLine = $derived.by(() => currentHunk && currentHunk.isLast);

	const currentIsPureHunk = $derived.by(
		() => currentHunk && props.diffFile._getIsPureDiffRender() && !currentHunk.unifiedInfo
	);

	let unSubscribe = { current: () => {} };

	$effect(() => {
		unSubscribe?.current?.();

		const init = () => {
			currentIsShow = checkCurrentIsShow();
			currentIsEnableAll = checkCurrentIsEnableAll();
		};

		init();

		unSubscribe.current = props.diffFile.subscribe(init);
	});
</script>

{#if currentIsShow || currentIsPureHunk}
	<tr data-line={`${props.lineNumber}-hunk`} data-state="hunk" class="diff-line diff-line-hunk">
		<td
			class="diff-line-hunk-action sticky left-0 w-[1%] min-w-[100px] select-none"
			style={`
				background-color: var(${hunkLineNumberBGName});
				color: var(${plainLineNumberColorName});
				width: calc(calc(var(${diffAsideWidthName}) + 5px) * 2);
				max-width: calc(calc(var(${diffAsideWidthName}) + 5px) * 2);
				min-width: calc(calc(var(${diffAsideWidthName}) + 5px) * 2);
			`}
		>
			{#if couldExpand}
				{#if currentIsFirstLine}
					<button
						class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]"
						title="Expand Up"
						data-title="Expand Up"
						onclick={() => props.diffFile.onUnifiedHunkExpand('up', props.index)}
					>
						<ExpandUp className="fill-current" />
					</button>
				{:else if currentIsLastLine}
					<button
						class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]"
						title="Expand Down"
						data-title="Expand Down"
						onclick={() => props.diffFile.onUnifiedHunkExpand('down', props.index)}
					>
						<ExpandDown className="fill-current" />
					</button>
				{:else if currentIsEnableAll}
					<button
						class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]"
						title="Expand All"
						data-title="Expand All"
						onclick={() => props.diffFile.onUnifiedHunkExpand('all', props.index)}
					>
						<ExpandAll className="fill-current" />
					</button>
				{:else}
					<button
						class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[2px]"
						title="Expand Down"
						data-title="Expand Down"
						onclick={() => props.diffFile.onUnifiedHunkExpand('down', props.index)}
					>
						<ExpandDown className="fill-current" />
					</button>
					<button
						class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[2px]"
						title="Expand Up"
						data-title="Expand Up"
						onclick={() => props.diffFile.onUnifiedHunkExpand('up', props.index)}
					>
						<ExpandUp className="fill-current" />
					</button>
				{/if}
			{:else}
				<div class="min-h-[28px]">&ensp;</div>
			{/if}
		</td>
		<td
			class="diff-line-hunk-content pr-[10px] align-middle"
			style={` background-color: var(${hunkContentBGName}) `}
		>
			<div
				class="pl-[1.5em]"
				style={`
					white-space: ${enableWrap ? 'pre-wrap' : 'pre'};
					word-break: ${enableWrap ? 'break-all' : 'initial'};
					color: var(${hunkContentColorName});
				`}
			>
				{currentHunk?.unifiedInfo?.plainText || currentHunk.text}
			</div>
		</td>
	</tr>
{/if}
