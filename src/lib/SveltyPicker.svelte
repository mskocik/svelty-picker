<script context="module">
  import settings from "./settings";
  // your script goes here
  export const config = settings;
</script>

<script>
  import { createEventDispatcher, tick } from "svelte";
  import { fade } from "svelte/transition";
  import Calendar from "$lib/Calendar.svelte";
  import Time from "$lib/Time.svelte";
  import { formatDate, parseDate, UTCDate } from "$lib/dateUtils";
  import { usePosition } from "$lib/utils";

  // html

  /**
   * @type {string}
   */
  export let name = "date";
  /**
   * @type {bool}
   */
  export let disabled = false;
  /**
   * @type {string|null|undefined}
   */
  export let placeholder = null;
  /**
   * @type {bool}
   */
  export let required = false;
  // dates
  /**
   * @type {string|null}
   */
  export let value = null;
  /**
   * @type {Date|null}
   */
  export let initialDate = null;
  /**
   * @type {Date | null}
   */
  let startDate = null;
  /**
   * @type {Date | null}
   */
  export let endDate = null;
  export let pickerOnly = false;
  // configurable globally
  export let theme = config.theme;
  export let mode = config.mode;
  export let format = config.format;
  export let formatType = config.formatType;
  export let weekStart = config.weekStart;
  export let visible = config.visible;
  export let inputClasses = config.inputClasses;
  export let todayBtnClasses = config.todayBtnClasses;
  export let clearBtnClasses = config.clearBtnClasses;
  export let todayBtn = config.todayBtn;
  export let clearBtn = config.clearBtn;
  export let clearToggle = config.clearToggle;
  export let autoclose = config.autoclose;
  export let i18n = config.i18n;
  // actions
  export let positionFn = usePosition;
  export let validatorAction = null;
  export function setDateValue(val) {
    innerDate = parseDate(val, format, i18n, formatType);
  }

  if (format === "yyyy-mm-dd" && mode === "time") {
    format = "hh:ii";
  }

  const dispatch = createEventDispatcher();
  if (value) value = value.replace(/(:\d+):\d+/, "$1") // strip seconds if present in initial value
  let prevValue = value;
  let currentFormat = format;
  let innerDate = initialDate && initialDate instanceof Date
      ? parseDate(initialDate)
      : (value 
        ? parseDate(value, format, i18n, formatType)
        : null
      );
  if (innerDate && initialDate) {
    value = formatDate(innerDate, format, i18n, formatType);
  }
  let isFocused = pickerOnly;
  let inputEl = null;
  let inputRect = null;
  let inputAction = validatorAction ? validatorAction.shift() : () => {};
  let inputActionParams = validatorAction || [];
  let calendarEl = null;
  let timeEl;
  let preventClose = false;
  let preventCloseTimer = null;
  let resolvedMode = null;
  let currentMode = resolvedMode === "time" ? "time" : "date";
  $: {
    resolvedMode = mode === "auto"
      ? format.match(/hh?|ii?/i) && format.match(/y|m|d/i)
        ? "datetime"
        : format.match(/hh?|ii?/i)
        ? "time"
        : "date"
      : mode;
    if (resolvedMode === 'time' && currentMode !== resolvedMode) {
      currentMode = resolvedMode;
    }
  }

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
      if (mode === "auto") {
        resolvedMode =
          format.match(/hh?|ii?/i) && format.match(/y|m|d/i)
            ? "datetime"
            : format.match(/hh?|ii?/i)
            ? "time"
            : "date";
      }
    }
  }

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
      onBlur(false);
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
      inputEl.dispatchEvent(new Event("input"));
      dispatch("change", value);
    });
  }

  function onToday() {
    const today = new Date();
    if (startDate && parseDate(startDate, format, i18n, formatType) < today)
      return;
    const todayHours = innerDate ? innerDate.getHours() : today.getHours();
    const todayMinutes = innerDate
      ? innerDate.getMinutes()
      : today.getMinutes();
    onDate({
      detail: UTCDate(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        todayHours,
        todayMinutes,
        0
      ),
    });
  }

  function onClear() {
    onDate({ detail: null });
  }

  function onFocus() {
    inputRect = inputEl.getBoundingClientRect();
    isFocused = true;
  }

  function onKeyDown(e) {
    if (!isFocused) {
      ["Backspace", "Delete"].includes(e.key) && onClear();
      if (e.key !== "Enter") return onFocus();
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
        if (isFocused && !internalVisibility) {
          isFocused = false;
        }
        break;
      case "Backspace":
      case "Delete":
        onClear();
        break;
      case "Enter":
        isFocused && e.preventDefault();
        if (currentMode === "time") {
          if (!timeEl.minuteSwitch()) {
            return timeEl.minuteSwitch(true);
          }
          return onBlur(false);
        }
        if (isFocused && resolvedMode === "date") isFocused = false;
        if (innerDate && resolvedMode.includes("time")) {
          currentMode = "time";
        }
        break;
      case "Tab":
      case "F5":
        break;
      default:
        e.preventDefault();
    }
  }

  function onModeSwitch(e) {
    currentMode = e.detail;
  }

  function onTimeClose() {
    autoclose && !preventClose && !pickerOnly && onBlur(false);
  }

  function onBlur(e) {
    isFocused = false;
    if (resolvedMode.includes("date")) currentMode = "date";
    e && dispatch("blur");
  }
</script>

<input
  type={pickerOnly ? "hidden" : "text"}
  {name}
  bind:this={inputEl}
  use:inputAction={inputActionParams}
  autocomplete="off"
  {disabled}
  {placeholder}
  class={inputClasses}
  {required}
  readonly={isFocused}
  {value}
  on:focus={onFocus}
  on:blur={onBlur}
  on:click={() => {
    !isFocused && onFocus();
  }}
  on:input
  on:change
  on:keydown={onKeyDown}
/>
{#if visible || isFocused}
  <div
    class="std-calendar-wrap is-popup {theme}"
    transition:fade|local={{ duration: 200 }}
    use:positionFn={{ inputEl, visible: internalVisibility, inputRect }}
    on:mousedown|preventDefault
  >
    {#if currentMode === "date"}
      <Calendar
        date={innerDate}
        startDate={startDate
          ? parseDate(startDate, format, i18n, formatType)
          : null}
        endDate={endDate ? parseDate(endDate, format, i18n, formatType) : null}
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
              disabled={startDate >
                formatDate(new Date(), format, i18n, formatType)}
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
        hasDateComponent={resolvedMode !== "time"}
        bind:this={timeEl}
        showMeridian={format.match("p|P")}
        {i18n}
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
    --sdt-clock-bg-minute: rgb(238, 237, 237, 0.25);
    --sdt-clock-bg-shadow: 0 0 128px 2px #ddd inset;
    --sdt-shadow: #ccc;
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
    opacity: 0.75;
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
