<script lang="ts">
	import { getRenderWidget } from '$lib/context/renderWidget.js';
	import { getWidget } from '$lib/context/widget.js';
	import { useDomWidth } from '$lib/hooks/useDomWidth.svelte.js';
	import { useSyncHeight } from '$lib/hooks/useSyncHeight.svelte.js';
	import { SplitSide, type DiffFile } from '@git-diff-view/core';
	import { emptyBGName } from '$lib/utils/color.js';

	interface Props {
		index: number;
		side: SplitSide;
		diffFile: DiffFile;
		lineNumber: number;
	}

	let props: Props = $props();

	let lineDom = $state<HTMLElement | null>(null);

	const renderWidget = $derived.by(getRenderWidget());

	const widget = $derived.by(getWidget());

	const oldLine = $derived.by(() => props.diffFile.getSplitLeftLine(props.index));

	const newLine = $derived.by(() => props.diffFile.getSplitRightLine(props.index));

	const oldLineWidget = $derived.by(
		() =>
			!!oldLine?.lineNumber &&
			widget?.side === SplitSide.old &&
			widget?.lineNumber === oldLine?.lineNumber
	);

	const newLineWidget = $derived.by(
		() =>
			!!newLine?.lineNumber &&
			widget?.side === SplitSide.new &&
			widget?.lineNumber === newLine?.lineNumber
	);

	const currentLine = $derived.by(() => (props.side === SplitSide.old ? oldLine : newLine));

	const currentIsHidden = $derived.by(() => currentLine?.isHidden);

	const lineSelector = $derived.by(() => `div[data-line="${props.lineNumber}-widget-content"]`);

	const lineWrapperSelector = $derived.by(() => `tr[data-line="${props.lineNumber}-widget"]`);

	const wrapperSelector = $derived.by(() =>
		props.side === SplitSide.old ? '.old-diff-table-wrapper' : '.new-diff-table-wrapper'
	);

	const currentWidget = $derived.by(() =>
		props.side === SplitSide.old ? oldLineWidget : newLineWidget
	);

	const observeSide = $derived.by(
		() =>
			SplitSide[
				currentWidget ? props.side : props.side === SplitSide.old ? SplitSide.new : SplitSide.old
			]
	);

	const currentIsShow = $derived.by(
		() => (!!oldLineWidget || !!newLineWidget) && !currentIsHidden && !!renderWidget
	);

	const currentEnable = $derived.by(() => currentWidget && !!currentIsShow);

	const onCloseWidget = () => {
		widget.side = undefined;
		widget.lineNumber = undefined;
	};

	useSyncHeight({
		selector: () => lineSelector,
		wrapper: () => lineWrapperSelector,
		side: () => observeSide,
		enable: () => Boolean(currentIsShow && lineDom)
	});

	const width = $derived.by(
		useDomWidth({
			selector: () => wrapperSelector,
			enable: () => Boolean(currentEnable && lineDom)
		})
	);
</script>

{#if currentIsShow}
	<tr
		data-line={`${props.lineNumber}-widget`}
		data-state="widget"
		data-side={SplitSide[props.side]}
		class="diff-line diff-line-widget"
		{@attach (l) => (lineDom = l)}
	>
		{#if currentWidget}
			<td class={`diff-line-widget-${SplitSide[props.side]}-content p-0`} colspan={2}>
				<div
					data-line={`${props.lineNumber}-widget-content`}
					data-side={SplitSide[props.side]}
					class="diff-line-widget-wrapper sticky left-0 z-[1]"
					style={` width: ${width}px `}
				>
					{#if width > 0}
						{@render renderWidget({
							diffFile: props.diffFile,
							side: props.side,
							lineNumber: currentLine?.lineNumber || 0,
							onClose: onCloseWidget
						})}
					{/if}
				</div>
			</td>
		{:else}
			<td
				class={`diff-line-widget-${SplitSide[props.side]}-placeholder select-none p-0`}
				style={`background-color: var(${emptyBGName})`}
				colspan={2}
			>
				<div
					data-line={`${props.lineNumber}-widget-content`}
					data-side={SplitSide[props.side]}
				></div>
			</td>
		{/if}
	</tr>
{/if}
