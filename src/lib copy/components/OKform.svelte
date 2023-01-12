<script lang="ts">
	import Element from './Element.svelte';
	import type { okform } from '..';
	export let okform: okform;
</script>

<Element element={okform.form()} />
