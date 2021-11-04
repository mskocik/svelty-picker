<script>
  import { fade } from 'svelte/transition';
  import DatePicker from './DatePicker.svelte';
  import { formatDate } from './dateUtils';
  import { en } from './i18n.js';

  export let name = 'date';
  export let date = null;
  export let startDate = null;
  export let endDate = null;
  export let format = 'Y-m-d';
  export let formatType = 'php';
  export let i18n = en;
  export let autoclose = true;
  export let todayBtn = true;
  export let clearBtn = true;
  export let required = false;
  export let inputClasses;
  export let positionFn = position;
  
  let isFocused = false;
  let inputEl;

  $: inputValue = formatDate(date, format, i18n, formatType)

  function position(el) {
    function update() {
      document.body.appendChild(el);
      const rect = inputEl.getBoundingClientRect();
      el.style = `left: ${rect.left}px; top: ${rect.top + rect.height}px; position: absolute`;
      el.hidden = false;
    }

    function destroy() {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }

    update(el);
    return {
      update,
      destroy
    }
  }

  function onDate(e) {
    date = e.detail || null;
    if (autoclose) { isFocused = false }
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
  readonly
>
{#if isFocused}
<div on:mousedown|preventDefault use:positionFn class="c-calendar-wrap" transition:fade={{duration: 200}}>
  <DatePicker {date} {startDate} {endDate} on:date={onDate} {i18n}></DatePicker>
  {#if todayBtn || clearBtn}
  <div class="btn-row">
    {#if todayBtn}
      <button on:click={onToday} class="btn btn-primary btn-sm">Today</button>
    {/if}
    {#if clearBtn}
      <button on:click={onClear} class="btn btn-outline-danger btn-sm">Clear</button>
    {/if}
  </div>
  {/if}
</div>
{/if}


<style>
  .c-calendar-wrap {
    width: 320px;
    background-color: white;
    box-shadow: 0 0 4px #777;
    border-radius: 4px;
    padding: 0.5rem;
  }
  .btn-row {
    margin-top: 0.5rem;
    display: flex;
    justify-content: space-evenly;
  }
</style>