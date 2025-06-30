<script lang="ts">
	import { composeLen, type DiffFile } from '@git-diff-view/core';
	import {
		borderColorName,
		hunkContentBGName,
		hunkContentColorName,
		hunkLineNumberBGName,
		plainLineNumberColorName
	} from '@git-diff-view/utils';
	import ExpandUp from './DiffExpandUp.svelte';
	import ExpandDown from './DiffExpandDown.svelte';
	import ExpandAll from './DiffExpandAll.svelte';

	interface Props {
		index: number;
		diffFile: DiffFile;
		lineNumber: number;
	}

	let props: Props = $props();

	const currentHunk = $derived.by(() => props.diffFile.getSplitHunkLine(props.index));

	const enableExpand = $derived.by(() => props.diffFile.getExpandEnabled());

	const couldExpand = $derived.by(() => enableExpand && currentHunk?.splitInfo);

	const checkCurrentShowExpandAll = () => {
		const hunk = currentHunk;
		return (
			hunk &&
			hunk.splitInfo &&
			hunk.splitInfo.endHiddenIndex - hunk.splitInfo.startHiddenIndex < composeLen
		);
	};

	let currentShowExpandAll = $state(checkCurrentShowExpandAll());

	const checkCurrentIsShow = () => {
		const hunk = currentHunk;
		return (
			hunk && hunk.splitInfo && hunk.splitInfo.startHiddenIndex < hunk.splitInfo.endHiddenIndex
		);
	};

	let currentIsShow = $state(checkCurrentIsShow());

	const currentIsFirstLine = $derived.by(() => {
		const hunk = currentHunk;
		return hunk && hunk.isFirst;
	});

	const currentIsPureHunk = $derived.by(() => {
		const hunk = currentHunk;
		return hunk && props.diffFile._getIsPureDiffRender() && !hunk.splitInfo;
	});

	const currentIsLastLine = $derived.by(() => {
		const hunk = currentHunk;
		return hunk && hunk.isLast;
	});

	const unSubscribe = { current: () => {} };

	$effect(() => {
		unSubscribe.current();

		const init = () => {
			currentIsShow = checkCurrentIsShow();
			currentShowExpandAll = checkCurrentShowExpandAll();
		};

		init();

		unSubscribe.current = props.diffFile.subscribe(init);
	});
</script>

{#if currentIsShow || currentIsPureHunk}
	<tr data-line={`${props.lineNumber}-hunk`} data-state="hunk" class="diff-line diff-line-hunk">
		<td
			class="diff-line-hunk-action relative w-[1%] min-w-[40px] select-none p-[1px]"
			style={`
				background-color: var(${hunkLineNumberBGName});
				color: var(${plainLineNumberColorName})
			`}
		>
			{#if couldExpand}
				{#if currentIsFirstLine}
					<button
						class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]"
						title="Expand Up"
						data-title="Expand Up"
						onclick={() => props.diffFile.onSplitHunkExpand('up', props.index)}
					>
						<ExpandUp className="fill-current" />
					</button>
				{:else if currentIsLastLine}
					<button
						class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]"
						title="Expand Down"
						data-title="Expand Down"
						onclick={() => props.diffFile.onSplitHunkExpand('down', props.index)}
					>
						<ExpandDown className="fill-current" />
					</button>
				{:else if currentShowExpandAll}
					<button
						class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]"
						title="Expand All"
						data-title="Expand All"
						onclick={() => props.diffFile.onSplitHunkExpand('all', props.index)}
					>
						<ExpandAll className="fill-current" />
					</button>
				{:else}
					<button
						class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[2px]"
						title="Expand Down"
						data-title="Expand Down"
						onclick={() => props.diffFile.onSplitHunkExpand('down', props.index)}
					>
						<ExpandDown className="fill-current" />
					</button>
					<button
						class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[2px]"
						title="Expand Up"
						data-title="Expand Up"
						onclick={() => props.diffFile.onSplitHunkExpand('up', props.index)}
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
			style={`background-color: var(${hunkContentBGName})`}
		>
			<div
				class="pl-[1.5em]"
				style={`
					color: var(${hunkContentColorName})
				`}
			>
				{currentHunk?.splitInfo?.plainText || currentHunk?.text}
			</div>
		</td>
		<td
			class="diff-line-hunk-action relative z-[1] w-[1%] min-w-[40px] select-none border-l-[1px] p-[1px]"
			style={`
				background-color: var(${hunkLineNumberBGName});
				color: var(${plainLineNumberColorName});
				border-left-color: var(${borderColorName});
				border-left-style: solid
			`}
		>
			{#if couldExpand}
				{#if currentIsFirstLine}
					<button
						class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]"
						title="Expand Up"
						data-title="Expand Up"
						onclick={() => props.diffFile.onSplitHunkExpand('up', props.index)}
					>
						<ExpandUp className="fill-current" />
					</button>
				{:else if currentIsLastLine}
					<button
						class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]"
						title="Expand Down"
						data-title="Expand Down"
						onclick={() => props.diffFile.onSplitHunkExpand('down', props.index)}
					>
						<ExpandDown className="fill-current" />
					</button>
				{:else if currentShowExpandAll}
					<button
						class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[6px]"
						title="Expand All"
						data-title="Expand All"
						onclick={() => props.diffFile.onSplitHunkExpand('all', props.index)}
					>
						<ExpandAll className="fill-current" />
					</button>
				{:else}
					<button
						class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[2px]"
						title="Expand Down"
						data-title="Expand Down"
						onclick={() => props.diffFile.onSplitHunkExpand('down', props.index)}
					>
						<ExpandDown className="fill-current" />
					</button>
					<button
						class="diff-widget-tooltip flex w-full cursor-pointer items-center justify-center rounded-[2px] py-[2px]"
						title="Expand Up"
						data-title="Expand Up"
						onclick={() => props.diffFile.onSplitHunkExpand('up', props.index)}
					>
						<ExpandUp className="fill-current" />
					</button>
				{/if}
			{:else}
				<div class="min-h-[28px]">&ensp;</div>
			{/if}
		</td>
		<td
			class="diff-line-hunk-content relative pr-[10px] align-middle"
			style={`background-color: var(${hunkContentBGName})`}
		>
			<div
				class="pl-[1.5em]"
				style={`
					color: var(${hunkContentColorName})
				`}
			>
				{currentHunk?.splitInfo?.plainText || currentHunk?.text}
			</div>
		</td>
	</tr>
{/if}
