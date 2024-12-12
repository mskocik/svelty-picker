<script module>
  import settings from "../settings.js";
  export const config = settings;
</script>

<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { SvelteDate } from "svelte/reactivity";
  import Calendar from "./Calendar.svelte";
  import Time from "./Time.svelte";
  import { formatDate, parseDate } from "$lib/utils/dateUtils.js";
  import { usePosition } from "$lib/utils/actions.js";
  import { computeResolvedMode, initProps } from "$lib/utils/state.js";
  import { MODE_MONTH } from "$lib/utils/constants.js";

  /**
   * @type {{
   *  inputId?: string,
   *  name?: string,
   *  disabled?: boolean,
   *  placeholder?: string|null,
   *  required?: boolean,
   *  value?: string|string[]|null,
   *  isRange?: boolean,
   *  startDate?: Date | string | null,
   *  endDate?: Date | string | null,
   *  pickerOnly?: boolean,
   *  startView?: number,
   *  mode?: 'auto'|'date'|'datetime'|'time',
   *  disableDatesFn?: ((currentDate: Date) => boolean) | null,
   *  manualInput?: boolean, theme?: string,
   *  format?: string,
   *  formatType?: string,
   *  displayFormat?: string|null,
   *  displayFormatType?: string|null,
   *  minuteIncrement?: number,
   *  weekStart?: number,
   *  inputClasses?: string,
   *  todayBtnClasses?: string,
   *  clearBtnClasses?: string,
   *  todayBtn?: boolean,
   *  clearBtn?: boolean,
   *  clearToggle?: boolean,
   *  autocommit?: boolean,
   *  hourOnly?: boolean,
   *  i18n?: import("$lib/i18n/index.js").i18nType,
   *  validatorAction?: Array<any>|null,
   *  ce_valueElement?: HTMLInputElement|null,
   *  ce_displayElement?: HTMLInputElement|null,
   *  positionResolver?: Function,
   *  onChange?: (value: string|string[]|null) => void,
   *  onDateChange?: (prop: {
   *    value: string|string[]|null,
   *    dateValue: Date|Date[]|null,
   *    displayValue: string,
   *    valueFormat: string,
   *    displayFormat: string | null,
   *    event: 'date'|'hour'|'minute'|'datetime'
   *  }) => void,
   *  onCancel?: () => void,
   *  onBlur?: () => void,
   *  onInput?: (currentValue: string|null) => void,
   *  actionRow?: import('svelte').Snippet<[
   *    autocloseSupported: boolean,
   *    todayBtnClasses: string,
   *    clearBtnClasses: string,
   *    onCancel: function,
   *    onConfirm: function,
   *    onClear: function,
   *    onToday: function,
   *    isTodayDisabled: boolean|null,
   *    i18n: import('$lib/i18n/index.js').i18nType,
   *    currentMode: string
   *  ]>}
   * } */
  let {
    inputId = '',
    name = "date",
    disabled = false,
    placeholder = null,
    required = false,
    value = $bindable(null),
    isRange = false,
    startDate = null,
    endDate = null,
    pickerOnly = false,
    startView = MODE_MONTH,
    mode = 'auto',
    disableDatesFn = null,
    manualInput = false,
    theme = config.theme,
    format = config.format,
    formatType = config.formatType,
    displayFormat = config.displayFormat,
    displayFormatType = config.displayFormatType,
    minuteIncrement = config.minuteIncrement,
    weekStart = config.weekStart,
    inputClasses = config.inputClasses,
    todayBtnClasses = config.todayBtnClasses,
    clearBtnClasses = config.clearBtnClasses,
    todayBtn = config.todayBtn,
    clearBtn = config.clearBtn,
    clearToggle = config.clearToggle,
    autocommit = config.autocommit,
    hourOnly = config.hourOnly,
    i18n = config.i18n,
    validatorAction = null,
    ce_valueElement = null,
    ce_displayElement = null,
    positionResolver = usePosition,
    onChange,
    onDateChange,
    onCancel,
    onInput,
    onBlur,
    actionRow = action_row
  } = $props();

  if (isRange && Array.isArray(value) === false) console.warn('[svelty-picker] value property must be an array for range picker');

  const { iDates, iValues, iValueCombined} = initProps(value, format, i18n, formatType);
  /** @type {string|null} concated by `join()` */
  let prev_value = iValueCombined;
  let value_array = $state(iValues);
  let innerDates = $state(iDates.map(date => new SvelteDate(date)));
  // svelte-ignore state_referenced_locally
  let undoHistory = $state(iValues);
  /** @type {string|null} @computed */
  let value_form = $derived(value_array.length ? value_array.join(',') : null);
  let value_display = $state(computeDisplayValue());
  // svelte-ignore state_referenced_locally
  let currentFormat = format;
  let currentDisplayFormat = displayFormat;
  /** @type {number?} as a timestamp */
  let calendarHoverDate = $state(null);
  let parsedStartDate = $derived(startDate ? parseDate(startDate, format, i18n, formatType) : null);
  let parsedEndDate = $derived(endDate ? new Date(parseDate(endDate, format, i18n, formatType).setSeconds(1)) : null);
  let isTodayDisabled = $derived((parsedStartDate && parsedStartDate > new Date()) || (parsedEndDate && parsedEndDate < new Date()));
  let input_name = $derived(name.endsWith(']') ? name.substring(0, name.length-1) + '_input]' : name + '_input');

  let initiallyResolvedMode = computeResolvedMode(mode, format);
  let resolvedMode = $state(initiallyResolvedMode);
  /** @type {'date'|'time'} */
  let currentMode = $state(initiallyResolvedMode === 'time' ? "time" : "date");
  /**
   * @type {Array<{ ref: import('./Time.svelte').default }>}
   */
  // @ts-ignore
  let widgetList = $state(
    isRange
      ? [{ref: null}, {ref: null}]
      : [{ref: null}]
  );
  /** @type {'date'|'datetime'|'hour'|'minute'}*/
  let lastEventType = $state('date');
  let autocloseSupported = $derived(autocommit && ((isRange && resolvedMode === 'date') || !isRange));
  /** popup visibility state */
  let isFocused = $state(pickerOnly);
  let pickerVisible = $state(pickerOnly);
  let fadeFn = pickerOnly ? () => ({}) : fade;
  let internalVisibility = $derived(pickerOnly ? true : false);
  /** actions */
  /** @type {function|function} */
  let inputAction = validatorAction ? validatorAction.shift() : () => {};
  /** @type {any} */
  let inputActionParams = validatorAction || [];
  let positionPopup = $derived(!pickerOnly ? positionResolver : () => {});
  let isDirty = $derived(autocommit ? false : value_array.join() !== undoHistory.join());
  /** refs */
  /** @type {Calendar} */
  // svelte-ignore non_reactive_update
  let ref_calendar;

  /**
   * Convert value to display value
   * @returns {string}
  */
  function computeDisplayValue() {
    return innerDates
      .sort((date1, date2) => date1.getTime() - date2.getTime())
      .map(innerDate => formatDate(innerDate, displayFormat || format, i18n, displayFormatType || formatType))
      .join(' - ');
  }

  /**
   * @returns {string[]|string|null}
  */
  function computeValue() {
    return isRange
      ? (value_array.length === 2 ? value_array : null) // for range set value only when full
      : (value_array[0] || null);
  }

  /**
   * @param {import('$lib/types/internal.js').UpdateProp} updateProp
   */
  function onDate({ type, date, isKeyboard, dateIndex = 0 }) {
    if (date && !isRange && innerDates.length) {
      if (
        innerDates[0].getFullYear() === date.getFullYear() &&
        innerDates[0].getMonth() === date.getMonth() &&
        innerDates[0].getDate() === date.getDate() &&
        resolvedMode === "date" && !required && clearToggle
      )
        // @ts-ignore
        date = null;
    }
    // standard
    if (isRange) {
      // need to keep daterange sorted
      if (type === 'date') {
        innerDates = date
          ? (innerDates.length === 2 ? [new SvelteDate(date)] : innerDates.concat(new SvelteDate(date)))
            .map(date => date.getTime())
            .sort().map(ts => new SvelteDate(ts))
          : [];
      } else if (date && dateIndex !== undefined) {
        innerDates[dateIndex] = new SvelteDate(date);
      } else if (type === 'datetime') {
        innerDates[0] = new SvelteDate(date);
        innerDates[1] = new SvelteDate(date);
      } else {
        throw new Error(`Unhandled event type: '${type}'`);
      }
      value_array = innerDates.map(date => formatDate(date, format, i18n, formatType));
    } else {
      // single select
      innerDates = date
        ? [new SvelteDate(date)]
        : [];
      value_array = date
        ? [formatDate(date, format, i18n, formatType)]
        : [];
    }
    lastEventType = type;
    shouldEmitChange(type) && setValueAndEmitEvents();
    wrapInteraction(type, isKeyboard, dateIndex);
  }

  /**
   * Previously as doAutoCommit
   *
   * @param {'date'|'datetime'|'hour'|'minute'} event
   */
  function shouldEmitChange(event) {
    if (!autocommit || (isRange && resolvedMode.includes('time'))) return false; // no doubt

    if (isRange && (resolvedMode === 'datetime' || value_array.length !== 2)) return false;

    return event === 'minute'
      || event === resolvedMode
      || (event === 'hour' && hourOnly)
      || (pickerOnly) //  here we need to emit on every change, because there is no 'blur' action
    ;
  }

  function setValueAndEmitEvents() {
    prev_value = value_array.join();
    undoHistory = [...value_array];
    value_display = computeDisplayValue();
    value = computeValue();
    // events
    dispatchInputEvent(true);
    onChange?.(isRange ? value_array : (value_array[0] || null));    // change is dispatched on user interaction
    onDateChange?.({
      value: isRange ? value_array : (value_array[0] || null),
      dateValue: isRange ? innerDates : (innerDates[0] || null),
      displayValue: value_display,
      valueFormat: format,
      displayFormat: displayFormat,
      event: lastEventType
    });
  }


  function resetView() {
    startView = MODE_MONTH;
    if (resolvedMode === 'datetime') {
      setTimeout(() => {
        if (!pickerOnly) pickerVisible = false;
         currentMode = "date";
      }, autocommit ? 300 : 0);
    } else if (!pickerOnly) pickerVisible = false;
  }


  /**
   * Should list all cases, when resetView should NOT be called
   *
   * @param {'date'|'datetime'|'hour'|'minute'} type
   * @param {boolean} isKeyboardEvent
   * @param {number} dateIndex
   */
  function wrapInteraction(type, isKeyboardEvent, dateIndex) {
    if (isKeyboardEvent && lastKeyPressed !== 'Enter') return;
    if (type === 'hour' && !hourOnly) {
      widgetList[dateIndex].ref.showMinuteView();
      return;
    }

    console.log('a', resolvedMode, type, currentMode);

    const doAutoCommit = shouldEmitChange(type);

    if (resolvedMode === 'datetime') {
      if (type === 'minute' && !isRange && resolvedMode === 'datetime' && doAutoCommit) {
        // intentionally empty, because under these conditions we want to reset view
      } else {
        if (type === 'date' && ((isRange && value_array.length === 2) || !isRange)) {
          currentMode = 'time';
        }
        return; // prevent reset
      }
    }

    doAutoCommit && !isKeyboardEvent && resetView();
  }

  // TODO: check the 'datetime' type for 'datetime' range
  function onToday() {
    const now = new Date();
    onDate({
      type: isRange ? 'datetime' : 'date',
      dateIndex: 0,
      date: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0
      ),
      isKeyboard: false
    });
    if (isRange) {
			onDate({
        type: isRange ? 'datetime' : 'date',
        dateIndex: 1,
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999),
        isKeyboard: false
      });
		}
    shouldEmitChange('date') === false && setValueAndEmitEvents();
    resolvedMode === 'date' && resetView();
  }

  function onClear() {
    innerDates = [];
    value_array = [];
    prev_value = null;
    setValueAndEmitEvents();
  }

  /**
   * pressing 'Ok' button
   */
   function onConfirm() {
    const stringValue = Array.isArray(value) ? value.join() : (value || null);
    console.log('confirm!', prev_value, stringValue);
    if (prev_value !== stringValue || (autocommit === false || isRange)) {
      setValueAndEmitEvents();
    }
    resetView();
  }

  /**
   * Dismiss any edits
   */
   function onCancelFn() {
    value_array = [...undoHistory];
    // currentValue = computeStringValue();
    resetView();
    onCancel?.();
  }

  let lastKeyPressed = null;

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
    lastKeyPressed = e.key;
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
          // @ts-ignore
          widgetList[0].ref.makeTick(
            ["ArrowDown", "ArrowLeft", "PageDown"].includes(e.key) ? -1 : 1
          );
        }
        break;
      case "Escape":
        autocommit ? onClear() : onCancelFn();
        break;
      case "Backspace":
        if (manualInput && !isRange) return;
      case "Delete":
        !required && onClear();
        break;
      case "Enter":
        isFocused && e.preventDefault();
        if (value_array.length === 0) {
          pickerVisible = false;
          return;
        }
        if (currentMode === "time" && lastEventType === 'hour') {
          return widgetList[0].ref.showMinuteView();
        }
        if (resolvedMode === 'datetime' && currentMode !== 'time') {
          currentMode = 'time';
          return;
        }
        onConfirm();

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
   * @param {Event & { target: HTMLInputElement}} event
  */
  function onManualInput(event) {
    event.preventDefault();
    event.stopPropagation();
    const parsedInput = parseDate(event.target.value, displayFormat || format, i18n, displayFormatType || formatType);
    const formattedInput = formatDate(parsedInput, displayFormat || format, i18n, displayFormatType || formatType);
    if (formattedInput === event.target.value) {
      onDate({
          type: 'date',
          date: parsedInput,
          isKeyboard: true
      });
      ref_calendar.focusDate(parsedInput);
    }
  }

  /**
   * @param {'date'|'time'} mode
   */
  function onModeSwitch(mode) {
    startView = MODE_MONTH;
    currentMode = mode;
  }

  let inputMode = $state(manualInput ? 'text' : 'none');

  function onInputClick() {
    if (manualInput && isFocused) inputMode = inputMode === 'text'
      ? 'none'
      : 'text';
    !pickerVisible && onInputFocus();
  }

  function onInputFocus() {
    isFocused = true;
    pickerVisible = true;
  }

  function onInputBlur() {
    isFocused = false;
    if (autocloseSupported) {
      onConfirm();
    } else {
      onCancelFn();
    }
    !ce_displayElement && onBlur?.();
  }

  /**
   * FUTURE: investigate workflow for this
   * TODO: emit event for native input!
   *
   * @param {boolean} dispatchInputEvent
   */
  function dispatchInputEvent(dispatchInputEvent) {
    if (ce_valueElement && ce_displayElement) {
      ce_valueElement.value = value_array.join(',') || '';
      ce_displayElement.value = value_display;
      ce_valueElement.dispatchEvent(new Event('input'));
      ce_displayElement.dispatchEvent(new Event('input'));
    }
    dispatchInputEvent && onInput?.(value_form);
  }

  /**
   * @param {number} date
  */
  function updateCalendarHoverDate(date) {
    calendarHoverDate = date;
  }

  /**
   * initialization for custom element
  */
  onMount(() => {
    if (ce_displayElement) {
      ce_displayElement.onfocus = onInputFocus;
      ce_displayElement.onblur = onInputBlur;
      ce_displayElement.onclick = onInputClick;
      ce_displayElement.onkeydown = onKeyDown;
    }
  });

  /**
   * effects: parent reactivity listeners
   */

  /**
   * @param {string|string[]|null} passedValue
   */
   function watch_value(passedValue) {
    const stringValue = Array.isArray(passedValue) ? passedValue.join() : (passedValue || null);
    if (prev_value !== stringValue) {
      value_array = passedValue
        ? (Array.isArray(passedValue)
          ? passedValue
          : [passedValue]
        )
        : [];
      innerDates = value_array
        .map(val => new SvelteDate(parseDate(val, format, i18n, formatType)));
      undoHistory = value_array;
      prev_value = stringValue;
    }
  }

  /**
   * @param {string} format
   * @param {string|null} displayFormat - not used, but included to track also its' changes
   */
  function watch_formats(format, displayFormat) {
    if (currentDisplayFormat !== displayFormat) {
      currentDisplayFormat = displayFormat;
      value_display = computeDisplayValue();
    }
    if (currentFormat !== format && innerDates.length) {
      currentFormat = format;
      value_array = innerDates.map(date => formatDate(date, format, i18n, formatType));
      prev_value = value_array.join();
      if (currentDisplayFormat === null && currentDisplayFormat === displayFormat) {
        value_display = computeDisplayValue();
      }
      if (mode === "auto") {
        resolvedMode =
          format.match(/g|hh?|ii?/i) && format.match(/y|m|d/i)
            ? "datetime"
            : format.match(/g|hh?|ii?/i)
            ? "time"
            : "date";
        if (resolvedMode === 'time' && currentMode !== 'time') {
          currentMode = 'time';
        }
      }
      setValueAndEmitEvents();
    }
  }

  $effect(() => watch_value(value));
  $effect(() => watch_formats(format, displayFormat));
</script>

{#snippet action_row(autocloseSupported, todayBtnClasses, clearBtnClasses, onCancel, onConfirm, onClear, onToday, isTodayDisabled, i18n, currentMode)}
  {#if !autocloseSupported || true}
    <div class="sdt-btn-row">
      {#if !autocloseSupported}
      <span>
        <button
          type="button"
          class={clearBtnClasses}
          onclick={onCancel}
        >
          {i18n.cancelBtn}
        </button>
        <button
          type="button"
          class={todayBtnClasses}
          onclick={onConfirm}
        >
          {i18n.okBtn}
        </button>
      </span>
      {/if}
      {#if todayBtn || clearBtn}
      <span>
        {#if todayBtn && currentMode === 'date'}
          <button
            type="button"
            class={todayBtnClasses}
            onclick={onToday}
            disabled={isTodayDisabled}
          >
            {i18n.todayBtn}
          </button>
        {/if}
        {#if clearBtn}
          <button
            type="button"
            class={clearBtnClasses}
            onclick={onClear}
          >
            {i18n.clearBtn}
          </button>
        {/if}
      </span>
      {/if}
    </div>
  {/if}
{/snippet}

<span class="sdt-component-wrap">
  {#if !ce_displayElement}
    <input type="hidden" {name} {value}>
    {#if !pickerOnly}
    <input  type="text"
      id={inputId}
      tabindex="0"
      name={input_name}
      class={inputClasses}
      class:value-dirty={isDirty}
      value={value_display}
      {placeholder}
      {disabled}
      {required}
      autocomplete="off"
      inputmode={inputMode}
      readonly={isFocused && !manualInput && !isRange}
      oninput={manualInput ? onManualInput : () => {}}
      onfocus={onInputFocus}
      onblur={onInputBlur}
      onclick={onInputClick}
      onkeydown={onKeyDown}
      use:inputAction={inputActionParams}
    />
    {/if}
  {/if}
{#if pickerVisible && isFocused }
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="sdt-calendar-wrap {theme}"
    class:is-popup={!internalVisibility}
    class:is-range-wrap={isRange}
    transition:fadeFn={{ duration: 200 }}
    onmousedown={e => e.preventDefault() }
    use:positionPopup
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
        onupdate={onDate}
        onswitch={onModeSwitch}
        onhoverupdate={updateCalendarHoverDate}
      />
    {:else}
      <Time
        wid={i}
        date={innerDates[i] || null}
        startDate={isRange && i === 1 ? innerDates[0] : parsedStartDate}
        endDate={parsedEndDate}
        hasDateComponent={resolvedMode !== "time"}
        bind:this={w.ref}
        showMeridian={format.match(formatType === 'php' ? 'a|A' : 'p|P') !== null}
        {i18n}
        {minuteIncrement}
        {hourOnly}
        onupdate={onDate}
        onswitch={onModeSwitch}
      />
    {/if}
    </div>
    {/each}
  </div>
  {@render actionRow(autocloseSupported, todayBtnClasses, clearBtnClasses, onCancelFn, onConfirm, onClear, onToday, isTodayDisabled, i18n, currentMode)}
  </div> <!-- END: popup -->
{/if}
</span>


<style>
  .sdt-component-wrap {
    position: relative;
    display: inline;
  }
  .sdt-calendar-wrap {
    width: 280px;
    background-color: var(--sdt-bg-main, #fff);
    box-shadow: var(--sdt-wrap-shadow, 0 1px 6px var(--sdt-shadow-color, #ccc));
    border-radius: var(--sdt-radius, 4px);
    padding: 0.5em;
    color: var(--sdt-color, initial);
  }
  .sdt-calendar-wrap.is-range-wrap {
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
  .sdt-calendar-wrap.is-popup {
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
    .sdt-calendar-wrap.is-range-wrap {
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
