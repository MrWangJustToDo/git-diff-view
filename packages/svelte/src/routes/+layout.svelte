<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div class="diff-tailwindcss-wrapper">
	{@render children()}
</div>
