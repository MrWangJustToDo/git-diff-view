<script lang="ts">
	import { getExtend } from '$lib/context/extend.js';
	import { getRenderExtend } from '$lib/context/renderExtend.js';
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

	const extendData = $derived.by(getExtend());

	const renderExtend = $derived.by(getRenderExtend());

	const lineSelector = $derived.by(() => `div[data-line="${props.lineNumber}-extend-content"]`);

	const lineWrapperSelector = $derived.by(() => `tr[data-line="${props.lineNumber}-extend"]`);

	const wrapperSelector = $derived.by(() =>
		props.side === SplitSide.old ? '.old-diff-table-wrapper' : '.new-diff-table-wrapper'
	);
	const oldLine = $derived.by(() => props.diffFile.getSplitLeftLine(props.index));

	const newLine = $derived.by(() => props.diffFile.getSplitRightLine(props.index));

	const enableExpand = $derived.by(() => props.diffFile.getExpandEnabled());

	const oldLineExtend = $derived.by(() => extendData?.oldFile?.[oldLine?.lineNumber || '']);

	const newLineExtend = $derived.by(() => extendData?.newFile?.[newLine?.lineNumber || '']);

	const currentItem = $derived.by(() => (props.side === SplitSide.old ? oldLine : newLine));

	const currentIsHidden = $derived.by(() => currentItem?.isHidden);

	const currentExtend = $derived.by(() =>
		props.side === SplitSide.old ? oldLineExtend : newLineExtend
	);

	const currentLineNumber = $derived.by(() =>
		props.side === SplitSide.old ? oldLine?.lineNumber : newLine?.lineNumber
	);

	const currentIsShow = $derived.by(() =>
		Boolean((oldLineExtend || newLineExtend) && (!currentIsHidden || enableExpand) && renderExtend)
	);

	const currentEnable = $derived.by(
		() => (props.side === SplitSide.old ? !!oldLineExtend : !!newLineExtend) && currentIsShow
	);

	const extendSide = $derived.by(
		() =>
			SplitSide[
				currentExtend ? props.side : props.side === SplitSide.new ? SplitSide.old : SplitSide.new
			]
	);

	useSyncHeight({
		selector: () => lineSelector,
		wrapper: () => lineWrapperSelector,
		side: () => extendSide,
		enable: () => currentIsShow
	});

	const width = $derived.by(
		useDomWidth({
			selector: () => wrapperSelector,
			enable: () => currentEnable
		})
	);
</script>

{#if currentIsShow}
	<tr
		data-line={`${props.lineNumber}-extend`}
		data-state="extend"
		data-side={SplitSide[props.side]}
		class="diff-line diff-line-extend"
	>
		{#if !!renderExtend && currentExtend}
			<td class={`diff-line-extend-${SplitSide[props.side]}-content p-0`} colspan={2}>
				<div
					data-line={`${props.lineNumber}-extend-content`}
					data-side={SplitSide[props.side]}
					class="diff-line-extend-wrapper sticky left-0 z-[1]"
					style={` width: ${width}px `}
				>
					{#if width > 0}
						{@render renderExtend?.({
							diffFile: props.diffFile,
							side: props.side,
							lineNumber: currentLineNumber || 0,
							data: currentExtend?.data,
							onUpdate: props.diffFile.notifyAll
						})}
					{/if}
				</div>
			</td>
		{:else}
			<td
				class={`diff-line-extend-${SplitSide[props.side]}-placeholder select-none p-0`}
				style={` background-color: var(${emptyBGName})`}
				colspan={2}
			>
				<div
					data-line={`${props.lineNumber}-extend-content`}
					data-side={SplitSide[props.side]}
				></div>
			</td>
		{/if}
	</tr>
{/if}
