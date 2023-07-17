<script context="module">
  import settings from "../settings";
  export const config = settings;
</script>

<script>
  /**
   * TODO: handle displayFormat change dynamically
   * TODO: remove todayBtn, clearBtn
   * TODO: fix keyboard navigation (Enter, Esc)
   * TODO: onClear should reset also calendar's inner selection
  */

  import { createEventDispatcher, onMount, tick } from "svelte";
  import { fade } from "svelte/transition";
  import Calendar from "./Calendar.svelte";
  import Time from "./Time.svelte";
  import { formatDate, parseDate } from "$lib/utils/dateUtils";
  import { usePosition } from "$lib/utils/actions.js";
  import { computeResolvedMode, initProps } from "$lib/utils/state";
  import { MODE_MONTH, STARTVIEW_TIME } from "$lib/utils/constants";

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
  /** @type {'auto'|'date'|'datetime'|'time'} */
  export let mode = 'auto';
  /** ************************************ 👇 configurable globally */
  /** @type {string} */
  export let theme = config.theme;
  /** @type {string} */
  export let format = config.format;
  /** @type {string} */
  export let formatType = config.formatType;
  /** @type {string|null} */
  export let displayFormat = config.displayFormat;
  /** @type {string|null} */
  export let displayFormatType = config.displayFormatType;
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
  /** ************************************ custom-element elements */
  /** @type {HTMLInputElement|null} */
  export let ce_valueElement = null;
  /** @type {HTMLInputElement|null} */
  export let ce_displayElement = null;

  const dispatch = createEventDispatcher();

  let { valueArray, prevValue, innerDates } = initProps(value, initialDate, format, i18n, formatType);
  
  let currentFormat = format;
  let isFocused = pickerOnly;
  let undoHistory = [...valueArray];
  let currentAutocloseThreshold = 0;
  let currentValue = computeStringValue();
  let displayValue = computeDisplayValue();
  /** @type {number?} as a timestamp */
  let calendarHoverDate;
  $: pickerVisible = pickerOnly;  
  $: parsedStartDate = startDate ? parseDate(startDate, format, i18n, formatType) : null;
  $: parsedEndDate = endDate ? new Date(parseDate(endDate, format, i18n, formatType).setSeconds(1)) : null;
  $: isTodayDisabled = (parsedStartDate && parsedStartDate > new Date()) || (parsedEndDate && parsedEndDate < new Date());
  
  $: fadeFn = pickerOnly ? () => ({}) : fade;

  // FUTURE:
  $: widgetCount = isRange ? [0,1] : [0];
  let currentMode = startView === STARTVIEW_TIME ? "time" : "date";
  let isMinuteView = false;
  let ref_input = ce_displayElement;
  /** @type {function|function} */
  let inputAction = validatorAction ? validatorAction.shift() : () => {};
  /** @type {any} */
  let inputActionParams = validatorAction || [];
  /** @type {Calendar} */
  let ref_calendar;
  /** @type {Time} */
  let ref_time;
  
  
  $: resolvedMode = computeResolvedMode(mode, format);
  $: {
    if (resolvedMode === 'time' && currentMode !== resolvedMode) {
      currentMode = resolvedMode;
    }
  }
  // autoclose is supported only for 'date' range picker
  $: autocloseThreshold = isRange
    ? 2
    : (resolvedMode === 'date'
      ? 1
      : (resolvedMode === 'datetime'
        ? 3
        : 2
      )
    );
  $: autocloseSupported = autoclose && ((isRange && resolvedMode === 'date') || !isRange);
  $: doAutoclose = autocloseSupported && currentAutocloseThreshold === autocloseThreshold;
  $: {  // custom-element ONLY
    if (ce_displayElement) ce_displayElement.readOnly = isFocused;
  }
  $: internalVisibility = pickerOnly ? true : false;
  $: positionPopup = !pickerOnly ? usePosition : () => {};
  $: isDirty = computeDirty(valueArray);
  // : 🔍 check this
  $: {
    let valueChanged = false;
    if (valueArray.join('') !== prevValue.join('')) {
      innerDates = valueArray.map(val => parseDate(val, format, i18n, formatType));
      prevValue = valueArray;
      valueChanged = true;
      currentValue = computeStringValue();
      displayValue = computeDisplayValue();
    }
  // TODO: rethink this to prevent cyclical dependency
    // update value on format change
    if (currentFormat !== format && innerDates.length) {
      valueArray = innerDates.map(date => formatDate(date, format, i18n, formatType));
      prevValue = valueArray;
      displayValue = computeDisplayValue();
      currentFormat = format;
      if (mode === "auto") {
        resolvedMode =
          format.match(/g|hh?|ii?/i) && format.match(/y|m|d/i)
            ? "datetime"
            : format.match(/g|hh?|ii?/i)
            ? "time"
            : "date";
      }
      currentValue = computeStringValue();
      onValueSet(true);
    }
    // if (valueChanged && isRange && prevValue.length !== 2) {
    //   valueChanged = false;
    // }
    // if (autoclose && ((isRange && resolvedMode === 'date') || !isRange)) {
    //   value = isRange 
    //     ? (valueChanged ? prevValue : null) // for range set value only when full
    //     : (prevValue[0] || null);
    // }
    // autoclose && ((isRange && resolvedMode === 'date') || !isRange) && tick().then(() => dispatchInputEvent(valueChanged)); // tick for display value update
  }

  // TODO: isn't this being handled by `resetView`?
  $: if (!pickerVisible) isMinuteView = false;
  
  /**
   * Convert value to display value
   * @returns {string}
  */
  function computeDisplayValue() {
    return innerDates
      .map(innerDate => formatDate(innerDate, displayFormat || format, i18n, displayFormatType || formatType))
      .sort()
      .join(' - ');
  }

  /**
   * @returns {string[]|string|null}
  */
  function computeValue() {
    return isRange 
      ? (valueArray.length === 2 ? valueArray : null) // for range set value only when full
      : (valueArray[0] || null);
  }

  function computeStringValue() {
    return valueArray.join('');
  }

  /**
   * @param {string[]} values
   * @returns {boolean}
  */
  function computeDirty(values) {
    return values.join('') !== undoHistory.join('');
  }
  
  function resetView() {
    startView = MODE_MONTH;
    isMinuteView = false;
    currentAutocloseThreshold = 0;
    if (!pickerOnly) pickerVisible = false;
    if (resolvedMode !== 'time') currentMode = "date";
  }

  /** @type {string} */
  let eventType; 
  $: watchEventType(eventType);

  /**
   * @param {string} eventType
   */
  function watchEventType(eventType) {
    if (eventType === 'date' && resolvedMode === 'datetime' && ((isRange && valueArray.length === 2) || !isRange)) {
      currentMode = 'time';
    } else if (eventType === 'hour') {
      ref_time && ref_time.showMinuteView();
    } else if (eventType === 'minute' && !isRange && resolvedMode === 'datetime' && autoclose) {
      currentMode = 'date';
    }
  }

  /** 
   * @typedef {object} CalendarDetail
   * @property {Date?} value
   * @property {boolean} isKeyboard
   * @property {number} [dateIndex=0]
   * 
   * @param {CustomEvent<CalendarDetail>} event
   */
  function onDate({ type, detail }) {
    let { value, isKeyboard, dateIndex } = detail;
    
    if (value && !isRange && innerDates.length) {
      if (
        innerDates[0].getFullYear() === value.getFullYear() &&
        innerDates[0].getMonth() === value.getMonth() &&
        innerDates[0].getDate() === value.getDate() &&
        resolvedMode === "date" &&
        !required
      )
        value = null;
    }
    // standard
    if (isRange) {
      // need to keep daterange sorted
      if (type === 'date') {
        innerDates = value
          ? (innerDates.length === 2 ? [value] : innerDates.concat(value))
            .map(date => date.getTime())
            .sort().map(ts => new Date(ts))
          : [];
      } else if (value && dateIndex !== undefined) {
        innerDates[dateIndex] = value;
      } else {
        throw new Error('Invalid event type');
      }
      valueArray = innerDates.map(date => formatDate(date, format, i18n, formatType));
    } else {
      // single select
      innerDates = value ? [value] : [];
      valueArray = value ? [formatDate(value, format, i18n, formatType)] : [];
    }
    if (!isKeyboard) {
      eventType = type;
    }
  }

  /**
   * Set value and hide picker (calls `resetView` inside)
   * @param {boolean?} [doResetView]
  */
  function onValueSet(doResetView) {
    value = computeValue();
    currentValue = computeStringValue();
    undoHistory = [...valueArray];
    displayValue = computeDisplayValue();
    isDirty = computeDirty(valueArray);
    dispatchInputEvent(true);
    dispatch("change", isRange ? valueArray : (valueArray[0] || null));    // change is dispatched on user interaction
    doResetView && resetView();
  }

  function onToday() {
    const now = new Date();
    const innerDate = innerDates[0] || now;
    onDate(new CustomEvent(resolvedMode, {
      detail: {
        value: new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          innerDate.getHours(),
          innerDate.getMinutes(),
          0
        ),
        isKeyboard: false
      }
    }));
    onValueSet(true);
  }

  // FIXME: fix
  function onClear() {
    valueArray = [];
    prevValue = [];
    innerDates = [];
    currentValue = '';
    onValueSet();
  }

  /**
   * Dismiss any edits
   * FIXME: Calendar 'inernalDate' is not re-set
   */
   function onCancel() {
    valueArray = [...undoHistory];
    currentValue = computeStringValue();
    resetView();
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
        if (isRange) return;
        if (currentMode === "date") {
          ref_calendar.handleGridNav(e.key, e.shiftKey);
        } else {
          ref_time.makeTick(
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
        // FIXME: fix enter behaviour
        isFocused && e.preventDefault();
        if (valueArray.length === 0) {
          pickerVisible = false;
          return;
        }
        if (currentMode === "time" && !isMinuteView) {
          return ref_time.showMinuteView();
        }
        // if (isFocused && resolvedMode === "date") pickerVisible = false;
        // // TODO: handle change to time on range picker?
        // if (innerDates && resolvedMode.includes("time")) {
        //   currentMode = "time";
        // }
        if (resolvedMode === 'datetime' && currentMode !== 'time') {
          currentMode = 'time';
          return;
        }
        onValueSet(resolvedMode === 'date' || (resolvedMode.includes('time') && isMinuteView)); // just temporary

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
    autoclose && resetView();
  }

  function onInputFocus() {
    isFocused = true;
    pickerVisible = true;
  }

  function onInputBlur() {
    isFocused = false;
    autocloseSupported ? onValueSet(false) : onCancel();
    !ce_displayElement && dispatch("blur");
  }

  /**
   * TODO: investigate workflow for this
   * 
   * @param {boolean} dispatchInputEvent
   */
  function dispatchInputEvent(dispatchInputEvent) {
    if (ce_valueElement && ce_displayElement) {
      ce_valueElement.value = valueArray.join(',') || '';
      ce_displayElement.value = displayValue;
      ce_valueElement.dispatchEvent(new Event('input'));
      ce_displayElement.dispatchEvent(new Event('input'));
    }
    dispatchInputEvent && dispatch("input", value);
  }

  /**
   * @param {CustomEvent} event
  */
  function updateCalendarHoverDate({ detail }) {
    calendarHoverDate = detail;
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
  {#if !pickerOnly}
  <input bind:this={ref_input} type={pickerOnly ? "hidden" : "text"}
    id={inputId}
    tabindex="0"
    name={name.endsWith(']') ? name.substring(0, name.length-1) + '_input]' : name + '_input'}
    class:value-dirty={!autoclose && isDirty}
    value={displayValue}
    {placeholder} {disabled} {required}
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
{/if}
{#if pickerVisible && isFocused }
  <div
    class="std-calendar-wrap {theme}" class:is-popup={!internalVisibility} class:is-range-wrap={isRange}
    transition:fadeFn|local={{ duration: 200 }}
    use:positionPopup
    on:mousedown|preventDefault
  >
  <div class="sdt-widget-wrap">
  {#each widgetCount as w (w)}
    <div class="sdt-widget">
    {#if currentMode === "date"}
      <Calendar
        wid={w}
        dates={innerDates}
        {isRange}
        startDate={parsedStartDate}
        endDate={parsedEndDate}
        enableTimeToggle={resolvedMode?.includes("time")}
        initialView={startView > 2 ? 2 : startView}
        hoverDate={calendarHoverDate}
        bind:this={ref_calendar}
        {i18n}
        {weekStart}
        on:date={onDate}
        on:switch={onModeSwitch}
        on:internal_hoverUpdate={updateCalendarHoverDate}
      />
      {#if todayBtn || clearBtn}
        <div class="sdt-btn-row">
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
        wid={w}
        date={innerDates[w]}
        startDate={parsedStartDate}
        endDate={parsedEndDate}
        hasDateComponent={resolvedMode !== "time"}
        bind:this={ref_time}
        showMeridian={format.match(formatType === 'php' ? 'a|A' : 'p|P') !== null}
        {i18n}
        {minuteIncrement}
        on:hour={onDate}
        on:minute={onDate}
        on:switch={onModeSwitch}
        on:close={onTimeClose}
        on:time-switch={onTimeSwitch}
      />
    {/if}
    </div>
    {/each}
  </div>
  {#if !autocloseSupported}
  <slot name="action-row">
    <div class="sdt-btn-row" style="--sdt-justify-btn-row: flex-end">
      <button type="button" class="sdt-action-btn sdt-clear-btn" on:click={onCancel}>Cancel</button>
      <button type="button" class="sdt-action-btn sdt-today-btn" on:click={() => onValueSet(true)}>Ok</button>
    </div>
  </slot>
  {/if}
  </div> <!-- END: popup -->
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
  .std-calendar-wrap.is-range-wrap {
    width: 560px;
  }
  .sdt-widget-wrap {
    display: flex;
    gap: 0.5rem;
    justify-content: stretch;
  }
  .sdt-widget {
    flex: 1;
  }
  .value-dirty {
    color: color-mix(in srgb, black 50%, currentColor);
  }
  .std-calendar-wrap.is-popup {
    position: absolute;
    box-shadow: 0 1px 6px var(--sdt-shadow);
    z-index: 100;
  }
  .sdt-btn-row {
    margin-top: 0.5rem;
    display: flex;
    gap: 0.5rem;
    justify-content: var(--sdt-justify-btn-row, space-evenly);
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
