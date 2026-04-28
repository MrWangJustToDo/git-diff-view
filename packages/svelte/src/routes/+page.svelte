<script lang="ts">
	import { DiffFile, DiffModeEnum, DiffView, DiffViewWithMultiSelect, SplitSide } from '@git-diff-view/svelte';

	import * as data from '../data.js';
	import type { MessageData } from '../worker.js';
	import type { MultiSelectExtendData } from '@git-diff-view/svelte';

	const worker =
		typeof Worker !== 'undefined'
			? new Worker(new URL('../worker.ts', import.meta.url), { type: 'module' })
			: null;

	type Key = 'a' | 'b' | 'c' | 'd' | 'e';

	let key = $state<Key>('b');

	let diffFile = $state<DiffFile | null>(null);

	let highlight = $state<boolean>(true);

	let wrap = $state<boolean>(false);

	let dark = $state<boolean>(false);

	let mode = $state<DiffModeEnum>(DiffModeEnum.Split);

	const toggleHighlight = () => (highlight = !highlight);

	const toggleTheme = () => (dark = !dark);

	const toggleWrap = () => (wrap = !wrap);

	const toggleMode = () =>
		(mode = mode === DiffModeEnum.Split ? DiffModeEnum.Unified : DiffModeEnum.Split);

	let v = $state('');

	let extend = $state({});

	worker?.addEventListener('message', (e: MessageEvent<MessageData>) => {
		const { data, bundle } = e.data;
		const instance = DiffFile.createInstance(data || {}, bundle);
		// instance.disableTemplate();
		diffFile = instance;
	});

	$effect(() => {
		worker?.postMessage({
			key,
			data: data[key]
		});
	});

	$effect(() => {
		if (diffFile) {
			extend = { oldFile: {}, newFile: {} };
			multiSelectExtend = { oldFile: {}, newFile: {} };
		}
	});

	let showMultiSelect = $state(false);
	let multiSelectExtend = $state<MultiSelectExtendData<string[]>>({ oldFile: {}, newFile: {} });
	let multiSelectV = $state('');
	let multiSelectWidget = $state<{
		lineNumber: number;
		fromLineNumber: number;
		side: SplitSide;
	} | null>(null);
</script>

<div class="m-auto mb-[1em] mt-[1em] w-[90%]">
	<h2 class="text-[24px]">A Svelte component to show the file diff</h2>
	<br />
	<p>
		Select a file to show the diff: &nbsp;
		<select class="rounded-sm border" bind:value={key}>
			<option value="a">diff 1</option>
			<option value="b">diff 2</option>
			<option value="c">diff 3</option>
			<option value="d">diff 4</option>
			<option value="e">diff 5</option>
		</select>
	</p>
</div>

<div class="m-auto mb-[1em] w-[90%] text-right">
	<div class="inline-flex gap-x-4">
		<button
			class="rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold leading-5 text-white hover:bg-sky-700"
			onclick={toggleWrap}
		>
			{wrap ? 'Toggle to nowrap' : 'Toggle to wrap'}
		</button>
		<button
			class="rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold leading-5 text-white hover:bg-sky-700"
			onclick={toggleHighlight}
		>
			{highlight ? 'Toggle to disable highlight' : 'Toggle to enable highlight'}
		</button>
		<button
			class="rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold leading-5 text-white hover:bg-sky-700"
			onclick={toggleTheme}
		>
			{dark ? 'Toggle to light theme' : 'Toggle to dark theme'}
		</button>
		<button
			class="rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold leading-5 text-white hover:bg-sky-700"
			onclick={toggleMode}
		>
			{mode === DiffModeEnum.Split ? 'Toggle to UnifiedMode' : 'Toggle to SplitMode'}
		</button>
	</div>
</div>

<div
	class="m-auto mb-[5em] w-[90%] overflow-hidden rounded-[5px] border border-solid border-[#e1e1e1]"
>
	{#snippet renderWidgetLine({
		side,
		lineNumber,
		onClose
	}: {
		side: SplitSide;
		lineNumber: number;
		onClose: () => void;
	})}
		<div class="flex w-full flex-col border px-[4px] py-[8px]">
			<textarea class="min-h-[80px] w-full border p-[2px]" bind:value={v}></textarea>
			<div class="m-[5px] mt-[0.8em] text-right">
				<div class="inline-flex justify-end gap-x-[12px]">
					<button class="rounded-[4px] border px-[12px] py-[6px]" onclick={onClose}>
						cancel
					</button>
					<button
						class="rounded-[4px] border px-[12px] py-[6px]"
						onclick={() => {
							if (v.length) {
								const _side = side === SplitSide.old ? 'oldFile' : 'newFile';
								extend = {
									...extend,
									[_side]: {
										// @ts-expect-error - dynamic key access
										...extend?.[_side],
										[lineNumber]: { data: v }
									}
								};
								onClose();
							}
						}}
					>
						submit
					</button>
				</div>
			</div>
		</div>
	{/snippet}
	{#snippet renderExtendLine({ data }: { data: string })}
		<div class="flex border bg-slate-400 px-[10px] py-[8px]">
			<h2 class="text-[20px]">&nbsp;&gt;&gt; {data}&nbsp;</h2>
		</div>
	{/snippet}
	{#if diffFile}
		<DiffView
			{diffFile}
			diffViewWrap={wrap}
			diffViewMode={mode}
			diffViewFontSize={14}
			diffViewHighlight={highlight}
			diffViewTheme={dark ? 'dark' : 'light'}
			extendData={extend}
			diffViewAddWidget
			onAddWidgetClick={() => (v = '')}
			{renderExtendLine}
			{renderWidgetLine}
		/>
	{/if}
</div>

<!-- MultiSelect Example -->
<div class="m-auto mb-[1em] w-[90%]">
	<button
		class="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold leading-5 text-white hover:bg-orange-700"
		onclick={() => (showMultiSelect = !showMultiSelect)}
	>
		{showMultiSelect ? 'Hide MultiSelect Example' : 'Show MultiSelect Example'}
	</button>
</div>
{#if showMultiSelect}
	<div class="m-auto mb-[5em] w-[90%]">
		<h2 class="mb-[0.5em] text-[20px]">
			MultiSelect: Drag on line numbers to select multiple lines
		</h2>
		<div class="overflow-hidden rounded-[5px] border border-solid border-[#e1e1e1]">
			{#snippet multiSelectRenderWidgetLine({
				onClose
			}: {
				side: SplitSide;
				lineNumber: number;
				onClose: () => void;
			})}
				<div class="flex w-full flex-col border px-[4px] py-[8px]">
					{#if multiSelectWidget}
						<p class="mb-[4px] text-sm text-gray-500">
							{multiSelectWidget.fromLineNumber === multiSelectWidget.lineNumber
								? `Add comment on line ${multiSelectWidget.lineNumber}`
								: `Add comment on lines ${multiSelectWidget.fromLineNumber} - ${multiSelectWidget.lineNumber}`}
						</p>
					{/if}
					<textarea
						class="min-h-[80px] w-full border p-[2px]"
						bind:value={multiSelectV}
					></textarea>
					<div class="m-[5px] mt-[0.8em] text-right">
						<div class="inline-flex justify-end gap-x-[12px]">
							<button
								class="rounded-[4px] border px-[12px] py-[6px]"
								onclick={() => {
									multiSelectWidget = null;
									multiSelectV = '';
									onClose();
								}}>cancel</button
							>
							<button
								class="rounded-[4px] border px-[12px] py-[6px]"
								onclick={() => {
									if (!multiSelectWidget || !multiSelectV.trim()) {
										multiSelectWidget = null;
										multiSelectV = '';
										onClose();
										return;
									}
									const _side =
										multiSelectWidget.side === SplitSide.old ? 'oldFile' : 'newFile';
									const prev = multiSelectExtend;
									const sideData = { ...prev[_side] };
									const existing = sideData?.[multiSelectWidget.lineNumber]?.data || [];
									sideData[multiSelectWidget.lineNumber] = {
										data: [...existing, multiSelectV.trim()],
										fromLine: multiSelectWidget.fromLineNumber
									};
									multiSelectExtend = { ...prev, [_side]: sideData };
									multiSelectV = '';
									multiSelectWidget = null;
									onClose();
								}}>submit</button
							>
						</div>
					</div>
				</div>
			{/snippet}
			{#snippet multiSelectRenderExtendLine({
				data,
				lineNumber,
				fromLineNumber
			}: {
				data: string[];
				lineNumber: number;
				fromLineNumber: number;
				side: SplitSide;
			})}
				<div class="flex flex-col border bg-slate-100 px-[10px] py-[8px]">
					{#if fromLineNumber !== lineNumber}
						<p class="mb-[4px] text-xs text-gray-500">
							Lines {fromLineNumber} - {lineNumber}
						</p>
					{/if}
					{#each data as d, i (i)}
						<div class="mb-[4px] rounded border bg-white p-[6px]">{d}</div>
					{/each}
				</div>
			{/snippet}
			{#if diffFile}
				<DiffViewWithMultiSelect
					{diffFile}
					diffViewWrap={wrap}
					diffViewMode={mode}
					diffViewFontSize={14}
					diffViewHighlight={highlight}
					diffViewTheme={dark ? 'dark' : 'light'}
					diffViewAddWidget
					enableMultiSelect={true}
					extendData={multiSelectExtend}
					onAddWidgetClick={(props) => {
						multiSelectV = '';
						multiSelectWidget = {
							lineNumber: props.lineNumber,
							fromLineNumber: props.fromLineNumber ?? props.lineNumber,
							side: props.side
						};
					}}
					renderWidgetLine={multiSelectRenderWidgetLine}
					renderExtendLine={multiSelectRenderExtendLine}
				/>
			{/if}
		</div>
	</div>
{/if}
