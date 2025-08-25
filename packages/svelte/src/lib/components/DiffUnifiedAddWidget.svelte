<script lang="ts">
	import type { DiffFile, SplitSide } from '@git-diff-view/core';
	import { addWidgetBGName, addWidgetColorName } from '$lib/utils/color.js';
	import { diffFontSizeName } from '$lib/utils/size.js';

	interface Props {
		index: number;
		side: SplitSide;
		className?: string;
		lineNumber: number;
		diffFile: DiffFile;
		onOpenAddWidget: (lineNumber: number, side: SplitSide) => void;
		onWidgetClick?: (lineNumber: number, side: SplitSide) => void;
	}

	let props: Props = $props();
</script>

<div
	class="diff-add-widget-wrapper invisible absolute left-[100%] translate-x-[-50%] select-none transition-transform hover:scale-110 group-hover:visible"
	style={`
		width: calc(var(${diffFontSizeName}) * 1.4);
		height: calc(var(${diffFontSizeName}) * 1.4);
		top: calc(var(${diffFontSizeName}) * 0.1);
	`}
>
	<button
		class="diff-add-widget z-[1] flex h-full w-full origin-center cursor-pointer items-center justify-center rounded-md text-[1.2em]"
		style={`
			color: var(${addWidgetColorName});
			background-color: var(${addWidgetBGName});
		`}
		onclick={() => {
			props.onOpenAddWidget(props.lineNumber, props.side);
			props.onWidgetClick?.(props.lineNumber, props.side);
		}}
	>
		+
	</button>
</div>
