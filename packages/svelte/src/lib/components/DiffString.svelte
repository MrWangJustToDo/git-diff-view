<script lang="ts">
	import {
		getPlainDiffTemplate,
		getPlainLineTemplate,
		type DiffLine,
		type File
	} from '@git-diff-view/core';

	import DiffNoNewLine from './DiffNoNewLine.svelte';
	import {
		addContentHighlightBGName,
		delContentHighlightBGName,
		diffFontSizeName,
		getSymbol,
		NewLineSymbol
	} from '@git-diff-view/utils';

	interface Props {
		rawLine: string;
		diffLine?: DiffLine;
		plainLine?: File['plainFile'][number];
		operator?: 'add' | 'del';
		enableWrap?: boolean;
		enableTemplate?: boolean;
	}

	let props: Props = $props();

	let isNewLineSymbolChanged = () => props.diffLine?.changes?.newLineSymbol;

	const range = () => props.diffLine?.changes?.range;

	const str1 = () => props.rawLine.slice(0, range()?.location);

	const str2 = () => {
		const r = range();
		return r ? props.rawLine.slice(r.location, r.location + r.length) : '';
	};

	const str3 = () => {
		const r = range();
		return r ? props.rawLine.slice(r.location + r.length) : '';
	};

	const isLast = () => str2().includes('\n');

	const _str2 = () => (isLast() ? str2().replace('\n', '').replace('\r', '') : str2);

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
			{#if isNewLineSymbolChanged() === NewLineSymbol.NEWLINE}
				<span
					data-no-newline-at-end-of-file-symbol
					class={props.enableWrap
						? 'block !text-red-500'
						: 'inline-block align-middle !text-red-500'}
					style={`
						width: var(${diffFontSizeName}),
						height: var(${diffFontSizeName})
					`}
				>
					<DiffNoNewLine />
				</span>
			{/if}
		</span>
	{:else}
		<span class="diff-line-content-raw">
			<span
				data-range-start={range()?.location}
				data-range-end={range() ? range()!.location + range()!.length : 0}
			>
				{str1()}
				<span
					data-diff-highlight
					class="rounded-[0.2em]"
					style={`
                background-color:
                  operator === "add" ? var(${addContentHighlightBGName}) : var(${delContentHighlightBGName}),
              `}
				>
					{#if isLast()}
						{_str2()}
						<span data-newline-symbol>{getSymbol(isNewLineSymbolChanged())}</span>
					{:else}
						{str2()}
					{/if}
				</span>
				{str3}
			</span>
			{#if isNewLineSymbolChanged() === NewLineSymbol.NEWLINE}
				<span
					data-no-newline-at-end-of-file-symbol
					class={props.enableWrap
						? 'block !text-red-500'
						: 'inline-block align-middle !text-red-500'}
					style={`
						width: var(${diffFontSizeName}),
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
