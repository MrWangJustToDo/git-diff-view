<script lang="ts">
	import {
		getSyntaxDiffTemplate,
		getSyntaxLineTemplate,
		type DiffLine,
		type File
	} from '@git-diff-view/core';
	import DiffString from './DiffString.svelte';
	import {
		addContentHighlightBGName,
		delContentHighlightBGName,
		diffFontSizeName,
		getSymbol,
		NewLineSymbol
	} from '@git-diff-view/utils';
	import DiffNoNewLine from './DiffNoNewLine.svelte';

	interface Props {
		rawLine: string;
		diffLine?: DiffLine;
		syntaxLine?: File['syntaxFile'][number];
		operator?: 'add' | 'del';
		enableWrap?: boolean;
		enableTemplate?: boolean;
	}

	let props: Props = $props();

	const initTemplate = () => {
		if (props.diffLine?.changes?.hasLineChange) {
			if (
				props.enableTemplate &&
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
			if (props.enableTemplate && props.syntaxLine && !props.syntaxLine.template) {
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
		enableTemplate={props.enableTemplate}
	/>
{:else if props.diffLine?.changes?.hasLineChange}
	{#if props.enableTemplate && props.diffLine?.syntaxTemplate}
		<span class="diff-line-syntax-raw">
			<span data-template>
				{@html props.diffLine.syntaxTemplate}
			</span>
			{#if props.diffLine.changes.newLineSymbol === NewLineSymbol.NEWLINE}
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
			<span
				data-range-start={props.diffLine.changes.range.location}
				data-range-end={props.diffLine.changes.range.location + props.diffLine.changes.range.length}
			>
				{#each props.syntaxLine.nodeList as { node, wrapper }}
					{@const range = props.diffLine.changes.range}
					{#if node.endIndex < range.location || range.location + range.length < node.startIndex}
						<span
							data-start={node.startIndex}
							data-end={node.endIndex}
							class={wrapper?.properties?.className?.join(' ')}
							style={wrapper?.properties?.style}
						>
							{node.value}
						</span>
					{:else}
						{@const index1 = range.location - node.startIndex}
						{@const index2 = index1 < 0 ? 0 : index1}
						{@const str1 = node.value.substring(0, index2)}
						{@const str2 = node.value.substring(index2, index1 + range.length)}
						{@const str3 = node.value.substring(index1 + range.length)}
						{@const isStart = str1.length || range.location === node.startIndex}
						{@const isEnd = str3.length || range.location + range.length - 1 === node.endIndex}
						{@const isLast = str2.includes('\n')}
						{@const _str2 = isLast ? str2.replace('\n', '').replace('\r', '') : str2}
						<span
							data-start={node.startIndex}
							data-end={node.endIndex}
							class={wrapper?.properties?.className?.join(' ')}
							style={wrapper?.properties?.style}
						>
							{str1}
							<span
								data-diff-highlight
								style={`
                        background-color:
                          ${props.operator === 'add' ? `var(${addContentHighlightBGName})` : `var(${delContentHighlightBGName})`};
                        border-top-left-radius: ${isStart ? '0.2em' : undefined};
                        border-bottom-left-radius: ${isStart ? '0.2em' : undefined};
                        border-top-right-radius: ${isEnd || isLast ? '0.2em' : undefined};
                        border-bottom-right-radius: ${isEnd || isLast ? '0.2em' : undefined};
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
					{/if}
				{/each}
			</span>
			{#if props.diffLine.changes.newLineSymbol === NewLineSymbol.NEWLINE}
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
	{/if}
{:else if props.enableTemplate && props.syntaxLine.template}
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
