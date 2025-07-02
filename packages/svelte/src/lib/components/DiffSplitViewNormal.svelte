<script lang="ts">
	import { getFontSize } from '$lib/context/fontSize.js';
	import { useIsMounted } from '$lib/hooks/useIsMounted.svelte.js';
	import { useTextWidth } from '$lib/hooks/useTextWidth.svelte.js';
	import { DiffFile, SplitSide } from '@git-diff-view/core';
	import { borderColorName } from '$lib/utils/color.js';
	import { diffAsideWidthName, diffFontSizeName } from '$lib/utils/size.js';
	import { syncScroll } from '$lib/utils/dom.js';

	import DiffSplitViewNormalTable from './DiffSplitViewNormalTable.svelte';

	interface Props {
		diffFile: DiffFile;
	}

	let props: Props = $props();

	const isMounted = $derived.by(useIsMounted());

	let ref1 = $state<HTMLDivElement>();

	let ref2 = $state<HTMLDivElement>();

	let styleRef = $state<HTMLStyleElement | null>(null);

	const maxText = $derived.by(() =>
		Math.max(props.diffFile.fileLineLength, props.diffFile.splitLineLength).toString()
	);

	const unSubscribe = { current: () => {} };

	const selectState = { current: undefined as SplitSide | undefined };

	const initSyncScroll = () => {
		unSubscribe.current();
		if (!isMounted) return;
		const left = ref1;
		const right = ref2;
		if (!left || !right) return;
		unSubscribe.current = syncScroll(left, right);
	};

	$effect(initSyncScroll);

	const onSelect = (side?: SplitSide) => {
		const ele = styleRef;

		if (!ele) return;

		if (!side) {
			ele.textContent = '';
		} else {
			ele.textContent = `#${getId()} [data-state="extend"] {user-select: none} \n#${getId()} [data-state="hunk"] {user-select: none} \n#${getId()} [data-state="widget"] {user-select: none}`;
		}
	};

	const fontSize = $derived.by(getFontSize());

	const font = $derived.by(() => ({
		fontSize: `${fontSize || 14}px`,
		fontFamily: 'Menlo, Consolas, monospace'
	}));

	const width = $derived.by(useTextWidth({ text: () => maxText, font: () => font }));

	const computedWidth = $derived.by(() => Math.max(40, width + 25));

	const getId = () => `diff-split-view-${props.diffFile.getId()}`;
</script>

<div class="split-diff-view split-diff-view-normal flex w-full basis-[50%]">
	<style data-select-style {@attach (e) => (styleRef = e)}></style>
	<div
		class="old-diff-table-wrapper diff-table-scroll-container w-full overflow-x-auto overflow-y-hidden"
		style={`
      ${diffAsideWidthName}: ${Math.round(computedWidth)}px;
      overscroll-behavior-x: none;
      font-family: Menlo, Consolas, monospace;
      font-size: var(${diffFontSizeName});
    `}
		{@attach (e) => {
			ref1 = e;
		}}
	>
		<DiffSplitViewNormalTable
			side={SplitSide.old}
			diffFile={props.diffFile}
			{onSelect}
			{selectState}
		/>
	</div>
	<div class="diff-split-line w-[1.5px]" style={`background-color: var(${borderColorName})`}></div>
	<div
		class="new-diff-table-wrapper diff-table-scroll-container w-full overflow-x-auto overflow-y-hidden"
		style={`
			${diffAsideWidthName}: ${Math.round(computedWidth)}px;
			overscroll-behavior-x: none;
			font-family: Menlo, Consolas, monospace;
			font-size: var(${diffFontSizeName});
		`}
		{@attach (e) => {
			ref2 = e;
		}}
	>
		<DiffSplitViewNormalTable
			side={SplitSide.new}
			diffFile={props.diffFile}
			{onSelect}
			{selectState}
		/>
	</div>
</div>
