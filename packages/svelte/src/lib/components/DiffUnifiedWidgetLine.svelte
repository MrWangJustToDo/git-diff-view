<script lang="ts">
	import { getEnableWrap } from '$lib/context/enableWrap.js';
	import { getRenderWidget } from '$lib/context/renderWidget.js';
	import { getWidget } from '$lib/context/widget.js';
	import { useDomWidth } from '$lib/hooks/useDomWidth.svelte.js';
	import { SplitSide, type DiffFile } from '@git-diff-view/core';

	interface Props {
		index: number;
		diffFile: DiffFile;
		lineNumber: number;
	}

	let props: Props = $props();

	const widget = $derived.by(getWidget());

	const enableWrap = $derived.by(getEnableWrap());

	const renderWidget = $derived.by(getRenderWidget());

	const unifiedItem = $derived.by(() => props.diffFile.getUnifiedLine(props.index));

	const oldWidget = $derived.by(
		() =>
			unifiedItem?.oldLineNumber &&
			widget?.side === SplitSide.old &&
			widget?.lineNumber === unifiedItem?.oldLineNumber
	);

	const newWidget = $derived.by(
		() =>
			unifiedItem?.newLineNumber &&
			widget?.side === SplitSide.new &&
			widget?.lineNumber === unifiedItem?.newLineNumber
	);

	const currentIsHidden = $derived.by(() => unifiedItem?.isHidden);

	const currentIsShow = $derived.by(() =>
		Boolean((oldWidget || newWidget) && !currentIsHidden && renderWidget)
	);

	const onCloseWidget = () => {
		widget.side = undefined;
		widget.lineNumber = undefined;
	};

	const width = $derived.by(
		useDomWidth({
			selector: () => `.unified-diff-table-wrapper`,
			enable: () => currentIsShow && !enableWrap
		})
	);
</script>

{#if currentIsShow}
	<tr
		data-line={`${props.lineNumber}-widget`}
		data-state="widget"
		class="diff-line diff-line-widget"
	>
		<td class="diff-line-widget-content p-0" colspan={2}>
			<div class="diff-line-widget-wrapper sticky left-0 z-[1]" style={`width: ${width}px`}>
				{#if (enableWrap || width > 0) && oldWidget}
					{@render renderWidget({
						diffFile: props.diffFile,
						side: SplitSide.old,
						lineNumber: unifiedItem?.oldLineNumber || 0,
						onClose: onCloseWidget
					})}
				{/if}
				{#if (enableWrap || width > 0) && newWidget}
					{@render renderWidget?.({
						diffFile: props.diffFile,
						side: SplitSide.new,
						lineNumber: unifiedItem?.newLineNumber || 0,
						onClose: onCloseWidget
					})}
				{/if}
			</div>
		</td>
	</tr>
{/if}
