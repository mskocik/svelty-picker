<script>
  import { tick } from 'svelte';
  import { fade } from 'svelte/transition';
  import Calendar from './Calendar.svelte';
  import Time from './Time.svelte';
  import { formatDate, parseDate } from './dateUtils';
  import { usePosition } from './utils';
  import { en } from './i18n.js';

  export let name = 'date';
  export let value = null;
  export let initialDate = null;
  export let startDate = null;
  export let endDate = null;
  export let format = 'yyyy-mm-dd';
  export let formatType = 'standard';
  export let i18n = en;
  export let mode = 'datetime';

  export let weekStart = 1;
  export let pickerOnly = false;
  export let visible = false;
  export let autoclose = true;
  export let todayBtn = true;
  export let clearBtn = true;
  export let required = false;
  export let inputClasses;
  export let positionFn = usePosition;
  
  let innerDate = initialDate && initialDate instanceof Date
    ? initialDate
    : (value 
      ? parseDate(value, format, i18n, formatType)
      : null
    )
  let isFocused = pickerOnly;
  let inputEl = null;
  let calendarEl = null;
  let preventClose = false;
  let currentMode = mode === 'time'
    ? 'time'
    : 'date';

  $: internalVisibility = pickerOnly ? true : visible;
  $: {
    value = formatDate(innerDate, format, i18n, formatType)
  }

  function onDate(e) {
    let setter = e.detail || null;
    if (e.detail && innerDate) {
      if (innerDate.getUTCFullYear() === e.detail.getUTCFullYear()
       && innerDate.getUTCMonth() === e.detail.getUTCMonth()
       && innerDate.getUTCDate() === e.detail.getUTCDate()
       && mode === 'date'
      ) setter = null;
    }
    innerDate = setter;
    if (autoclose && mode === 'date' && !pickerOnly && !preventClose) { isFocused = false }
    if (!preventClose && mode === 'datetime' && currentMode === 'date') {
      currentMode = 'time';
    }
    preventClose = false;
    tick().then(() => {
      inputEl.dispatchEvent(new Event('input'))
    });
  }

  function onToday() {
    onDate({ detail: new Date()});
  }

  function onClear() {
    onDate({ detail: null })
  }

  function onKeyDown(e) {
    if (!isFocused) {
      ['Backspace', 'Delete'].includes(e.key) && onClear();
      isFocused = true;
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp':
      case 'ArrowLeft':
      case 'ArrowRight':
        e.preventDefault();
        preventClose = true;
        calendarEl.handleGridNav(e.key, e.shiftKey);
        break;
      case 'Escape':
        if (isFocused && !internalVisibility) {
          isFocused = false;
        }
        break;
      case 'Backspace':
      case 'Delete':
        onClear();
      case 'Enter':
        if (isFocused) isFocused = false;
        break;
      case 'Tab':
      case 'F5':  
        break;
      default:
        e.preventDefault();
    }
  }

  function onModeSwitch(e) {
    currentMode = e.detail;
  }

  function onBlur() {
    isFocused = false;
    if (mode.includes('date')) currentMode = 'date';
  }

</script>

<input type="{pickerOnly ? 'hidden' : 'text'}" {name} bind:this={inputEl}
  class={inputClasses} 
  {required}
  value={value}
  on:focus={() => { isFocused=true} }
  on:blur={onBlur}
  on:click={() => { if (!isFocused) isFocused = true }}
  on:input
  on:change
  on:keydown={onKeyDown}
  readonly={isFocused}
>
{#if visible || isFocused}
<div on:mousedown|preventDefault use:positionFn={{inputEl, visible: internalVisibility}} class="std-calendar-wrap is-popup" transition:fade={{duration: 200}}>
  {#if currentMode === 'date'}
  <Calendar date={innerDate} {startDate} {endDate} on:date={onDate} {i18n} {weekStart} bind:this={calendarEl}
    enableTimeToggle={mode.includes('time')} on:switch={onModeSwitch}
  ></Calendar>
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
  {:else}
    <Time date={innerDate} hasDateComponent on:time={onDate} on:switch={onModeSwitch} on:close={() => autoclose && onBlur()} {i18n}></Time>
  {/if}
</div>
{/if}


<style>
  .std-calendar-wrap {
    width: 280px;
    background-color: white;
    box-shadow: 0 1px 6px #ccc;
    border-radius: 4px;
    padding: 0.25rem 0.25rem 0.5rem;
  }
  .std-calendar-wrap.is-popup {
    box-shadow: 0 1px 6px #ccc;
  }
  .std-btn-row {
    margin-top: 0.5rem;
    display: flex;
    justify-content: space-evenly;
  }
</style>