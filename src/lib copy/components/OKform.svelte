<script lang="ts">
	import Element from './Element.svelte';
	import type { OKForm } from '../index.js';
	export let okform: OKForm;
</script>

<Element element={okform.form()} />
