<script lang="ts">
	import {
		getSyntaxDiffTemplate,
		getSyntaxLineTemplate,
		type DiffLine,
		type File
	} from '@git-diff-view/core';
	import DiffString from './DiffString.svelte';
	import { diffFontSizeName } from '$lib/utils/size.js';
	import { NewLineSymbol } from '$lib/utils/symbol.js';
	import DiffNoNewLine from './DiffNoNewLine.svelte';

	interface Props {
		rawLine: string;
		diffLine?: DiffLine;
		syntaxLine?: File['syntaxFile'][number];
		operator?: 'add' | 'del';
		enableWrap?: boolean;
	}

	let props: Props = $props();

	const initTemplate = () => {
		if (props.diffLine?.changes?.hasLineChange) {
			if (
				props.syntaxLine &&
				props.diffLine &&
				!props.diffLine?.syntaxTemplate &&
				typeof getSyntaxDiffTemplate === 'function'
			) {
				getSyntaxDiffTemplate({
					diffLine: props.diffLine,
					syntaxLine: props.syntaxLine,
					operator: props.operator || 'add'
				});
			}
		} else {
			if (props.syntaxLine && !props.syntaxLine.template) {
				props.syntaxLine.template = getSyntaxLineTemplate(props.syntaxLine);
			}
		}
	};

	initTemplate();
</script>

{#if !props.syntaxLine}
	<DiffString
		rawLine={props.rawLine}
		diffLine={props.diffLine}
		operator={props.operator}
		enableWrap={props.enableWrap}
	/>
{:else if props.diffLine?.changes?.hasLineChange}
	{#if props.diffLine?.syntaxTemplate}
		<span class="diff-line-syntax-raw">
			<span data-template>
				{@html props.diffLine.syntaxTemplate}
			</span>{#if props.diffLine.changes.newLineSymbol === NewLineSymbol.NEWLINE}
				<span
					data-no-newline-at-end-of-file-symbol
					class={props.enableWrap
						? 'block !text-red-500'
						: 'inline-block align-middle !text-red-500'}
					style={`
                width: var(${diffFontSizeName});
                height: var(${diffFontSizeName});
              `}
				>
					<DiffNoNewLine />
				</span>
			{/if}
		</span>
	{:else}
		<span class="diff-line-syntax-raw">
			{#each props.syntaxLine.nodeList as { node, wrapper }}
				<span
					data-start={node.startIndex}
					data-end={node.endIndex}
					class={wrapper?.properties?.className?.join(' ')}
					style={wrapper?.properties?.style}
				>
					{node.value}
				</span>
			{/each}
		</span>
	{/if}
{:else if props.syntaxLine.template}
	<span class="diff-line-syntax-raw">
		<span data-template>
			{@html props.syntaxLine.template}
		</span>
	</span>
{:else}
	<span class="diff-line-syntax-raw">
		{#each props.syntaxLine.nodeList as { node, wrapper }}
			<span
				data-start={node.startIndex}
				data-end={node.endIndex}
				class={wrapper?.properties?.className?.join(' ')}
				style={wrapper?.properties?.style}
			>
				{node.value}
			</span>
		{/each}
	</span>
{/if}
