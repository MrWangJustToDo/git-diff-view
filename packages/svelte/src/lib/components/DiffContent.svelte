<script lang="ts">
	import { DiffLineType, type DiffFile, type DiffLine, type File } from '@git-diff-view/core';
	import DiffSyntax from './DiffSyntax.svelte';
	import DiffString from './DiffString.svelte';

	interface Props {
		rawLine: string;
		plainLine?: File['plainFile'][number];
		syntaxLine?: File['syntaxFile'][number];
		diffLine?: DiffLine;
		diffFile: DiffFile;
		enableWrap: boolean;
		enableHighlight: boolean;
	}

	let props: Props = $props();

	const isAdded = $derived.by(() => props.diffLine?.type === DiffLineType.Add);

	const isDelete = $derived.by(() => props.diffLine?.type === DiffLineType.Delete);

	const isMaxLineLengthToIgnoreSyntax = $derived.by(() => {
		return props.syntaxLine && props.syntaxLine?.nodeList?.length > 150;
	});

	const isEnableTemplate = $derived.by(() => props.diffFile.getIsEnableTemplate());
</script>

<div
	class="diff-line-content-item pl-[2.0em]"
	style={`
		white-space: ${props.enableWrap ? 'pre-wrap' : 'pre'};
		word-break: ${props.enableWrap ? 'break-all' : 'initial'}
	`}
>
	<span
		data-operator={isAdded ? '+' : isDelete ? '-' : undefined}
		class="diff-line-content-operator ml-[-1.5em] inline-block w-[1.5em] select-none indent-[0.2em]"
	>
		{isAdded ? '+' : isDelete ? '-' : ' '}
	</span>
	{#if props.enableHighlight && props.syntaxLine && !isMaxLineLengthToIgnoreSyntax}
		<DiffSyntax
			operator={isAdded ? 'add' : isDelete ? 'del' : undefined}
			rawLine={props.rawLine}
			diffLine={props.diffLine}
			syntaxLine={props.syntaxLine}
			enableWrap={props.enableWrap}
			enableTemplate={isEnableTemplate}
		/>
	{:else}
		<DiffString
			operator={isAdded ? 'add' : isDelete ? 'del' : undefined}
			rawLine={props.rawLine}
			diffLine={props.diffLine}
			plainLine={props.plainLine}
			enableWrap={props.enableWrap}
			enableTemplate={isEnableTemplate}
		/>
	{/if}
</div>
