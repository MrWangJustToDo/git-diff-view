<script lang="ts">
	import { getEnableWrap } from '$lib/context/enableWrap.js';
	import { getExtend } from '$lib/context/extend.js';
	import { getRenderExtend } from '$lib/context/renderExtend.js';
	import { useDomWidth } from '$lib/hooks/useDomWidth.svelte.js';
	import { SplitSide, type DiffFile } from '@git-diff-view/core';

	interface Props {
		index: number;
		diffFile: DiffFile;
		lineNumber: number;
	}

	let props: Props = $props();

	const extendData = $derived.by(getExtend());

	const enableWrap = $derived.by(getEnableWrap());

	const renderExtend = $derived.by(getRenderExtend());

	const unifiedItem = $derived.by(() => props.diffFile.getUnifiedLine(props.index));

	const oldExtend = $derived.by(() => extendData?.oldFile?.[unifiedItem?.oldLineNumber || -1]);

	const newExtend = $derived.by(() => extendData?.newFile?.[unifiedItem?.newLineNumber || -1]);

	const currentIsHidden = $derived.by(() => unifiedItem.isHidden);

	const currentIsShow = $derived.by(() =>
		Boolean((oldExtend || newExtend) && currentIsHidden && renderExtend)
	);

	const width = $derived.by(
		useDomWidth({
			selector: () => '.unified-diff-table-wrapper',
			enable: () => currentIsShow
		})
	);
</script>

{#if currentIsShow}
	<tr
		data-line={`${props.lineNumber}-extend`}
		data-state="extend"
		class="diff-line diff-line-extend"
	>
		<td class="diff-line-extend-content p-0 align-top" colspan={2}>
			<div class="diff-line-extend-wrapper sticky left-0 z-[1]" style={`width: ${width}px `}>
				{#if (enableWrap || width > 0) && oldExtend && !!renderExtend}
					{@render renderExtend({
						diffFile: props.diffFile,
						side: SplitSide.old,
						data: oldExtend?.data,
						lineNumber: unifiedItem?.oldLineNumber || 0,
						onUpdate: () => props.diffFile.notifyAll()
					})}
				{/if}
				{#if (enableWrap || width > 0) && newExtend && !!renderExtend}
					{@render renderExtend({
						diffFile: props.diffFile,
						side: SplitSide.new,
						data: newExtend?.data,
						lineNumber: unifiedItem?.newLineNumber || 0,
						onUpdate: () => props.diffFile.notifyAll()
					})}
				{/if}
			</div>
		</td>
	</tr>
{/if}
