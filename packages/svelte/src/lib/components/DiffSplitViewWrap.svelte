<script lang="ts">
	import { getFontSize } from '$lib/context/fontSize.js';
	import { useTextWidth } from '$lib/hooks/useTextWidth.svelte.js';
	import { getSplitContentLines, SplitSide, type DiffFile } from '@git-diff-view/core';
	import { diffAsideWidthName, diffFontSizeName, removeAllSelection } from '@git-diff-view/utils';

	import DiffSplitContentLine from './DiffSplitContentLineWrap.svelte';
	import DiffSplitExtendLine from './DiffSplitExtendLineWrap.svelte';
	import DiffSplitHunkLine from './DiffSplitHunkLineWrap.svelte';
	import DiffSplitWidgetLine from './DiffSplitWidgetLineWrap.svelte';

	interface Props {
		diffFile: DiffFile;
	}

	let props: Props = $props();

	const getAllLines = () => getSplitContentLines(props.diffFile);

	let lines = $state(getAllLines());

	let styleRef = $state<HTMLStyleElement | null>();

	const maxText = $derived.by(() =>
		Math.max(props.diffFile.splitLineLength, props.diffFile.fileLineLength).toString()
	);

	const fontSize = $derived.by(getFontSize());

	const font = $derived.by(() => ({
		fontSize: `${fontSize || 14}px`,
		fontFamily: 'Menlo, Consolas, monospace'
	}));

	const unSubscribe = { current: () => {} };

	$effect(() => {
		unSubscribe.current();

		const init = () => (lines = getAllLines());

		init();

		unSubscribe.current = props.diffFile.subscribe(init);
	});

	const onSelect = (side?: SplitSide) => {
		const ele = styleRef;

		if (!ele) return;

		if (side) {
			const targetSide = side === SplitSide.old ? SplitSide.new : SplitSide.old;
			ele.textContent = `#diff-root${props.diffFile.getId()} [data-side="${SplitSide[targetSide]}"] {user-select: none} \n#diff-root${props.diffFile.getId()} [data-state="extend"] {user-select: none} \n#diff-root${props.diffFile.getId()} [data-state="hunk"] {user-select: none} \n#diff-root${props.diffFile.getId()} [data-state="widget"] {user-select: none}`;
		} else {
			ele.textContent = '';
		}
	};

	const onMouseDown = (e: MouseEvent) => {
		let ele = e.target;

		// need remove all the selection
		if (ele && ele instanceof HTMLElement && ele.nodeName === 'BUTTON') {
			removeAllSelection();
			return;
		}

		while (ele && ele instanceof HTMLElement) {
			const state = ele.getAttribute('data-state');
			const side = ele.getAttribute('data-side');
			if (side) {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				onSelect(SplitSide[side]);
				removeAllSelection();
			}
			if (state) {
				if (state === 'extend' || state === 'hunk' || state === 'widget') {
					onSelect(undefined);
					removeAllSelection();
					return;
				} else {
					return;
				}
			}

			ele = ele.parentElement;
		}
	};

	const width = $derived.by(useTextWidth({ text: () => maxText, font: () => font }));

	const memoWidth = $derived.by(() => Math.max(40, width + 25));
</script>

<div class="split-diff-view split-diff-view-warp w-full">
	<div
		class="diff-table-wrapper w-full"
		style={`
			${diffAsideWidthName}: ${Math.round(memoWidth)}px,
			font-family: Menlo, Consolas, monospace,
			font-size: var(${diffFontSizeName})
		`}
	>
		<style data-select-style {@attach (e) => (styleRef = e)}></style>
		<table class="diff-table w-full table-fixed border-collapse border-spacing-0">
			<colgroup>
				<col class="diff-table-old-num-col" width={Math.round(memoWidth)} />
				<col class="diff-table-old-content-col" />
				<col class="diff-table-new-num-col" width={Math.round(memoWidth)} />
				<col class="diff-table-new-content-col" />
			</colgroup>
			<thead class="hidden">
				<tr>
					<th scope="col">old line number</th>
					<th scope="col">old line content</th>
					<th scope="col">new line number</th>
					<th scope="col">new line content</th>
				</tr>
			</thead>
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<tbody class="diff-table-body leading-[1.4]" onmousedown={onMouseDown}>
				{#each lines as item}
					<DiffSplitHunkLine
						index={item.index}
						lineNumber={item.lineNumber}
						diffFile={props.diffFile}
					/>
					<DiffSplitContentLine
						index={item.index}
						lineNumber={item.lineNumber}
						diffFile={props.diffFile}
					/>
					<DiffSplitWidgetLine
						index={item.index}
						lineNumber={item.lineNumber}
						diffFile={props.diffFile}
					/>
					<DiffSplitExtendLine
						index={item.index}
						lineNumber={item.lineNumber}
						diffFile={props.diffFile}
					/>
				{/each}
				<DiffSplitHunkLine
					index={props.diffFile.splitLineLength}
					lineNumber={props.diffFile.splitLineLength}
					diffFile={props.diffFile}
				/>
			</tbody>
		</table>
	</div>
</div>
