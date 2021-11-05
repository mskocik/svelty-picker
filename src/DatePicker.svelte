<script>
  import { createEventDispatcher, tick } from 'svelte';
  import { fade } from 'svelte/transition';
  import Calendar from './Calendar.svelte';
  import { formatDate } from './dateUtils';
  import { usePosition } from './utils';
  import { en } from './i18n.js';

  export let name = 'date';
  export let date = null;
  export let startDate = null;
  export let endDate = null;
  export let format = 'yyyy-mm-dd';
  export let formatType = 'standard';
  export let i18n = en;

  export let visible = false;
  export let autoclose = true;
  export let todayBtn = true;
  export let clearBtn = true;
  export let required = false;
  export let inputClasses;
  export let positionFn = usePosition;
  
  let isFocused = false;
  let inputEl = null;

  const dispatch = createEventDispatcher();

  if (typeof date === 'string') date = new Date(date);  // TODO: parse
  $: inputValue = formatDate(date, format, i18n, formatType)

  function onDate(e) {
    date = e.detail || null;
    if (autoclose) { isFocused = false }
    tick().then(() => inputEl.dispatchEvent(new Event('input')));
  }

  function onToday() {
    onDate({ detail: new Date()});
  }

  function onClear() {
    onDate({ detail: null })
  }

</script>


<input type="text" {name} bind:this={inputEl}
  class={inputClasses}
  {required}
  on:focus={() => { isFocused=true} }
  on:blur={() => { isFocused=false} }
  on:click={() => { if (!isFocused) isFocused = true }}
  bind:value={inputValue}
  on:input
  on:change

  readonly
>
{#if visible || isFocused}
<div on:mousedown|preventDefault use:positionFn={{inputEl, visible}} class="std-calendar-wrap" transition:fade={{duration: 200}}>
  <Calendar {date} {startDate} {endDate} on:date={onDate} {i18n}></Calendar>
  {#if todayBtn || clearBtn}
  <div class="std-btn-row">
    {#if todayBtn}
      <button on:click={onToday} class="btn btn-primary btn-sm">{i18n.todayBtn}</button>
    {/if}
    {#if clearBtn}
      <button on:click={onClear} class="btn btn-outline-danger btn-sm">{i18n.clearBtn}</button>
    {/if}
  </div>
  {/if}
</div>
{/if}


<style>
  .std-calendar-wrap {
    width: 280px;
    background-color: white;
    box-shadow: 0 0 4px #777;
    border-radius: 4px;
    padding: 0.25rem 0.25rem 0.5rem;
  }
  .std-btn-row {
    margin-top: 0.5rem;
    display: flex;
    justify-content: space-evenly;
  }
</style>