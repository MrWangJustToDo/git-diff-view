<script lang="ts">
	import { getEnableWrap } from '$lib/context/enableWrap.js';
	import type { DiffFile } from '@git-diff-view/core';

	import DiffSplitViewWrap from './DiffSplitViewWrap.svelte';
	import DiffSplitViewNormal from './DiffSplitViewNormal.svelte';

	interface Props {
		diffFile: DiffFile;
	}

	let props: Props = $props();

	const enableWrap = $derived.by(getEnableWrap());
</script>

{#if enableWrap}
	<DiffSplitViewWrap diffFile={props.diffFile} />
{:else}
	<DiffSplitViewNormal diffFile={props.diffFile} />
{/if}
