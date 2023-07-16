<script context="module">
  import settings from "../settings";
  export const config = settings;
</script>

<script>
  import { createEventDispatcher, onMount, tick } from "svelte";
  import { fade } from "svelte/transition";
  import Calendar from "./Calendar.svelte";
  import Time from "./Time.svelte";
  import { formatDate, parseDate } from "$lib/utils/dateUtils";
  import { usePosition } from "$lib/utils/actions.js";
  import { initProps } from "$lib/utils/initProps";
  import { MODE_MONTH } from "$lib/utils/constants";

  // html
  export let inputId = '';
  /** @type {string} */
  export let name = "date";
  /** @type {boolean} */
  export let disabled = false;
  /** @type {string|null|undefined} */
  export let placeholder = null;
  /** @type {boolean} */
  export let required = false;
  /** @type {string|string[]|null} */
  export let value = null;
  /** @type {Date|Date[]|null} */
  export let initialDate = null;
  /** @type {boolean }*/
  export let isRange = false;
  /** @type {Date | string | null} */
  export let startDate = null;
  /** @type {Date | string | null} */
  export let endDate = null;
  /** @type {boolean} */
  export let pickerOnly = false;
  /** @type {number} */
  export let startView = MODE_MONTH;
  /** ************************************ 👇 configurable globally */
  /** @type {string} */
  export let theme = config.theme;
  /** @type {string} */
  export let mode = config.mode;
  export let format = config.format;
  /** @type {string} */
  export let formatType = config.formatType;
  /** @type {string|null} */
  export let displayFormat = config.displayFormat;
  /** @type {string|null} */
  export let displayFormatType = config.displayFormatType;
  /** @type {string} */
  /** @type {number} */
  export let minuteIncrement = config.minuteIncrement;
  /** @type {number} */
  export let weekStart = config.weekStart;
  /** @type {string} */
  export let inputClasses = config.inputClasses;
  /** @type {string} */
  export let todayBtnClasses = config.todayBtnClasses;
  /** @type {string} */
  export let clearBtnClasses = config.clearBtnClasses;
  /** @type {boolean} */
  export let todayBtn = config.todayBtn;
  /** @type {boolean} */
  export let clearBtn = config.clearBtn;
  /** @type {boolean} */
  export let autoclose = config.autoclose;
  /** @type {import("$lib/i18n").i18nType} */
  export let i18n = config.i18n;
  /** ************************************ actions */
  /** @type {Array<any>|null} */
  export let validatorAction = null;

  export function getLastPickerPhase() {
    return lastPickerPhase;
  }
  /** ************************************ custom-element elements */
  /** @type {HTMLInputElement|null} */
  export let ce_valueElement = null;
  /** @type {HTMLInputElement|null} */
  export let ce_displayElement = null;

  const dispatch = createEventDispatcher();

  let { valueArray, prevValue, innerDates } = initProps(value, initialDate, format, i18n, formatType);
  
  let currentFormat = format;
  let isFocused = pickerOnly;
  $: pickerVisible = pickerOnly;  
  $: activeDisplayFormat = displayFormat || format;
  $: activeDisplayFormatType = displayFormatType || formatType;
  $: displayValue = innerDates
    .map(innerDate => formatDate(innerDate, activeDisplayFormat, i18n, activeDisplayFormatType))
    .sort()
    .join(' - ');
  $: parsedStartDate = startDate ? parseDate(startDate, format, i18n, formatType) : null;
  $: parsedEndDate = endDate ? new Date(parseDate(endDate, format, i18n, formatType).setSeconds(1)) : null;
  $: isTodayDisabled = (parsedStartDate && parsedStartDate > new Date()) || (parsedEndDate && parsedEndDate < new Date());
  
  $: fadeFn = pickerOnly ? () => ({}) : fade;

  // FUTURE:
  // $: widgetCount = isRange ? [0,1] : [0];
  let inputEl = ce_displayElement;
  /** @type {function|function} */
  let inputAction = validatorAction ? validatorAction.shift() : () => {};
  /** @type {any} */
  let inputActionParams = validatorAction || [];
  /** @type {Calendar} */
  let calendarEl;
  /** @type {Time} */
  let timeEl;
  let preventClose = false;
  /** @type {NodeJS.Timeout|number|null} */
  let preventCloseTimer = null;
  /** @type {string} */
  let resolvedMode = startView
    ? (startView === 3
      ? 'time'
      : ''
    )
    : '';
  let currentMode = resolvedMode === "time" ? "time" : "date";
  let isMinuteView = false;
  /** @type {string | null} */
  let lastPickerPhase = null;
  $: {
    resolvedMode = mode === "auto"
      ? format.match(/g|hh?|ii?/i) && format.match(/y|m|d/i)
        ? "datetime"
        : format.match(/g|hh?|ii?/i)
        ? "time"
        : "date"
      : mode;
    if (resolvedMode === 'time' && currentMode !== resolvedMode) {
      currentMode = resolvedMode;
    }
  }
  $: {  // custom-element ONLY
    if (ce_displayElement) ce_displayElement.readOnly = isFocused;
  }
  $: internalVisibility = pickerOnly ? true : false;
  $: positionPopup = !pickerOnly ? usePosition : () => {};
  $: {
    let valueChanged = false;
    if (valueArray.join('') !== prevValue.join('')) {
      innerDates = valueArray.map(val => parseDate(val, format, i18n, formatType));
      prevValue = valueArray;
      valueChanged = true;
    }
    // update value on format change
    if (currentFormat !== format && innerDates.length) {
      valueArray = innerDates.map(date => formatDate(date, format, i18n, formatType));
      prevValue = valueArray;
      currentFormat = format;
      if (mode === "auto") {
        resolvedMode =
          format.match(/g|hh?|ii?/i) && format.match(/y|m|d/i)
            ? "datetime"
            : format.match(/g|hh?|ii?/i)
            ? "time"
            : "date";
      }
    }
    value = isRange ? prevValue : (prevValue[0] || null);
    tick().then(() => dispatchInputEvent(valueChanged)); // tick for display value update
  }
  $: if (!pickerVisible) isMinuteView = false;

  function resetView() {
    startView = MODE_MONTH;
    isMinuteView = false;
    if (!pickerOnly) pickerVisible = false;
    if (resolvedMode !== 'time') currentMode = "date";
  }

  /** 
   * Internal helper array
   * 
   * @type {Date[]}
   */
  let dateEntryOrder = [];

  /** 
   * @param {CustomEvent} e
   */
  function onDate(e) {
    /** @type {Date|null} */
    let setter = e.detail || null;
    // FUTURE: replace by custom `detail` prop
    if (currentMode === "date") {
      lastPickerPhase = "date";
    } else {
      lastPickerPhase = isMinuteView ? "minute" : "hour";
    }

    if (setter && !isRange && innerDates.length) {
      if (
        innerDates[0].getFullYear() === setter.getFullYear() &&
        innerDates[0].getMonth() === setter.getMonth() &&
        innerDates[0].getDate() === setter.getDate() &&
        resolvedMode === "date" &&
        !required
      )
        setter = null;
    }
    if (e.type === 'clear') {
      innerDates = [];
      valueArray = [];
      dateEntryOrder = [];
    } else {
      // standard
      if (isRange) {
      if (setter) dateEntryOrder.push(setter);
      if (dateEntryOrder.length === 3) dateEntryOrder.shift();
      innerDates = dateEntryOrder.map(date => date.getTime()).sort().map(ts => new Date(ts));
      valueArray = innerDates.map(date => formatDate(date, format, i18n, formatType));
    } else {
      // single select
      innerDates = setter ? [setter] : [];
      valueArray = setter ? [formatDate(setter, format, i18n, formatType)] : [];
    }
    }

    if (
      autoclose &&
      (resolvedMode === "date" || !setter) &&
      !pickerOnly &&
      !preventClose
    ) {
      resetView();
    }
    if (
      setter &&
      !preventClose &&
      resolvedMode === "datetime" &&
      currentMode === "date"
    ) {
      currentMode = "time";
    }
    if (preventClose && currentMode === "time") {
      preventCloseTimer = setTimeout(() => {
        preventClose = false;
      }, 400);
    } else {
      preventClose = false;
    }
    tick().then(() => {
      dispatchInputEvent(true);
      dispatch("change", isRange ? valueArray : (valueArray[0] || null));    // change is dispatched on user interaction
    });
  }

  function onToday() {
    const now = new Date();
    const innerDate = innerDates[0] || now;
    onDate(new CustomEvent('ontoday', {
      detail: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        innerDate.getHours(),
        innerDate.getMinutes(),
        0
      )
    }));
  }

  function onClear() {
    onDate(new CustomEvent('clear', { detail: null }));
  }

  /** 
   * @param {KeyboardEvent} e
   */
  function onKeyDown(e) {
    if (!pickerVisible) {
      ["Backspace", "Delete"].includes(e.key) && !required && onClear();
      if (e.key === 'Enter') onInputFocus();
    }
    if (!pickerVisible && e.key !== 'Tab') {
      pickerVisible = e.key !== 'Shift';
      e.preventDefault();
      return;
    }
    switch (e.key) {
      case "PageDown":
      case "PageUp":
      case "ArrowDown":
      case "ArrowUp":
      case "ArrowLeft":
      case "ArrowRight":
        e.preventDefault();
        preventCloseTimer && clearTimeout(preventCloseTimer);
        preventClose = true;
        if (currentMode === "date") {
          calendarEl.handleGridNav(e.key, e.shiftKey);
        } else {
          // if (currentMode === 'time') {
          timeEl.makeTick(
            ["ArrowDown", "ArrowLeft", "PageDown"].includes(e.key) ? -1 : 1
          );
        }
        break;
      case "Escape":
        if (isFocused) {
          pickerVisible = false;
        }
        break;
      case "Backspace":
      case "Delete":
        !required && onClear();
        break;
      case "Enter":
        isFocused && e.preventDefault();
        if (currentMode === "time") {
          if (!timeEl.minuteSwitch(null)) {
            return timeEl.minuteSwitch(true);
          }
          return resetView();
        }
        if (isFocused && resolvedMode === "date") pickerVisible = false;
        // TODO: handle change to time on range picker?
        if (innerDates && resolvedMode.includes("time")) {
          currentMode = "time";
        }
        break;
      case "Tab":
        if (pickerVisible) {
          pickerVisible = false;
          e.preventDefault();
        }
      case "F5":
        break;
      default:
        e.preventDefault();
    }
  }

  /**
   * @param {CustomEvent} e
   */
  function onModeSwitch(e) {
    startView = MODE_MONTH;
    currentMode = e.detail;
    isMinuteView = false;
  }

  function onTimeClose() {
    autoclose && !preventClose && resetView();
  }

  function onInputFocus() {
    isFocused = true;
    pickerVisible = true;
  }

  function onInputBlur() {
    isFocused = false;
    pickerVisible = false;
    !ce_displayElement && dispatch("blur");
  }

  /**
   * @param {boolean} dispatchInputEvent
   */
  function dispatchInputEvent(dispatchInputEvent) {
    if (ce_valueElement && ce_displayElement) {
      ce_valueElement.value = valueArray.join(',') || '';
      ce_displayElement.value = displayValue || '';
      ce_valueElement.dispatchEvent(new Event('input'));
      ce_displayElement.dispatchEvent(new Event('input'));
    }
    dispatchInputEvent && dispatch("input", value);
  }

  /**
   * @param {CustomEvent} e
   */
   function onTimeSwitch(e) {
    isMinuteView = e.detail;
  }

  /**
   * initialization for custom element
  */
  onMount(() => {
    if (ce_displayElement) {
      ce_displayElement.onfocus = onInputFocus;
      ce_displayElement.onblur = onInputBlur;
      ce_displayElement.onclick = () => !pickerVisible && onInputFocus();
      ce_displayElement.onkeydown = onKeyDown;
    }
  });
</script>

<span class="std-component-wrap">
{#if !ce_displayElement}
  <input type="hidden" {name} {value}>
  <input bind:this={inputEl} type={pickerOnly ? "hidden" : "text"}
    id={inputId}
    tabindex="0"
    name={name.endsWith(']') ? name.substring(0, name.length-1) + '_input]' : name + '_input'} {disabled} {required} value={displayValue} {placeholder}
    autocomplete="off"
    inputmode="none"
    class={inputClasses}
    readonly={isFocused}
    use:inputAction={inputActionParams}
    on:focus={onInputFocus}
    on:blur={onInputBlur}
    on:click={() => {
      !pickerVisible && onInputFocus();
    }}
    on:input
    on:change
    on:keydown={onKeyDown}
  />
{/if}
{#if pickerVisible && isFocused }
  <div
    class="std-calendar-wrap {theme}" class:is-popup={!internalVisibility} class:is-range-wrap={isRange}
    transition:fadeFn|local={{ duration: 200 }}
    use:positionPopup
    on:mousedown|preventDefault
  >
  <!-- {#each widgetCount as w (w)} -->
    {#if currentMode === "date"}
      <Calendar
        dates={innerDates}
        {isRange}
        startDate={parsedStartDate}
        endDate={parsedEndDate}
        enableTimeToggle={resolvedMode?.includes("time")}
        initialView={startView > 2 ? 2 : startView}
        bind:this={calendarEl}
        {i18n}
        {weekStart}
        on:date={onDate}
        on:switch={onModeSwitch}
      />
      {#if todayBtn || clearBtn}
        <div class="std-btn-row">
          {#if todayBtn}
            <button type="button"
              on:click={onToday}
              class={todayBtnClasses}
              disabled={isTodayDisabled}
              >{i18n.todayBtn}</button
            >
          {/if}
          {#if clearBtn && !required}
            <button type="button"
              on:click={onClear}
              class={clearBtnClasses}
              disabled={innerDates.length === 0}>{i18n.clearBtn}</button
            >
          {/if}
        </div>
      {/if}
    {:else}
      <Time
        date={innerDates[0]}
        startDate={parsedStartDate}
        endDate={parsedEndDate}
        hasDateComponent={resolvedMode !== "time"}
        bind:this={timeEl}
        showMeridian={format.match(formatType === 'php' ? 'a|A' : 'p|P') !== null}
        {i18n}
        {minuteIncrement}
        on:time={onDate}
        on:switch={onModeSwitch}
        on:close={onTimeClose}
        on:time-switch={onTimeSwitch}
      />
    {/if}
  <!-- {/each} -->
  </div>
{/if}
</span>


<style>
  .sdt-calendar-colors {
    --sdt-primary: #286090;
    --sdt-color: #000;
    --sdt-bg-main: #fff;
    --sdt-bg-today: var(--sdt-primary);
    --sdt-bg-clear: #dc3545;
    --sdt-today-bg: #1e486d;
    --sdt-clear-color: #dc3545;
    --sdt-btn-bg-hover: #eee;
    --sdt-btn-header-bg-hover: #dfdfdf;
    --sdt-clock-bg: #eeeded;
    --sdt-shadow: #ccc;
    --sdt-disabled-date: #b22222;
  }
  .std-component-wrap {
    position: relative;
    display: inline;
  }
  .std-calendar-wrap {
    width: 280px;
    background-color: var(--sdt-bg-main);
    box-shadow: 0 1px 6px var(--sdt-shadow);
    border-radius: 4px;
    padding: 0.25rem 0.25rem 0.5rem;
    color: var(--sdt-color);
  }
  /* FUTURE: */
  /* .std-calendar-wrap.is-range-wrap {
    width: 560px;
    display: flex;
    gap: 0.5rem;
  } */
  .std-calendar-wrap.is-popup {
    position: absolute;
    box-shadow: 0 1px 6px var(--sdt-shadow);
    z-index: 100;
  }
  .std-btn-row {
    margin-top: 0.5rem;
    display: flex;
    justify-content: space-evenly;
  }
  .sdt-action-btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    border-radius: 0.2rem;
  }
  .sdt-today-btn {
    background-color: var(--sdt-primary);
    color: var(--sdt-today-color, var(--sdt-bg-main));
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    border-radius: 0.2rem;
    border: 1px solid var(--sdt-today-bg);
  }
  .sdt-today-btn[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .sdt-today-btn:focus,
  .sdt-today-btn:active,
  .sdt-today-btn:hover:not([disabled]) {
    background-color: var(--sdt-today-bg);
  }
  .sdt-clear-btn {
    border: 1px solid var(--sdt-clear-color);
    background-color: transparent;
    color: var(--sdt-clear-color);
  }
  .sdt-clear-btn:focus,
  .sdt-clear-btn:active:not([disabled]),
  .sdt-clear-btn:hover:not([disabled]) {
    background-color: var(--sdt-clear-color);
    color: var(--sdt-clear-hover-color, var(--sdt-bg-main));
  }
</style>
