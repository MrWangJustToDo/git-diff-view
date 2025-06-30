<script lang="ts">
	import '../app.css';
	import "../../styles/diff-view.css";

	let { children } = $props();
</script>

<div>
	{@render children()}
</div>
