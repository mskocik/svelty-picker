<script>
  import { getContext, onMount } from 'svelte';
  import { factory } from '../../documentation/factory.js';
	import { navigating } from '$app/stores';
  import ScreenToggle from './ScreenToggle.svelte';
	import Repl from '@sveltejs/repl';
  import Markdown from '../Markdown.svelte';

  /** @type {import('.$types').PageData}*/
  export let data;

	const theme = getContext('theme');

  let component;
  let repl;
  let mounted;
	/** @type {number} */
	let width;
  let replVisible = false;
  let offset = 0;

  const clone = (file) => ({
		name: file.name.replace(/.\w+$/, ''),
		type: file.type,
		source: file.content
	});

	$: mobile = width < 768; // note: same as per media query below
	/** @type {'columns' | 'rows'} */
	$: replOrientation = mobile || width > 1080 ? 'columns' : 'rows';
	$: data.repl.length > 0 && repl && repl.set({ files: data.repl.map(clone) });

  $: loadComponent(data.slug || 'introduction');

  async function loadComponent(slug) {
    component = await factory[slug]();
    replVisible = data.repl.length > 0;
  }

  onMount(() => {
		setTimeout(() => {
			mounted = true;
		}, 2000);
  })
</script>

<Markdown title={data.title} content={component} />

<h1 class="visually-hidden">Examples</h1>
<div class="examples-container" bind:clientWidth={width} class:repl-active={replVisible}>
	<div class="viewport offset-{offset}">
		<div class="repl-container" class:loading={$navigating}>
			{#if mounted}
			<Repl
				bind:this={repl}
				orientation={replOrientation}
				fixed={mobile}
				relaxed
				previewTheme={$theme}
			/>
			{/if}
		</div>
	</div>
	{#if mobile}
		<ScreenToggle bind:offset labels={['input', 'output']} />
	{/if}
</div>

<style>
	.examples-container {
		position: relative;
		height: 85vh;
		overflow: hidden;
		padding: 0 0 42px 0;
		box-sizing: border-box;
    width: 100%;
    display: block;
    z-index: -1;
    opacity: 0;
		box-shadow: 0 0 10px 1px #ccc;
	}
  .examples-container.repl-active {
    z-index: 0;
    opacity: 1;
  }


	.viewport {
		display: grid;
		/* width: 300%; */
		/* height: 100%; */
		/* grid-template-columns: 33.333% 66.666%; */
		transition: transform 0.3s;
		grid-auto-rows: 100%;
	}

	.repl-container.loading {
		opacity: 0.6;
	}
	.repl-container {
		width: 100%;
	}

	/* temp fix for #2499 and #2550 while waiting for a fix for https://github.com/sveltejs/svelte-repl/issues/8 */

	.repl-container :global(.tab-content),
	.repl-container :global(.tab-content.visible) {
		pointer-events: all;
		opacity: 1;
	}
	.repl-container :global(.tab-content) {
		visibility: hidden;
	}
	.repl-container :global(.tab-content.visible) {
		visibility: visible;
	}

	.offset-1 {
		transform: translate(-33.333%, 0);
	}
	.offset-2 {
		transform: translate(-66.666%, 0);
	}

	@media (min-width: 768px) {
		.examples-container {
			padding: 0;
		}

		.viewport {
			width: 1fr;
			height: 100%;
			display: grid;
			/* TODO */
			grid-template-columns: 100% auto;
			grid-auto-rows: 100%;
			transition: none;
		}

		.offset-1,
		.offset-2 {
			transform: none;
		}
	}
</style>
