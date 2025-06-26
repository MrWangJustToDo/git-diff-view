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

	let change = () => props.diffLine?.changes;

	const getRange = () => props.diffLine?.changes?.range;

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

	const isNewLineSymbolChanged = () => props.diffLine?.changes?.newLineSymbol;

	initTemplate();

	const getIndex1 = (node: File['syntaxFile'][number]['nodeList'][number]['node']) => {
		const range = getRange();
		if (!range) return 0;
		return range.location - node.startIndex;
	};

	const getIndex2 = (node: File['syntaxFile'][number]['nodeList'][number]['node']) => {
		const i1 = getIndex1(node);
		return i1 < 0 ? 0 : i1;
	};

	const getStr1 = (node: File['syntaxFile'][number]['nodeList'][number]['node']) => {
		const index2 = getIndex2(node);
		return node?.value?.substring(0, index2);
	};

	const getStr2 = (node: File['syntaxFile'][number]['nodeList'][number]['node']) => {
		const index1 = getIndex1(node);
		const index2 = getIndex2(node);
		return node?.value?.substring(index2, index1 + getRange()!.length);
	};

	const getStr3 = (node: File['syntaxFile'][number]['nodeList'][number]['node']) => {
		const index1 = getIndex1(node);
		return node?.value?.substring(index1 + getRange()!.length);
	};

	const isStart = (str1: string, node: File['syntaxFile'][number]['nodeList'][number]['node']) => {
		return str1.length || getRange()?.location === node.startIndex;
	};

	const isEnd = (str3: string, node: File['syntaxFile'][number]['nodeList'][number]['node']) => {
		return str3.length || getRange()!.location + getRange()!.length - 1 === node.endIndex;
	};

	const isLast = (str2: string) => str2.includes('\n');

	const get_Str2 = (isLast: boolean, str2: string) =>
		isLast ? str2.replace('\n', '').replace('\r', '') : str2;
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
			{#if isNewLineSymbolChanged() === NewLineSymbol.NEWLINE}
				<span
					data-no-newline-at-end-of-file-symbol
					class={props.enableWrap
						? 'block !text-red-500'
						: 'inline-block align-middle !text-red-500'}
					style={`
                width: var(${diffFontSizeName}),
                height: var(${diffFontSizeName}),
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
					{#if node.endIndex < getRange()!.location || getRange()!.location + getRange()!.length < node.startIndex}
						<span
							data-start={node.startIndex}
							data-end={node.endIndex}
							class={wrapper?.properties?.className?.join(' ')}
							style={wrapper?.properties?.style}
						>
							{node.value}
						</span>
					{:else}
						<span
							data-start={node.startIndex}
							data-end={node.endIndex}
							class={wrapper?.properties?.className?.join(' ')}
							style={wrapper?.properties?.style}
						>
							{getStr1(node)}
							<span
								data-diff-highlight
								style={`
                        background-color:
                          ${props.operator === 'add' ? `var(${addContentHighlightBGName})` : `var(${delContentHighlightBGName})`},
                        border-top-left-radius: ${isStart(getStr1(node), node) ? '0.2em' : undefined},
                        border-bottom-left-radius: ${isStart(getStr1(node), node) ? '0.2em' : undefined},
                        border-top-right-radius: ${isEnd(getStr3(node), node) || isLast(getStr2(node)) ? '0.2em' : undefined},
                        border-bottom-right-radius: ${isEnd(getStr3(node), node) || isLast(getStr2(node)) ? '0.2em' : undefined},
                      `}
							>
								{#if isLast(getStr2(node))}
									{get_Str2(isLast(getStr2(node)), getStr2(node))}
									<span data-newline-symbol>{getSymbol(isNewLineSymbolChanged())}</span>
								{:else}
									{getStr2(node)}
								{/if}
							</span>
							{getStr3(node)}
						</span>
					{/if}
				{/each}
			</span>
			{#if isNewLineSymbolChanged() === NewLineSymbol.NEWLINE}
				<span
					data-no-newline-at-end-of-file-symbol
					class={props.enableWrap
						? 'block !text-red-500'
						: 'inline-block align-middle !text-red-500'}
					style={`
								width: var(${diffFontSizeName}),
								height: var(${diffFontSizeName}),
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
