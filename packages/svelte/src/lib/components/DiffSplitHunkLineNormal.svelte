<script lang="ts">
	import { getMode } from '$lib/context/mode.js';
	import type { DiffFile, SplitSide } from '@git-diff-view/core';
	import { DiffModeEnum } from '@git-diff-view/utils';

	import DiffSplitHunkLineGitHub from './DiffSplitHunkLineNormalGitHub.svelte';
	import DiffSplitHunkLineGitLab from './DiffSplitHunkLineNormalGitLab.svelte';

	interface Props {
		index: number;
		side: SplitSide;
		diffFile: DiffFile;
		lineNumber: number;
	}

	let props: Props = $props();

	const mode = $derived.by(getMode());
</script>

{#if mode === DiffModeEnum.SplitGitHub || mode === DiffModeEnum.Split}
	<DiffSplitHunkLineGitHub
		index={props.index}
		side={props.side}
		diffFile={props.diffFile}
		lineNumber={props.lineNumber}
	/>
{:else}
	<DiffSplitHunkLineGitLab
		index={props.index}
		side={props.side}
		diffFile={props.diffFile}
		lineNumber={props.lineNumber}
	/>
{/if}
