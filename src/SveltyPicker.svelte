<script context="module">
  import settings from './settings';
  // your script goes here
  export const config = settings;
</script>

<script>
  import { createEventDispatcher, tick } from 'svelte';
  import { fade } from 'svelte/transition';
  import Calendar from './Calendar.svelte';
  import Time from './Time.svelte';
  import { formatDate, parseDate, UTCDate } from './dateUtils';
  import { usePosition } from './utils';

  export let name = 'date';
  export let disabled = false;
  export let placeholder = null;
  export let value = null;
  export let initialDate = null;
  export let startDate = null;
  export let endDate = null;
  export let pickerOnly = false;
  export let required = false;
  // configurable globally
  export let mode = config.mode;
  export let format =  config.format;
  export let formatType = config.formatType;
  export let weekStart = config.weekStart;
  export let visible = config.visible;
  export let inputClasses = config.inputClasses;
  export let todayBtnClasses = config.todayBtnClasses;
  export let clearBtnClasses = config.clearBtnClasses;
  export let todayBtn = config.todayBtn;
  export let clearBtn = config.clearBtn;
  export let autoclose = config.autoclose;
  export let i18n =  config.i18n;
  // actions
  export let positionFn = usePosition;
  export let validatorAction = null;
  export function setDateValue(val) {
    innerDate = parseDate(val, format, i18n, formatType);
  }
  
  if (format === 'yyyy-mm-dd' && mode === 'time') {
    format = 'hh:ii'
  }
  
  const dispatch = createEventDispatcher();
  let prevValue = value;
  let currentFormat = format;
  let innerDate = initialDate && initialDate instanceof Date
    ? UTCDate(initialDate.getUTCFullYear(), initialDate.getUTCMonth(), initialDate.getUTCDate(), initialDate.getHours(), initialDate.getUTCMinutes())
    : (value 
      ? parseDate(value, format, i18n, formatType)
      : null
    )
  if (innerDate && initialDate) {
    value = formatDate(innerDate, format, i18n, formatType);
  }
  let isFocused = pickerOnly;
  let inputEl = null;
  let inputRect = null;
  let inputAction = validatorAction ? validatorAction.shift() : () => {};
  let inputActionParams = validatorAction || [];
  let calendarEl = null;
  let preventClose = false;
  let resolvedMode = mode === 'auto'
    ? (
      format.match(/hh?|ii?/i) && format.match(/y|m|d/i)
        ? 'datetime'
        : (format.match(/hh?|ii?/i)
          ? 'time'
          : 'date'
        )
    )
    : mode;
  let currentMode = resolvedMode === 'time'
    ? 'time'
    : 'date';

  $: internalVisibility = pickerOnly ? true : visible;
  $: {
    if (value !== prevValue) {
      const parsed = value ? parseDate(value, format, i18n, formatType) : null;
      innerDate = parsed;
      prevValue = value;
    }
    if (currentFormat !== format && innerDate) {
      value = formatDate(innerDate, format, i18n, formatType);
      prevValue = value;
      currentFormat = format;
      if (mode === 'auto') {
        resolvedMode = format.match(/hh?|ii?/i) && format.match(/y|m|d/i)
          ? 'datetime'
          : (format.match(/hh?|ii?/i)
            ? 'time'
            : 'date'
          )
      }
    }
  }

  function onDate(e) {
    let setter = e.detail || null;
    if (e.detail && innerDate) {
      if (innerDate.getUTCFullYear() === e.detail.getUTCFullYear()
       && innerDate.getUTCMonth() === e.detail.getUTCMonth()
       && innerDate.getUTCDate() === e.detail.getUTCDate()
       && resolvedMode === 'date'
      ) setter = null;
    }
    value = setter ? formatDate(setter, format, i18n, formatType) : null;
    if (autoclose && resolvedMode === 'date' && !pickerOnly && !preventClose) { isFocused = false }
    if (!preventClose && resolvedMode === 'datetime' && currentMode === 'date') {
      currentMode = 'time';
    }
    preventClose = false;
    tick().then(() => {
      inputEl.dispatchEvent(new Event('input'))
    });
  }

  function onToday() {
    const today = new Date();
    if (startDate && parseDate(startDate, format, i18n, formatType) < today) return;
    onDate({ detail: UTCDate(today.getUTCFullYear(), today.getMonth(), today.getDate(), today.getHours(), today.getUTCMinutes(), 0)});
  }

  function onClear() {
    onDate({ detail: null });
    currentMode = 'date';
    if (resolvedMode === 'date' && !pickerOnly && autoclose) isFocused = false;
  }

  function onFocus() {
    inputRect = inputEl.getBoundingClientRect();
    isFocused = true;
  }

  function onKeyDown(e) {
    if (!isFocused) {
      ['Backspace', 'Delete'].includes(e.key) && onClear();
      return onFocus();
    }
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp':
      case 'ArrowLeft':
      case 'ArrowRight':
        e.preventDefault();
        preventClose = true;
        if (currentMode === 'date') {
          // TODO: handle shift
          calendarEl.handleGridNav(e.key, e.shiftKey);
        }
        if (currentMode === 'time') {
          // TODO: keyboard nav for timepicker
        }
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
        if (isFocused && resolvedMode === 'date') isFocused = false;
        if (resolvedMode.includes('time')) {
          currentMode = 'time';
        }
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
    if (resolvedMode.includes('date')) currentMode = 'date';
    dispatch('blur');
  }
</script>

<input type="{pickerOnly ? 'hidden' : 'text'}" {name} bind:this={inputEl} use:inputAction={inputActionParams}
  autocomplete="off"
  {disabled}
  {placeholder}
  class={inputClasses} {required}
  readonly={isFocused}
  value={value}
  on:focus={onFocus}
  on:blur={onBlur}
  on:click={() => { !isFocused && onFocus() }}
  on:input
  on:change
  on:keydown={onKeyDown}
>
{#if visible || isFocused}
<div on:mousedown|preventDefault use:positionFn={{inputEl, visible: internalVisibility, inputRect}} class="std-calendar-wrap is-popup" transition:fade|local={{duration: 200}}>
  {#if currentMode === 'date'}
    <Calendar date={innerDate} 
      startDate={startDate ? parseDate(startDate, format, i18n, formatType) : null}
      endDate={endDate ? parseDate(endDate, format, i18n, formatType) : null}
      enableTimeToggle={resolvedMode.includes('time')}
      bind:this={calendarEl}
      {i18n} {weekStart} 
      on:date={onDate} 
      on:switch={onModeSwitch}
    ></Calendar>
    {#if todayBtn || clearBtn}
    <div class="std-btn-row">
      {#if todayBtn}
        <button on:click={onToday} class={todayBtnClasses} disabled={startDate > formatDate(new Date(), format, i18n, formatType)}>{i18n.todayBtn}</button>
      {/if}
      {#if clearBtn}
        <button on:click={onClear} class={clearBtnClasses} disabled={!innerDate}>{i18n.clearBtn}</button>
      {/if}
    </div>
    {/if}
  {:else}
    <Time date={innerDate} hasDateComponent={resolvedMode!=='time'}
      showMeridian={format.match('p|P')}
      {i18n}
      on:time={onDate}
      on:switch={onModeSwitch}
      on:close={() => autoclose && !pickerOnly && onBlur()}
    ></Time>
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
  .sdt-action-btn {
    padding: 0.25rem 0.5rem;
    font-size: .875rem; 
    border-radius: 0.2rem;
  }
  .sdt-today-btn {
    background-color: #286090;
    color: #fff;
    padding: 0.25rem 0.5rem;
    font-size: .875rem; 
    border-radius: 0.2rem;
    border: 1px solid #1e486d;
  }
  .sdt-today-btn[disabled] {
    opacity: 0.75;
  }
  .sdt-today-btn:focus,
  .sdt-today-btn:active,
  .sdt-today-btn:hover:not([disabled]) {
      background-color: #1e486d;
  }
  .sdt-clear-btn {
    border: 1px solid #dc3545;
    background-color: transparent;
    color: #dc3545;
  }
  .sdt-clear-btn:focus,
  .sdt-clear-btn:active,
  .sdt-clear-btn:hover:not([disabled]) {
    background-color: #dc3545;
    color: #fff;
  }
</style>