<script>
	import { onMount } from 'svelte';

	export let pages = [];
	export let active_section = '';
	export let isLoading = false;

	let active_el;

	onMount(() => {
		active_el?.scrollIntoView({ block: 'center' });
	});
</script>

<ul class="toc">
	{#each pages as page}
		<li>
			<!-- <span class="section-title">{section.title}</span> -->

				<div class="row" class:active={page.slug === (active_section || '')} class:loading={isLoading}>
					<a
						href="/{page.slug}"
						class="row"
						class:active={page.slug === active_section}
						class:loading={isLoading}
					>
						<span>{page.title}</span>
					</a>
					<!-- {#if page.slug === active_section}
						<a bind:this={active_el} href="/{page.slug}" class="repl-link">REPL</a>
					{/if} -->
				</div>
		</li>
	{/each}
</ul>

<style>
	.toc {
		padding-left: 0;
	}
	.toc li {
		display: block;
		line-height: 1.2;
		margin: 0 0 1em 0;
	}

	div {
		display: flex;
		flex-direction: row;
		padding: 0.2rem 3rem;
		margin: 0 -3rem;
	}

	div.active {
		color: white;
		text-decoration: underline;
	}
	
	a {
		display: flex;
		flex: 1 1 auto;
		position: relative;
		color: var(--sk-text-2);
		border-bottom: none;
		font-size: 1.6rem;
		align-items: center;
		justify-content: flex-start;
		padding: 0;
	}
	
	div.active a {
		color: orange;
	}
	a:hover {
		color: var(--sk-text-1);
	}
</style>
