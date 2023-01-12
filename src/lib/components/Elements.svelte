<script lang="ts">
	import type { T_Element } from '../index';
	import type { arrayStore } from '../housekeeping/stores';
	import ChildElement from './Element.svelte';
	export let childElements: arrayStore<T_Element>;
</script>

{#each $childElements as element (element)}
	<ChildElement {element} />
{/each}
