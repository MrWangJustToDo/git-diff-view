<script lang="ts">
	import {
		getPlainDiffTemplate,
		getPlainLineTemplate,
		type DiffLine,
		type File
	} from '@git-diff-view/core';

	import DiffNoNewLine from './DiffNoNewLine.svelte';
	import { diffFontSizeName } from '$lib/utils/size.js';
	import { NewLineSymbol } from '$lib/utils/symbol.js';

	interface Props {
		rawLine: string;
		diffLine?: DiffLine;
		plainLine?: File['plainFile'][number];
		operator?: 'add' | 'del';
		enableWrap?: boolean;
	}

	let props: Props = $props();

	const initTemplate = () => {
		if (props.diffLine?.changes?.hasLineChange) {
			if (props.diffLine?.plainTemplate && typeof getPlainDiffTemplate === 'function') {
				getPlainDiffTemplate({
					diffLine: props.diffLine,
					rawLine: props.rawLine,
					operator: props.operator || 'add'
				});
			}
		} else {
			if (props.plainLine && !props.plainLine?.template) {
				props.plainLine.template = getPlainLineTemplate(props.plainLine.value);
			}
		}
	};

	initTemplate();
</script>

{#if props.diffLine?.changes?.hasLineChange}
	{#if props.diffLine?.plainTemplate}
		<span class="diff-line-content-raw">
			<span data-template>
				{@html props.diffLine.plainTemplate}
			</span>{#if props.diffLine.changes.newLineSymbol === NewLineSymbol.NEWLINE}
				<span
					data-no-newline-at-end-of-file-symbol
					class={props.enableWrap
						? 'block !text-red-500'
						: 'inline-block align-middle !text-red-500'}
					style={`
						width: var(${diffFontSizeName});
						height: var(${diffFontSizeName})
					`}
				>
					<DiffNoNewLine />
				</span>
			{/if}
		</span>
	{:else}
		<span class="diff-line-content-raw">{props.rawLine}</span>
	{/if}
{:else if props.plainLine?.template}
	<span class="diff-line-content-raw">
		<span data-template>
			{@html props.plainLine.template}
		</span>
	</span>
{:else}
	<span class="diff-line-content-raw">{props.rawLine}</span>
{/if}
