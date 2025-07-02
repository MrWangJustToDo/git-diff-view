<script lang="ts">
	import { getMode } from '$lib/context/mode.js';
	import type { DiffFile } from '@git-diff-view/core';
	import { DiffModeEnum } from '$lib/utils/symbol.js';

	import DiffSplitHunkLineGitHub from './DiffSplitHunkLineWrapGitHub.svelte';
	import DiffSplitHunkLineGitLab from './DiffSplitHunkLineWrapGitLab.svelte';

	interface Props {
		index: number;
		diffFile: DiffFile;
		lineNumber: number;
	}

	let props: Props = $props();

	const mode = $derived.by(getMode());
</script>

{#if mode === DiffModeEnum.SplitGitHub || mode === DiffModeEnum.Split}
	<DiffSplitHunkLineGitHub
		index={props.index}
		diffFile={props.diffFile}
		lineNumber={props.lineNumber}
	/>
{:else}
	<DiffSplitHunkLineGitLab
		index={props.index}
		diffFile={props.diffFile}
		lineNumber={props.lineNumber}
	/>
{/if}
