<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount, onDestroy, beforeUpdate, afterUpdate } from 'svelte';
	import {
		registerEventListeners,
		deRegisterEventListeners,
		registerTimeouts,
		clearTimeouts,
		registerIntervals,
		clearIntervals
	} from '../housekeeping/functions.js';
	import {
		mountEvent,
		destroyEvent,
		beforeUpdateEvent,
		afterUpdateEvent
	} from '../housekeeping/events.js';
	import type { ElementType, Element, FragmentElement } from '../index.js';
	import Elements from './Elements.svelte';
	export let element: ElementType;
	let _element = <Element>element;
	let _fragment = <FragmentElement>element;
	let DOMelement: any;
	let innerText = _fragment.$innerText;
	let innerHTML = _fragment.$innerHTML;
	let attributes = _element.$attr;

	if (browser) {
		let hasEvents = !!Object.keys(element._events).length;
		let hasTimeouts = !!element._timeouts.length;
		let hasIntervals = !!element._intervals.length;
		onMount(() => {
			if (hasEvents) {
				if (element._isFragment) {
					DOMelement = document.createElement('div');
				}
				registerEventListeners(DOMelement, element._events);
				if (element._events?.mount) {
					DOMelement.dispatchEvent(mountEvent);
				}
			}
			if (hasTimeouts) {
				registerTimeouts(element._timeouts);
			}
			if (hasIntervals) {
				registerIntervals(element._intervals);
			}
		});
		onDestroy(() => {
			if (hasEvents) {
				if (element._events?.destroy) {
					DOMelement.dispatchEvent(destroyEvent);
				}
				deRegisterEventListeners(DOMelement, element._events);
				DOMelement = null;
			}
			if (hasTimeouts) {
				clearTimeouts(element._timeouts);
			}
			if (hasIntervals) {
				clearIntervals(element._intervals);
			}
		});

		if (hasEvents) {
			if (element._events?.beforeUpdate) {
				beforeUpdate(() => {
					DOMelement.dispatchEvent(beforeUpdateEvent);
				});
			}
			if (element._events?.afterUpdate) {
				afterUpdate(() => {
					DOMelement.dispatchEvent(afterUpdateEvent);
				});
			}
		}
	}
</script>

{#if element._isFragment}
	{#if $innerText}
		{$innerText}
	{:else if $innerHTML}
		{@html $innerHTML}
	{/if}
{:else}
	<svelte:element this={_element._nodeName.toLowerCase()} bind:this={DOMelement} {...$attributes}>
		<Elements childElements={_element.$childElements} />
	</svelte:element>
{/if}
