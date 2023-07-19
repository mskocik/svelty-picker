<script>
  import './../styles/markdown.css';

  export let title;
  export let content;
</script>

<div class="markdown-container">
  {#if title}<h1>{title}</h1>{/if}
  
  {#if content}
  <svelte:component this={content} />
  {:else if $$slots.default}
  <slot />
  {:else}
  <div class="text-center">
    loading ...
  </div>
  {/if}
</div>

<style>
  .markdown-container {
    /* max-width: 58em; */
    margin: auto;
  }
</style>