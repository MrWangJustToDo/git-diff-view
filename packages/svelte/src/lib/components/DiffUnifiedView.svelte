<script lang="ts">
	import { getEnableWrap } from '$lib/context/enableWrap.js';
	import { getFontSize } from '$lib/context/fontSize.js';
	import { useTextWidth } from '$lib/hooks/useTextWidth.svelte.js';
	import { getUnifiedContentLine, type DiffFile } from '@git-diff-view/core';
	import { diffAsideWidthName, diffFontSizeName } from '$lib/utils/size.js';
	import { removeAllSelection } from '$lib/utils/dom.js';

	import DiffUnifiedContentLine from './DiffUnifiedContentLine.svelte';
	import DiffUnifiedExtendLine from './DiffUnifiedExtendLine.svelte';
	import DiffUnifiedHunkLine from './DiffUnifiedHunkLine.svelte';
	import DiffUnifiedWidgetLine from './DiffUnifiedWidgetLine.svelte';
	import { onDestroy } from 'svelte';

	interface Props {
		diffFile: DiffFile;
	}

	const props: Props = $props();

	let lines = $state(getUnifiedContentLine(props.diffFile));

	let maxText = $state(props.diffFile.unifiedLineLength.toString());

	let styleRef = $state<HTMLStyleElement | null>(null);

	const fontSize = $derived.by(getFontSize());

	const enableWrap = $derived.by(getEnableWrap());

	const unSubscribe = { current: () => {} };

	const selectState = { current: undefined as boolean | undefined };

	const init = () => {
		const diffFile = props.diffFile;
		lines = getUnifiedContentLine(diffFile);
		maxText = diffFile.unifiedLineLength.toString();
	};

	$effect(() => {
		unSubscribe.current?.();

		init();

		unSubscribe.current = props.diffFile.subscribe(init);
	});

	onDestroy(() => unSubscribe.current());

	const onMouseDown = (e: MouseEvent) => {
		let ele = e.target as HTMLElement | null;

		if (!styleRef) return;

		if (ele && ele?.nodeName === 'BUTTON') {
			removeAllSelection();
			return;
		}

		while (ele && ele instanceof HTMLElement) {
			const state = ele.getAttribute('data-state');
			if (state) {
				if (state === 'extend' || state === 'hunk' || state === 'widget') {
					if (selectState.current !== false) {
						selectState.current = false;
						styleRef.innerHTML = '';
						removeAllSelection();
					}
				} else {
					if (selectState.current !== true) {
						selectState.current = true;
						styleRef.innerHTML = `#${id} [data-state="extend"] {user-select: none} \n#${id} [data-state="hunk"] {user-select: none} \n#${id} [data-state="widget"] {user-select: none}`;
						removeAllSelection();
					}
				}
				return;
			}
			ele = ele.parentElement;
		}
	};

	const font = $derived.by(() => ({
		fontSize: fontSize + 'px',
		fontFamily: 'Menlo, Consolas, monospace'
	}));

	const width = $derived.by(useTextWidth({ text: () => maxText, font: () => font }));

	const computedWidth = $derived.by(() => Math.max(40, width + 10));

	const id = $derived.by(() => `diff-root${props.diffFile.getId()}`);
</script>

<div
	class={`unified-diff-view ${enableWrap ? 'unified-diff-view-wrap' : 'unified-diff-view-normal'} w-full`}
>
	<style data-select-style {@attach (e) => (styleRef = e)}></style>
	<div
		class="unified-diff-table-wrapper diff-table-scroll-container w-full overflow-x-auto overflow-y-hidden"
		style={`${diffAsideWidthName}: ${Math.round(computedWidth)}px; font-family: Menlo, Consolas, monospace; font-size: var(${diffFontSizeName})`}
	>
		<table
			class={`unified-diff-table w-full border-collapse border-spacing-0 ${enableWrap ? 'table-fixed' : ''}`}
		>
			<colgroup>
				<col class="unified-diff-table-num-col" />
				<col class="unified-diff-table-content-col" />
			</colgroup>
			<thead class="hidden">
				<tr>
					<th scope="col">line number</th>
					<th scope="col">line content</th>
				</tr>
			</thead>
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<tbody class="diff-table-body leading-[1.6]" onmousedown={onMouseDown}>
				{#each lines as item}
					<DiffUnifiedHunkLine
						index={item.index}
						lineNumber={item.lineNumber}
						diffFile={props.diffFile}
					/>
					<DiffUnifiedContentLine
						index={item.index}
						lineNumber={item.lineNumber}
						diffFile={props.diffFile}
					/>
					<DiffUnifiedWidgetLine
						index={item.index}
						lineNumber={item.lineNumber}
						diffFile={props.diffFile}
					/>
					<DiffUnifiedExtendLine
						index={item.index}
						lineNumber={item.lineNumber}
						diffFile={props.diffFile}
					/>
				{/each}
				<DiffUnifiedHunkLine
					index={props.diffFile.unifiedLineLength}
					lineNumber={props.diffFile.unifiedLineLength}
					diffFile={props.diffFile}
				/>
			</tbody>
		</table>
	</div>
</div>
