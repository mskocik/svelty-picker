<script context="module">
  import settings from "../settings.js";
  export const config = settings;
</script>

<script>
  /**
   * TODO: handle displayFormat change dynamically
   * TODO: properly handle 'clear' when `autocommit` is `false (make it undoable)
  */
  import { createEventDispatcher, onMount, tick } from "svelte";
  import { fade } from "svelte/transition";
  import Calendar from "./Calendar.svelte";
  import Time from "./Time.svelte";
  import { formatDate, parseDate } from "$lib/utils/dateUtils.js";
  import { usePosition } from "$lib/utils/actions.js";
  import { computeResolvedMode, initProps } from "$lib/utils/state.js";
  import { MODE_MONTH, STARTVIEW_TIME } from "$lib/utils/constants.js";

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
  /** @type {?function(Date): boolean} */
  export let disableDatesFn = null;

  export let manualInput = false;
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
  export let clearToggle = config.clearToggle;
  /** @type {boolean} */
  export let autocommit = config.autocommit;
  /** @type {boolean} */
  export let hourOnly = config.hourOnly;
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
  // properly set value from initialDate
  if (!value && initialDate) value = isRange ? valueArray : valueArray[0];
  let currentFormat = format;
  let isFocused = pickerOnly;
  let undoHistory = [...valueArray];
  let currentValue = computeStringValue();
  let displayValue = computeDisplayValue();
  /** @type {number?} as a timestamp */
  let calendarHoverDate;
  $: pickerVisible = pickerOnly;
  $: parsedStartDate = startDate ? parseDate(startDate, format, i18n, formatType) : null;
  $: parsedEndDate = endDate ? new Date(parseDate(endDate, format, i18n, formatType).setSeconds(1)) : null;
  $: isTodayDisabled = (parsedStartDate && parsedStartDate > new Date()) || (parsedEndDate && parsedEndDate < new Date());

  $: fadeFn = pickerOnly ? () => ({}) : fade;

  let currentMode = startView === STARTVIEW_TIME ? "time" : "date";
  let isMinuteView = false;
  let ref_input = ce_displayElement;
  /** @type {function|function} */
  let inputAction = validatorAction ? validatorAction.shift() : () => {};
  /** @type {any} */
  let inputActionParams = validatorAction || [];
  /** @type {Calendar} */
  let ref_calendar;
  $: widgetList = watchIsRange(isRange);
  $: resolvedMode = computeResolvedMode(mode, format);
  $: {
    if (resolvedMode === 'time' && currentMode !== resolvedMode) {
      currentMode = resolvedMode;
    }
  }
  /** @type {string} */
  let eventType;
  $: autocloseSupported = autocommit && ((isRange && resolvedMode === 'date') || !isRange);
  $: doAutoCommit = computeAutoclose(autocommit, isRange, resolvedMode, eventType, valueArray, hourOnly);
  $: {  // custom-element ONLY
    if (ce_displayElement) ce_displayElement.readOnly = isFocused;
  }
  $: internalVisibility = pickerOnly ? true : false;
  $: positionPopup = !pickerOnly ? usePosition : () => {};
  $: isDirty = computeDirty(valueArray);
  $: watchExternalValueChange(value);
  $: watchValueChange(valueArray);
  $: watchFormatChange(format, displayFormat);

  /**
   * @param {boolean} autoCommit
   * @param {boolean} isRange
   * @param {string} resolvedMode
   * @param {string} eventType
   * @returns {boolean}
   */
  function computeAutoclose(autoCommit, isRange, resolvedMode, eventType, valueArray, hourOnly) {
    if (!autoCommit) return false; // no doubt

    if (isRange && (resolvedMode === 'datetime' || valueArray.length !== 2)) return false;

    return eventType === 'minute' || resolvedMode === eventType || (hourOnly && eventType === 'hour');
  }

  /**
   * @param {string[]} valueArray
   */
  function watchValueChange(valueArray) {
    if (valueArray.join('') !== prevValue.join('')) {
      innerDates = valueArray.filter(e => e).map(val => parseDate(val, format, i18n, formatType));
      prevValue = valueArray;
      currentValue = computeStringValue();
      displayValue = computeDisplayValue();
    }
  }

  /**
   * @param {string} passedValue
   */
  function watchExternalValueChange(passedValue) {
    const stringValue = Array.isArray(passedValue) ? passedValue.join(',') : passedValue;
    if (currentValue !== stringValue) {
      valueArray = (stringValue || '').split(',');
      undoHistory = valueArray;
    }
  }

  /**
   * @param {string} format
   * @param {string|null} displayFormat - not used, but included to track also its' changes
   */
  function watchFormatChange(format, displayFormat) {
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
  }

  /**
   * Convert value to display value
   * @returns {string}
  */
  function computeDisplayValue() {
    return innerDates
      .sort((date1, date2) => date1 - date2)
      .map(innerDate => formatDate(innerDate, displayFormat || format, i18n, displayFormatType || formatType))
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
    return valueArray.join(',');
  }

  /**
   * @param {string[]} values
   * @returns {boolean}
  */
  function computeDirty(values) {
    return values.join(',') !== undoHistory.join(',');
  }
  function resetView() {
    startView = MODE_MONTH;
    isMinuteView = false;
    // postpone it to prevent blink on picker fade
    if (resolvedMode === 'datetime') {
      setTimeout(() => {
        if (!pickerOnly) pickerVisible = false;
         currentMode = "date";
      }, autocommit ? 300 : 0);
    } else {
      if (!pickerOnly) pickerVisible = false;
    }
  }

  /**
   * @typedef {object} TimeRef
   * @property {Time?} ref
   *
   * @param {boolean} isRange
   * @returns {TimeRef[]}
  */
  function watchIsRange(isRange) {
    return isRange ? [{ref: null}, {ref: null}] : [{ref: null}];
  }

  /**
   * @param {string} eventType
   * @param {number} lastTimeId
   */
  function watchEventType(eventType, lastTimeId) {
    if (eventType === 'date' && resolvedMode === 'datetime' && ((isRange && valueArray.length === 2) || !isRange)) {
      currentMode = 'time';
    } else if (eventType === 'hour' && !hourOnly) {
      // @ts-ignore
      widgetList[lastTimeId].ref.showMinuteView();
    } else if (eventType === 'minute' && !isRange && resolvedMode === 'datetime' && doAutoCommit) {
      // currentMode = 'date';
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
        resolvedMode === "date" && !required && clearToggle
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
      } else if (type === 'datetime') {
        innerDates[0] = value;
        innerDates[1] = value;
      } else {
        throw new Error(`Unhandled event type: '${type}'`);
      }
      valueArray = innerDates.map(date => formatDate(date, format, i18n, formatType));
    } else {
      // single select
      innerDates = value ? [value] : [];
      valueArray = value ? [formatDate(value, format, i18n, formatType)] : [];
    }
    if (!isKeyboard) {
      eventType = type;
      watchEventType(type, dateIndex || 0);
    }
    tick().then(() => doAutoCommit && onValueSet(!isKeyboard));
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
    dispatch("dateChange", {
      value: isRange ? valueArray : (valueArray[0] || null),
      dateValue: isRange ? innerDates : (innerDates[0] || null),
      displayValue: displayValue,
      valueFormat: format,
      displayFormat: displayFormat
    });
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

  function onClear() {
    valueArray = [];
    prevValue = [];
    innerDates = [];
    currentValue = '';
    autocommit && onValueSet();
  }

  /**
   * Dismiss any edits
   */
   function onCancel() {
    valueArray = [...undoHistory];
    currentValue = computeStringValue();
    resetView();
    dispatch('cancel');
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
        // if (manualInput && ref_input.value) return;
        e.preventDefault();
        if (isRange) return;
        if (currentMode === "date") {
          ref_calendar.handleGridNav(e.key, e.shiftKey);
        } else {
          // @ts-ignore
          widgetList[0].ref.makeTick(
            ["ArrowDown", "ArrowLeft", "PageDown"].includes(e.key) ? -1 : 1
          );
        }
        break;
      case "Escape":
        autocommit ? onClear() : onCancel();
        break;
      case "Backspace":
        if (manualInput && !isRange) return;
      case "Delete":
        !required && onClear();
        break;
      case "Enter":
        isFocused && e.preventDefault();
        if (valueArray.length === 0) {
          pickerVisible = false;
          return;
        }
        if (currentMode === "time" && !isMinuteView) {
          // @ts-ignore
          return widgetList[0].ref.showMinuteView();
        }
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
        !manualInput && e.preventDefault();
    }
  }

  /**
   * @param {{ target: HTMLInputElement}} event
  */
  function onManualInput(event) {
    event.preventDefault();
    event.stopPropagation();
    const parsedInput = parseDate(event.target.value, displayFormat || format, i18n, displayFormatType || formatType);
    const formattedInput = formatDate(parsedInput, displayFormat || format, i18n, displayFormatType || formatType);
    if (formattedInput === event.target.value) {
      /** @type {CustomEventInit<CalendarDetail>} */
      onDate(new CustomEvent('date', {
        detail: {
          value: parsedInput,
          isKeyboard: true }
        }
      ));
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
   * FUTURE: investigate workflow for this
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
    dispatchInputEvent && dispatch('input', currentValue);
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
  <slot name="inputs"
    value={value} displayValue={displayValue} disabled={disabled} isDirty={isDirty}
    onKeyDown={onKeyDown} onInputFocus={onInputFocus} onInputBlur={onInputBlur}
  >
  {#if !ce_displayElement}
    <input type="hidden" {name} {value}>
    {#if !pickerOnly}
    <input bind:this={ref_input} type="text"
      id={inputId}
      tabindex="0"
      name={name.endsWith(']') ? name.substring(0, name.length-1) + '_input]' : name + '_input'}
      class:value-dirty={!autocommit && isDirty}
      value={displayValue}
      {placeholder} {disabled} {required}
      autocomplete="off"
      inputmode="none"
      class={inputClasses}
      readonly={isFocused && !manualInput && !isRange}
      on:input={manualInput ? onManualInput : () => {}}
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
  </slot>
{#if pickerVisible && isFocused }
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="std-calendar-wrap {theme}" class:is-popup={!internalVisibility} class:is-range-wrap={isRange}
    transition:fadeFn|local={{ duration: 200 }}
    use:positionPopup
    on:mousedown|preventDefault
  >
  <div class="sdt-widget-wrap">
  {#each widgetList as w, i (i)}
    <div class="sdt-widget">
    {#if currentMode === "date"}
      <Calendar
        wid={i}
        dates={innerDates}
        {isRange}
        startDate={parsedStartDate}
        endDate={parsedEndDate}
        enableTimeToggle={resolvedMode?.includes("time")}
        initialView={startView > 2 ? 2 : startView}
        hoverDate={calendarHoverDate}
        additionalDisableFn={disableDatesFn}
        bind:this={ref_calendar}
        {i18n}
        {weekStart}
        on:date={onDate}
        on:switch={onModeSwitch}
        on:internal_hoverUpdate={updateCalendarHoverDate}
      />
    {:else}
      <Time
        wid={i}
        date={innerDates[i]}
        startDate={parsedStartDate}
        endDate={parsedEndDate}
        hasDateComponent={resolvedMode !== "time"}
        bind:this={w.ref}
        showMeridian={format.match(formatType === 'php' ? 'a|A' : 'p|P') !== null}
        {i18n}
        {minuteIncrement}
        {hourOnly}
        on:hour={onDate}
        on:minute={onDate}
        on:switch={onModeSwitch}
        on:time-switch={onTimeSwitch}
      />
    {/if}
    </div>
    {/each}
  </div>
  <slot name="action-row"
    onCancel={onCancel}
    onConfirm={() => onValueSet(true)}
    onClear={onClear}
    onToday={onToday}
    isTodayDisabled={isTodayDisabled}
    currentMode={currentMode}
    i18n={i18n}
  >
    {#if !autocloseSupported || true}
    <div class="sdt-btn-row">
      {#if !autocloseSupported}
      <span>
        <button type="button" class={clearBtnClasses} on:click={onCancel}>{i18n.cancelBtn}</button>
        <button type="button" class={todayBtnClasses} on:click={() => onValueSet(true)}>{i18n.okBtn}</button>
      </span>
      {/if}
      {#if todayBtn || clearBtn}
      <span>
        {#if todayBtn && currentMode === 'date'}<button type="button" class={todayBtnClasses} on:click={onToday} disabled={isTodayDisabled}>{i18n.todayBtn}</button>{/if}
        {#if clearBtn}<button type="button" class={clearBtnClasses} on:click={onClear}>{i18n.clearBtn}</button>{/if}
      </span>
      {/if}
    </div>
    {/if}
  </slot>
  </div> <!-- END: popup -->
{/if}
</span>


<style>
  .std-component-wrap {
    position: relative;
    display: inline;
  }
  .std-calendar-wrap {
    width: 280px;
    background-color: var(--sdt-bg-main, #fff);
    box-shadow: var(--sdt-wrap-shadow, 0 1px 6px var(--sdt-shadow-color, #ccc));
    border-radius: var(--sdt-radius, 4px);
    padding: 0.5em;
    color: var(--sdt-color, initial);
  }
  .std-calendar-wrap.is-range-wrap {
    width: 560px;
  }
  .sdt-widget-wrap {
    display: flex;
    gap: 0.5rem;
    justify-content: stretch;
    position: relative;
  }
  .sdt-widget {
    flex: 1;
    min-width: 264px;
  }
  .value-dirty {
    color: color-mix(in srgb, black 20%, white);
  }
  .std-calendar-wrap.is-popup {
    position: absolute;
    box-shadow: 0 1px 6px var(--sdt-shadow-color, #ccc);
    z-index: 100;
  }
  .sdt-btn-row {
    margin-top: 0.5rem;
    display: flex;
    gap: 0.5rem;
    justify-content: space-between;
    flex-flow: row-reverse;
  }
  .sdt-action-btn {
    padding: 0.25em 0.5em;
    font-size: 0.875em;
    border-radius: 0.2em;
  }
  .sdt-today-btn {
    background-color: var(--sdt-bg-selected, #286090);
    color: var(--sdt-today-color, var(--sdt-bg-main, #fff));
    padding: 0.25em 0.5em;
    font-size: 0.875em;
    border-radius: 0.2em;
    border: 1px solid var(--sdt-today-bg, #286090);
  }
  .sdt-today-btn[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .sdt-today-btn:focus,
  .sdt-today-btn:active,
  .sdt-today-btn:hover:not([disabled]) {
    background-color: var(--sdt-today-bg, #286090);
  }
  .sdt-clear-btn {
    border: 1px solid var(--sdt-clear-color, #dc3545);
    background-color: var(--sdt-clear-bg, transparent);
    color: var(--sdt-clear-color, #dc3545);
  }
  .sdt-clear-btn:focus,
  .sdt-clear-btn:active:not([disabled]),
  .sdt-clear-btn:hover:not([disabled]) {
    background-color: var(--sdt-clear-hover-bg, #dc3545);
    color: var(--sdt-clear-hover-color, var(--sdt-bg-main, #fff));
  }
  .sdt-widget + .sdt-widget:before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 1px;
    background-color: #eee;
  }
  @media screen and (max-width: 560px) {
    .std-calendar-wrap.std-calendar-wrap.is-range-wrap {
      width: 280px;
    }
    .sdt-widget-wrap {
      flex-wrap: wrap;
    }
    .sdt-widget + .sdt-widget:before {
      content: none;
    }
  }
</style>
