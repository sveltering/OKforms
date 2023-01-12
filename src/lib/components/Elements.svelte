<script lang="ts">
	import type { ElementType } from '../index.js';
	import type { ArrayStore } from '@sveltering/custom-store';
	import ChildElement from './Element.svelte';
	export let childElements: ArrayStore<ElementType>;
</script>

{#each $childElements as element (element)}
	<ChildElement {element} />
{/each}
