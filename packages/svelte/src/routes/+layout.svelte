<script lang="ts">
	import '../app.css';
	import '@git-diff-view/svelte/styles/diff-view.css';

	let { children } = $props();
</script>

<div class="diff-tailwindcss-wrapper">
	{@render children()}
</div>
