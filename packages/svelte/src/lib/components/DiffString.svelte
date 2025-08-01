<script lang="ts">
	import {
		getPlainDiffTemplate,
		getPlainLineTemplate,
		type DiffLine,
		type File
	} from '@git-diff-view/core';

	import DiffNoNewLine from './DiffNoNewLine.svelte';
	import { addContentHighlightBGName, delContentHighlightBGName } from '$lib/utils/color.js';
	import { diffFontSizeName } from '$lib/utils/size.js';
	import { getSymbol, NewLineSymbol } from '$lib/utils/symbol.js';

	interface Props {
		rawLine: string;
		diffLine?: DiffLine;
		plainLine?: File['plainFile'][number];
		operator?: 'add' | 'del';
		enableWrap?: boolean;
		enableTemplate?: boolean;
	}

	let props: Props = $props();

	const initTemplate = () => {
		if (props.diffLine?.changes?.hasLineChange) {
			if (
				props.enableTemplate &&
				props.diffLine?.plainTemplate &&
				typeof getPlainDiffTemplate === 'function'
			) {
				getPlainDiffTemplate({
					diffLine: props.diffLine,
					rawLine: props.rawLine,
					operator: props.operator || 'add'
				});
			}
		} else {
			if (props.enableTemplate && props.plainLine && !props.plainLine?.template) {
				props.plainLine.template = getPlainLineTemplate(props.plainLine.value);
			}
		}
	};

	initTemplate();
</script>

{#if props.diffLine?.changes?.hasLineChange}
	{#if props.enableTemplate && props.diffLine?.plainTemplate}
		<span class="diff-line-content-raw">
			<span data-template>
				{@html props.diffLine.plainTemplate}
			</span>
			{#if props.diffLine.changes.newLineSymbol === NewLineSymbol.NEWLINE}
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
		{@const range = props.diffLine.changes.range}
		{@const str1 = props.rawLine.slice(0, range.location)}
		{@const str2 = props.rawLine.slice(range.location, range.location + range.length)}
		{@const str3 = props.rawLine.slice(range.location + range.length)}
		{@const isLast = str2.includes('\n')}
		{@const _str2 = isLast ? str2.replace('\n', '').replace('\r', '') : str2}
		<span class="diff-line-content-raw">
			<span data-range-start={range.location} data-range-end={range.location + range.length}>
				{str1}
				<span
					data-diff-highlight
					class="rounded-[0.2em]"
					style={`
                background-color:
                  ${props.operator === 'add' ? `var(${addContentHighlightBGName})` : `var(${delContentHighlightBGName})`},
              `}
				>
					{#if isLast}
						{_str2}
						<span data-newline-symbol>{getSymbol(props.diffLine.changes.newLineSymbol)}</span>
					{:else}
						{str2}
					{/if}
				</span>
				{str3}
			</span>
			{#if props.diffLine.changes.newLineSymbol === NewLineSymbol.NEWLINE}
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
	{/if}
{:else if props.enableTemplate && props.plainLine?.template}
	<span class="diff-line-content-raw">
		<span data-template>
			{@html props.plainLine.template}
		</span>
	</span>
{:else}
	<span class="diff-line-content-raw">{props.rawLine}</span>
{/if}
