<script context="module">
  import settings from "../utils/settings";
  // your script goes here
  export const config = settings;
</script>

<script>
  import { createEventDispatcher, onMount, tick } from "svelte";
  import { fade } from "svelte/transition";
  import Calendar from "./Calendar.svelte";
  import Time from "./Time.svelte";
  import { formatDate, parseDate } from "../utils/dateUtils";
  import { usePosition } from "../utils/utils";

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
  /** @type {HTMLInputElement|null} */
  export let inputElement = null;
  /** @type {string|null} */
  export let value = null;
  /** @type {Date|null} */
  export let initialDate = null;
  /** @type {Date | string | null} */
  export let startDate = null;
  /** @type {Date | null} */
  export let endDate = null;
  /** @type {boolean} */
  export let pickerOnly = false;
  /** ************************************ 👇 configurable globally */
  /** @type {string} */
  export let theme = config.theme;
  /** @type {string} */
  export let mode = config.mode;
  /** @type {string} */
  export let format = config.format;
  /** @type {string} */
  export let formatType = config.formatType;
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
  export let clearToggle = config.clearToggle;
  /** @type {boolean} */
  export let autoclose = config.autoclose;
  /** @type {i18nType} */
  export let i18n = config.i18n;
  // actions
  export let positionFn = usePosition;
  /** @type {Array<any>|null} */
  export let validatorAction = null;
  /** @param {string} val */
  export function setDateValue(val) {
    innerDate = parseDate(val, format, i18n, formatType);
  }

  const dispatch = createEventDispatcher();
  if (value) value = value.replace(/(:\d+):\d+/, "$1") // strip seconds if present in initial value
  let selectedTimeType = 'hour';
  let prevValue = value;
  let currentFormat = format;
  let innerDate = initialDate && initialDate instanceof Date
      ? initialDate
      : (value 
        ? parseDate(value, format, i18n, formatType)
        : null
      );
  if (innerDate && initialDate) {
    value = formatDate(innerDate, format, i18n, formatType);
  }
  $: parsedStartDate = startDate ? parseDate(startDate, format, i18n, formatType) : null;
  $: parsedEndDate = endDate ? new Date(parseDate(endDate, format, i18n, formatType).setSeconds(1)) : null;
  // @ts-ignore
  $: isTodayDisabled = (parsedStartDate && parsedStartDate > new Date()) || (parsedEndDate && parsedEndDate < new Date());
  let isFocused = pickerOnly;
  $: pickerVisible = pickerOnly;
  $: fadeFn = pickerOnly ? () => {} : fade;
  let inputEl = inputElement;
  /** @type {DOMRect|null} */
  let inputRect = null;
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
  let resolvedMode = '';
  let currentMode = resolvedMode === "time" ? "time" : "date";
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
    if (inputElement) inputElement.readOnly = isFocused;
  }
  $: internalVisibility = pickerOnly ? true : false;
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
      if (mode === "auto") {
        resolvedMode =
          format.match(/g|hh?|ii?/i) && format.match(/y|m|d/i)
            ? "datetime"
            : format.match(/g|hh?|ii?/i)
            ? "time"
            : "date";
      }
    }
  }

  function resetView() {
    if (!pickerOnly) pickerVisible = false;
    if (resolvedMode !== 'time') currentMode = "date";
  }

  /** 
   * @param {CustomEvent} e
   */
  function onDate(e) {
    let setter = e.detail || null;
    if (e.detail && innerDate) {
      if (
        innerDate.getFullYear() === e.detail.getFullYear() &&
        innerDate.getMonth() === e.detail.getMonth() &&
        innerDate.getDate() === e.detail.getDate() &&
        resolvedMode === "date" &&
        clearToggle
      )
        setter = null;
    }
    value = setter ? formatDate(setter, format, i18n, formatType) : null;
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
      if (inputElement) inputElement.value = value || '';
      inputEl && inputEl.dispatchEvent(new Event("input"));
      let type = e.type;
      if (type === 'time') {
        if (selectedTimeType !== 'hour') {
          type = 'minute';
          selectedTimeType = 'hour';
        } else {
          type = 'hour';
          selectedTimeType = 'minute';
        }
      }
      dispatch("change", {'type': type, 'value': value});
    });
  }

  function onToday() {
    const today = new Date();
    if (parsedStartDate && parsedStartDate > today) return;

    const todayHours = innerDate ? innerDate.getHours() : today.getHours();
    const todayMinutes = innerDate
      ? innerDate.getMinutes()
      : today.getMinutes();
    onDate(new CustomEvent('today', {
      detail: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        todayHours,
        todayMinutes,
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
      ["Backspace", "Delete"].includes(e.key) && onClear();
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
        onClear();
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
        if (innerDate && resolvedMode.includes("time")) {
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
    currentMode = e.detail;
  }

  function onTimeClose() {
    autoclose && !preventClose && resetView();
  }

  function onInputFocus() {
    inputRect = inputEl && inputEl.getBoundingClientRect();
    isFocused = true;
    pickerVisible = true;
  }

  function onInputBlur() {
    isFocused = false;
    pickerVisible = false;
    !inputElement && dispatch("blur");
  }

  /**
   * initialization for custom element
  */
  onMount(() => {
    if (inputElement) {
      inputElement.onfocus = onInputFocus;
      inputElement.onblur = onInputBlur;
      inputElement.onclick = () => !pickerVisible && onInputFocus();
      inputElement.onkeydown = onKeyDown;
    }
  });
</script>

{#if !inputElement}
<input bind:this={inputEl} type={pickerOnly ? "hidden" : "text"}
  id={inputId}
  tabindex="0"
  {name} {disabled} {required} {value} {placeholder}
  autocomplete="off"
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
    class="std-calendar-wrap is-popup {theme}"
    transition:fadeFn|local={{ duration: 200 }}
    use:positionFn={{ inputEl, visible: internalVisibility, inputRect }}
    on:mousedown|preventDefault
  >
    {#if currentMode === "date"}
      <Calendar
        date={innerDate}
        startDate={parsedStartDate}
        endDate={parsedEndDate}
        enableTimeToggle={resolvedMode?.includes("time")}
        bind:this={calendarEl}
        {i18n}
        {weekStart}
        on:date={onDate}
        on:switch={onModeSwitch}
      />
      {#if todayBtn || clearBtn}
        <div class="std-btn-row">
          {#if todayBtn}
            <button
              on:click={onToday}
              class={todayBtnClasses}
              disabled={isTodayDisabled}
              >{i18n.todayBtn}</button
            >
          {/if}
          {#if clearBtn}
            <button
              on:click={onClear}
              class={clearBtnClasses}
              disabled={!innerDate}>{i18n.clearBtn}</button
            >
          {/if}
        </div>
      {/if}
    {:else}
      <Time
        date={innerDate}
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
      />
    {/if}
  </div>
{/if}

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
  .std-calendar-wrap {
    width: 280px;
    background-color: var(--sdt-bg-main);
    box-shadow: 0 1px 6px var(--sdt-shadow);
    border-radius: 4px;
    padding: 0.25rem 0.25rem 0.5rem;
    color: var(--sdt-color);
  }
  .std-calendar-wrap.is-popup {
    box-shadow: 0 1px 6px var(--sdt-shadow);
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
