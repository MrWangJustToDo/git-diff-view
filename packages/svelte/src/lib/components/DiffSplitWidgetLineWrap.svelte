<script lang="ts">
	import { getRenderWidget } from '$lib/context/renderWidget.js';
	import { getWidget } from '$lib/context/widget.js';
	import { SplitSide, type DiffFile } from '@git-diff-view/core';
	import { borderColorName, emptyBGName } from '$lib/utils/color.js';

	interface Props {
		index: number;
		diffFile: DiffFile;
		lineNumber: number;
	}

	let props: Props = $props();

	const renderWidget = $derived.by(getRenderWidget());

	const widget = $derived.by(getWidget());

	const oldLine = $derived.by(() => props.diffFile.getSplitLeftLine(props.index));

	const newLine = $derived.by(() => props.diffFile.getSplitRightLine(props.index));

	const oldLineWidget = $derived.by(
		() =>
			oldLine?.lineNumber &&
			widget?.side === SplitSide.old &&
			widget?.lineNumber === oldLine?.lineNumber
	);

	const newLineWidget = $derived.by(
		() =>
			newLine?.lineNumber &&
			widget?.side === SplitSide.new &&
			widget?.lineNumber === newLine?.lineNumber
	);

	const currentIsShow = $derived.by(
		() =>
			(!!oldLineWidget || !!newLineWidget) &&
			!oldLine?.isHidden &&
			!newLine?.isHidden &&
			!!renderWidget
	);

	const onCloseWidget = () => {
		widget.side = undefined;
		widget.lineNumber = undefined;
	};
</script>

{#if currentIsShow}
	<tr
		data-line={`${props.lineNumber}-widget`}
		data-state="widget"
		class="diff-line diff-line-widget"
	>
		{#if oldLineWidget && !!renderWidget}
			<td class="diff-line-widget-old-content p-0" colspan={2}>
				<div class="diff-line-widget-wrapper">
					{@render renderWidget({
						diffFile: props.diffFile,
						side: SplitSide.old,
						lineNumber: oldLine?.lineNumber || 0,
						onClose: onCloseWidget
					})}
				</div>
			</td>
		{:else}
			<td
				class="diff-line-widget-old-placeholder select-none p-0"
				style={`background-color: var(${emptyBGName})`}
				colspan={2}
			></td>
		{/if}
		{#if newLineWidget && !!renderWidget}
			<td
				class="diff-line-widget-new-content border-l-[1px] p-0"
				colspan={2}
				style={`border-left-color: var(${borderColorName}); border-left-style: solid `}
			>
				<div class="diff-line-widget-wrapper">
					{@render renderWidget?.({
						diffFile: props.diffFile,
						side: SplitSide.new,
						lineNumber: newLine?.lineNumber || 0,
						onClose: onCloseWidget
					})}
				</div></td
			>
		{:else}
			<td
				class="diff-line-widget-new-placeholder select-none border-l-[1px] p-0"
				style={`
					background-color: var(${emptyBGName});
					border-left-color: var(${borderColorName});
					border-left-style: solid;
				`}
				colspan={2}
			></td>
		{/if}
	</tr>
{/if}
