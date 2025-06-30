<script lang="ts">
	import { getExtend } from '$lib/context/extend.js';
	import { getRenderExtend } from '$lib/context/renderExtend.js';
	import { SplitSide, type DiffFile } from '@git-diff-view/core';
	import { borderColorName, emptyBGName } from '@git-diff-view/utils';

	interface Props {
		index: number;
		diffFile: DiffFile;
		lineNumber: number;
	}

	let props: Props = $props();

	const extendData = $derived.by(getExtend());

	const renderExtend = $derived.by(getRenderExtend());

	const oldLine = $derived.by(() => props.diffFile.getSplitLeftLine(props.index));

	const newLine = $derived.by(() => props.diffFile.getSplitRightLine(props.index));

	const enableExpand = $derived.by(() => props.diffFile.getExpandEnabled());

	const oldLineExtend = $derived.by(() => extendData?.oldFile?.[oldLine?.lineNumber || '']);

	const newLineExtend = $derived.by(() => extendData?.newFile?.[newLine?.lineNumber || '']);

	const currentIsShow = $derived.by(() =>
		Boolean(
			(oldLineExtend || newLineExtend) &&
				((!oldLine?.isHidden && !newLine.isHidden) || enableExpand) &&
				renderExtend
		)
	);
</script>

{#if currentIsShow}
	<tr
		data-line={`${props.lineNumber}-extend`}
		data-state="extend"
		class="diff-line diff-line-extend"
	>
		{#if !!renderExtend && oldLineExtend}
			<td class="diff-line-extend-old-content p-0" colspan={2}>
				<div class="diff-line-extend-wrapper">
					{@render renderExtend({
						diffFile: props.diffFile,
						side: SplitSide.old,
						lineNumber: oldLine?.lineNumber || 0,
						data: oldLineExtend?.data,
						onUpdate: props.diffFile.notifyAll
					})}
				</div>
			</td>
		{:else}
			<td
				class="diff-line-extend-old-placeholder select-none p-0"
				style={`background-color: var(${emptyBGName})`}
				colspan={2}
			></td>
		{/if}
		{#if !!renderExtend && newLineExtend}
			<td
				class="diff-line-extend-new-content border-l-[1px] p-0"
				colspan={2}
				style={`border-left-color: var(${borderColorName}), border-left-style: solid `}
			>
				<div class="diff-line-extend-wrapper">
					{@render renderExtend({
						diffFile: props.diffFile,
						side: SplitSide.new,
						lineNumber: newLine?.lineNumber || 0,
						data: newLineExtend?.data,
						onUpdate: props.diffFile.notifyAll
					})}
				</div>
			</td>
		{:else}
			<td
				class="diff-line-extend-new-placeholder select-none border-l-[1px] p-0"
				style={`
					background-color: var(${emptyBGName}),
					border-left-color: var(${borderColorName}),
					border-left-style: solid
				`}
				colspan={2}
			></td>
		{/if}
	</tr>
{/if}
