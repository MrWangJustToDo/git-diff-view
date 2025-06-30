<script lang="ts">
	import '../app.css';
	import "../tailwind_pure.css";

	let { children } = $props();
</script>

<div class="diff-tailwindcss-wrapper">
	{@render children()}
</div>
