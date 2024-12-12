<script>
  let {
    items = [],
    initialTab = 1
  } = $props();

  let activeTabValue = $state(initialTab);

  const handleClick = tabValue => () => (activeTabValue = tabValue);
</script>

<ul>
{#each items as item}
	<li class={activeTabValue === item.value ? 'active' : ''}>
		<button class="label" onclick={handleClick(item.value)}>{item.label}</button>
	</li>
{/each}
</ul>
{#each items as item}
	{#if activeTabValue == item.value}
	<div class="box">
		<item.component />
	</div>
	{/if}
{/each}

<style>
	.box {
		margin-bottom: 10px;
		/* border: 1px solid #dee2e6; */
    border-radius: 0 0 .5rem .5rem;
    border-top: 0;
	}
  ul {
    display: flex;
    gap: 8px;
    padding-left: 0;
    margin-bottom: 0;
    list-style: none;
    /* border-bottom: 1px solid #dee2e6; */
  }
	li + li {
    margin-top: 0;
	}

  .label {
    border: 1px solid transparent;
    border-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
    border-bottom-color: t;
    display: block;
    padding: 0.5rem 1rem;
    cursor: pointer;
  }

  button:hover {
    border-color: #e9ecef;
  }

  li.active > .label {
    color: var(--vp-c-text-1);
    background-color: var(--vp-c-divider);
    border-color: #dee2e6;
  }
  /* .box :global(table) {
    margin-top: 0;
  } */
</style>
