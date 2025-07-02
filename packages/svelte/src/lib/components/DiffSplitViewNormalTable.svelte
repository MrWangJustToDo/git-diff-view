<script lang="ts">
	import { getSplitContentLines, SplitSide, type DiffFile } from '@git-diff-view/core';
	import { removeAllSelection } from '$lib/utils/dom.js';

	import DiffSplitContentLine from './DiffSplitContentLineNormal.svelte';
	import DiffSplitExtendLine from './DiffSplitExtendLineNormal.svelte';
	import DiffSplitHunkLine from './DiffSplitHunkLineNormal.svelte';
	import DiffSplitWidgetLine from './DiffSplitWidgetLineNormal.svelte';

	interface Props {
		side: SplitSide;
		diffFile: DiffFile;
		onSelect?: (side?: SplitSide) => void;
		selectState: { current?: SplitSide };
	}

	let props: Props = $props();

	const className = $derived.by(() =>
		props.side === SplitSide.new ? 'new-diff-table' : 'old-diff-table'
	);

	const getAllLines = () => getSplitContentLines(props.diffFile);

	let lines = $state(getAllLines());

	const unSubscribe = { current: () => {} };

	const selectState = props.selectState;

	$effect(() => {
		unSubscribe.current();

		const init = () => (lines = getAllLines());

		init();

		unSubscribe.current = props.diffFile.subscribe(init);
	});

	const onMouseDown = (e: MouseEvent) => {
		let ele = e.target as HTMLElement | null;

		if (ele && ele?.nodeName === 'BUTTON') {
			removeAllSelection();
			return;
		}

		while (ele && ele instanceof HTMLElement) {
			const state = ele.getAttribute('data-state');
			if (state) {
				if (state === 'extend' || state === 'hunk' || state === 'widget') {
					if (selectState.current !== undefined) {
						selectState.current = undefined;
						props.onSelect?.(undefined);
						removeAllSelection();
					}
				} else {
					if (selectState.current !== props.side) {
						selectState.current = props.side;
						props.onSelect?.(props.side);
						removeAllSelection();
					}
				}
				return;
			}
			ele = ele.parentElement;
		}
	};
</script>

<table
	class={`${className} w-full border-collapse border-spacing-0`}
	data-mode={SplitSide[props.side]}
>
	<colgroup>
		<col class={`diff-table-${SplitSide[props.side]}-num-col`} />
		<col class={`diff-table-${SplitSide[props.side]}-content-col`} />
	</colgroup>
	<thead class="hidden">
		<tr>
			<th scope="col">{SplitSide[props.side]} line number</th>
			<th scope="col">{SplitSide[props.side]} line content</th>
		</tr>
	</thead>
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<tbody class="diff-table-body leading-[1.4]" onmousedown={onMouseDown}>
		{#each lines as item}
			<DiffSplitHunkLine
				index={item.index}
				side={props.side}
				lineNumber={item.lineNumber}
				diffFile={props.diffFile}
			/>
			<DiffSplitContentLine
				index={item.index}
				side={props.side}
				lineNumber={item.lineNumber}
				diffFile={props.diffFile}
			/>
			<DiffSplitWidgetLine
				index={item.index}
				side={props.side}
				lineNumber={item.lineNumber}
				diffFile={props.diffFile}
			/>
			<DiffSplitExtendLine
				index={item.index}
				side={props.side}
				lineNumber={item.lineNumber}
				diffFile={props.diffFile}
			/>
		{/each}
		<DiffSplitHunkLine
			side={props.side}
			index={props.diffFile.splitLineLength}
			lineNumber={props.diffFile.splitLineLength}
			diffFile={props.diffFile}
		/>
	</tbody>
</table>
