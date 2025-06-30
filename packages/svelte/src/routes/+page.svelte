<script lang="ts">
	import { DiffFile, DiffModeEnum } from '@git-diff-view/svelte';
	import * as data from '../data.json';
	import type { MessageData } from '../worker.js';
	import diff from 'fast-diff';

	const worker = new Worker(new URL('../worker.ts', import.meta.url), { type: 'module' });

	type Key = 'a' | 'b' | 'c' | 'd' | 'e';

	let key = $state<Key>('a');

	let diffFile = $state<DiffFile | null>(null);

	let highlight = $state<boolean>(true);

	let wrap = $state<boolean>(true);

	let dark = $state<boolean>(false);

	let mode = $state<DiffModeEnum>();

	const toggleHighlight = () => (highlight = !highlight);

	const toggleTheme = () => (dark = !dark);

	const toggleWrap = () => (wrap = !wrap);

	const toggleMode = () =>
		mode === DiffModeEnum.Split ? DiffModeEnum.Unified : DiffModeEnum.Split;

	let v = $state('');

	let extend = $state({});

	worker.addEventListener('message', (e: MessageEvent<MessageData>) => {
		const { data, bundle } = e.data;
		const instance = DiffFile.createInstance(data || {}, bundle);
		diffFile = instance;
	});

	$effect(() => {
		worker.postMessage({
			key,
			data: data[key]
		});
	});

	$effect(() => {
		if (diffFile) {
			extend = { oldFile: {}, newFile: {} };
		}
	});
</script>
