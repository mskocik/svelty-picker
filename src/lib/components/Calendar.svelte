<script>
  import { fade } from 'svelte/transition';
  import { compute } from '$lib/utils/grid.js';
  import { scale } from '../utils/transitions.js'

  import { MODE_MONTH, MODE_YEAR, MODE_DECADE } from '$lib/utils/constants.js';
  import { SvelteDate } from 'svelte/reactivity';


  /**
   * @type {{
   *  wid?: number
   *  dates: Date[],
   *  startDate?: Date|null,
   *  endDate?: Date|null,
   *  weekStart?: number,
   *  initialView?: any,
   *  i18n: import("$lib/i18n/index.js").i18nType,
   *  enableTimeToggle?: boolean,
   *  isRange?: boolean,
   *  hoverDate?: number?,
   *  additionalDisableFn?: ?function(Date): boolean,
   *  onupdate?: (prop: import('$lib/types/internal.js').UpdateProp) => void
   *  onswitch?: (mode: string) => void
   *  onhoverupdate?: (date: number|null) => void
   * }}
   */
  let {
    wid = 0,
    dates = [],
    startDate = null,
    endDate = null,
    weekStart = 1,
    initialView = MODE_MONTH,
    i18n,
    enableTimeToggle = false,
    isRange = false,
    hoverDate = $bindable(null),
    additionalDisableFn,
    onupdate,
    onswitch,
    onhoverupdate,
  } = $props();
  /**
   * @param {string} key
   * @param {boolean} shiftKey
   */
  export function handleGridNav(key, shiftKey) {
    if (currentView !== MODE_MONTH) {
      currentView = MODE_MONTH;
      viewDelta = 1;
      activeDate = new SvelteDate(internalDate || new Date());
      return;
    }
    if (!internalDate) {
      onClick(new Date, { keyboard: true });
      return;
    }
    /** @type {Date} */
    let dateToSelect = new Date(internalDate);

    switch (key) {
      case 'PageDown':
        shiftKey = true;
      case 'ArrowDown':
        shiftKey
          ? dateToSelect.setMonth(internalDate.getMonth() + 1)
          : dateToSelect.setDate(internalDate.getDate() + 7);
        // longer to shorter month correction
        if (shiftKey && dateToSelect.getMonth() === internalDate.getMonth()) {
          dateToSelect.setDate(0);
        }
        onClick(dateToSelect, { keyboard: true });
        break;
      case 'PageUp':
        shiftKey = true;
      case 'ArrowUp':
        shiftKey
          ? dateToSelect.setMonth(internalDate.getMonth() - 1)
          : dateToSelect.setDate(internalDate.getDate() - 7);
        // longer to shorter month correction
        if (shiftKey && dateToSelect.getMonth() === internalDate.getMonth()) {
          dateToSelect.setDate(0);
        }
        onClick(dateToSelect, { keyboard: true });
        break;
      case 'ArrowLeft':
        shiftKey
          ? dateToSelect.setFullYear(internalDate.getFullYear() - 1)
          : dateToSelect.setDate(internalDate.getDate() - 1);
        onClick(dateToSelect, { keyboard: true });
        break;
      case 'ArrowRight':
        shiftKey
          ? dateToSelect.setFullYear(internalDate.getFullYear() + 1)
          : dateToSelect.setDate(internalDate.getDate() + 1);
        onClick(dateToSelect, { keyboard: true });
        break;
    }
  }

  /** @type Date? */
  let internalDate = dates[wid] || null;
  /** @type {SvelteDate} */
  let activeDate = $state(wid === 1
    ? (() => {
      //if the end date is set, and the month/year is different from the start month/year
      // then return that, otherwise return the month succeeding the start date
      if (dates.length === 2 && dates[1]
        && (dates[0].getMonth() != dates[1].getMonth()
          || dates[0].getFullYear() != dates[1].getFullYear()
        )
      ) return new SvelteDate(dates[1]);

      const d = new Date(dates[0] || new Date());
      d.setMonth(d.getMonth()+1);   // by default move second calendar by 1 month
      return new SvelteDate(d);
    })()
    : new SvelteDate(dates[0]?.valueOf() || new Date())
  );

  let computedStartDate = $derived(startDate
    ? new SvelteDate(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0,0,0,0)
    : null
  );

  let currentView = $state(initialView);
  let viewDelta = $state(-2);
  let viewChanged = $state(false);
  let duration = 400;
  let start = $derived(viewDelta < 1 ? 1.5 : 0.5);
  let end = $derived(viewDelta < 1 ? 1 : 1.5);
  const TRANSFORM_CONST = 222;
  const TRANSFORM_DECADE_UNEVEN = 148;  // in decade view, transform constants values are changing
  let transform = $state(TRANSFORM_CONST);  // month +/- constant
  /** @type {Function|null} */
  let onMonthTransitionTrigger = $state(null);

  /**
   * @type {(node: HTMLElement, props: {
   *    duration: number,
   *    start: number,
   *    end?: number,
   *    opacity?: number,
   *    delay?: number
   *  }) => import('svelte/transition').TransitionConfig}
   */
  let swapTransition = $derived(viewDelta === -2
    ? fade
    : (viewDelta !== null ? scale : () => ({}))
  );

  let times = $derived(dates.map(date => { date = new Date(date); date.setHours(0,0); return date.getTime() }));
  let dataset = $derived(compute(activeDate, dates, currentView, i18n, weekStart));
  let dayLabels = $derived(i18n.daysMin.concat(...i18n.daysMin.slice(1)).slice(weekStart, 7 + weekStart));
  let tableCaption = $derived(i18n && showCaption(currentView, activeDate));

  function isBetween(/** @type {number} */num) {
    return dataset.prevTo <= num && num < dataset.nextFrom;
  }

  /**
   * @param {Date} date
   * @returns {boolean}
  */
  function isDisabledDate(date) {
    switch (currentView) {
      case MODE_MONTH:
        if (computedStartDate && computedStartDate > date) return true;
        if (endDate && endDate <= date) return true;
        if (additionalDisableFn && additionalDisableFn(date)) return true;
        break;
      case MODE_YEAR:
        const dateYear = date.getFullYear();
        const startYear = computedStartDate?.getFullYear();
        const endYear = endDate?.getFullYear();
        if (computedStartDate) {
          if (
            (startYear === dateYear && computedStartDate.getMonth() > date.getMonth())
            || (startYear > dateYear)
          ) return true;
        }
        if (endDate) {
          if (
            (endYear === dateYear && endDate.getMonth() < date.getMonth())
            || endYear < dateYear
          ) return true;
        }
        break;
      case MODE_DECADE:
        if (computedStartDate && computedStartDate.getFullYear() > date.getFullYear()) return true;
        if (endDate && endDate.getFullYear() < date.getFullYear()) return true;
        break;
    }
    return false;
  }

  /**
   *
   * @param {Date} date
   * @param {number} direction
   * @param {number} mode
   */
  function disableButtonNav(date, direction, mode) {
    const compareToEndDate = direction === 1;
    const dateToCompare = compareToEndDate ? endDate : computedStartDate;
    if (dateToCompare) {
      if (mode === MODE_DECADE) return compareToEndDate
        ? date.getFullYear() + (direction *10) > dateToCompare.getFullYear()
        : date.getFullYear() + (direction *10)< dateToCompare.getFullYear();
      if (mode === MODE_YEAR) {
        return compareToEndDate
          ? date.getFullYear() + direction > dateToCompare.getFullYear()
          : date.getFullYear() + direction < dateToCompare.getFullYear();
      }
      return compareToEndDate
        ? date.getFullYear() * 100 + date.getMonth() + direction > dateToCompare.getFullYear() * 100 + dateToCompare.getMonth()
        : date.getFullYear() * 100 + date.getMonth() + direction < dateToCompare.getFullYear() * 100 + dateToCompare.getMonth();
    }
    return false;
  }

  /**
   * @param {number} val
   */
  function onChangeMonth(val) {

    const multiplier = currentView === MODE_DECADE
      ? 120
      : (currentView === MODE_YEAR
      ? 12
      : 1
    )
    // NOTE: since `immutable` settings is ignored in rune mode, this is obsolete
    // const newActiveDate = new Date(activeDate); // to keep it working with immutable setting, ref #20
    // newActiveDate.getDate() > 28 ? newActiveDate.setDate(newActiveDate.getDate() - 3) : newActiveDate;
    // newActiveDate.setMonth(activeDate.getMonth() + (val*multiplier));
    // activeDate = new SvelteDate(newActiveDate);
    if (activeDate.getDate() > 28) {
      activeDate.setDate(activeDate.getDate() - 3)
    };
    activeDate.setMonth(activeDate.getMonth() + (val*multiplier));
    onMonthTransitionTrigger = null;
    transform = currentView === MODE_DECADE
      ? activeDate.getFullYear() % 20 >= 10 ? TRANSFORM_CONST : TRANSFORM_DECADE_UNEVEN
      : TRANSFORM_CONST;
  }

  /**
   * @param {number} val
   */
  function onTransformChangeMonth(val) {
    if (currentView === MODE_MONTH) {
      return onChangeMonth(val);
    }
    onMonthTransitionTrigger = () => {
      onChangeMonth(val)
    };
    if (currentView === MODE_DECADE) {
      transform = transform === TRANSFORM_DECADE_UNEVEN
        ? (val === -1
          ? transform - TRANSFORM_CONST
          : TRANSFORM_CONST + TRANSFORM_DECADE_UNEVEN
        )
        : (val === -1
          ? transform - TRANSFORM_CONST // 0 / -74
          : transform + TRANSFORM_DECADE_UNEVEN // TRANSFORM_CONST + TRANSFORM_CONST
        )
      return;
    }
    transform = val === -1 ? transform - TRANSFORM_CONST : transform + TRANSFORM_CONST;
  }

  function onSwitchView() {
    viewDelta = -1
    viewChanged = true;
    currentView && currentView--;
    if (currentView === MODE_DECADE) {
      const isLongerMove = (Math.floor(activeDate.getFullYear() / 10) * 10) % 20 === 0;
      transform = isLongerMove ? TRANSFORM_DECADE_UNEVEN : TRANSFORM_CONST;
    }
  }


  // @ts-ignore
  function onClick(value, { keyboard } = {}) {
    viewDelta = 1;
    viewChanged = true;
    switch (currentView) {
      case 0:
        activeDate.setFullYear(value);
        activeDate = activeDate;
        break;
      case 1:
        activeDate.setMonth(i18n.monthsShort.indexOf(value));
        activeDate = activeDate;
        break;
      case 2:
        if (isDisabledDate(value)) return;
        if (additionalDisableFn && additionalDisableFn(value)) return;
        const newInternalDate = new Date(value.getFullYear(), value.getMonth(), value.getDate());
        if (internalDate) {
          newInternalDate.setMinutes(internalDate.getMinutes());
          newInternalDate.setHours(internalDate.getHours());
        }
        internalDate = newInternalDate;

        // on keyboard navigation, always change active view to month with selection
        if (keyboard) {
          if (activeDate.getFullYear() !== newInternalDate.getFullYear()
            || (activeDate.getFullYear() === newInternalDate.getFullYear()
              && activeDate.getMonth() !== newInternalDate.getMonth()
            )
          ) {
            activeDate.setFullYear(newInternalDate.getFullYear());
            activeDate.getDate() > 28 && activeDate.setDate(28);  // safe value to prevent month skip, ref #146
            activeDate.setMonth(newInternalDate.getMonth());
            activeDate = activeDate;
          }
        }
        onupdate?.({
          type: 'date',
          date: internalDate,
          isKeyboard: keyboard
        });
        break;
    }
    currentView < MODE_MONTH && currentView++;
    transform = TRANSFORM_CONST;  // reset transform
  }

  $effect(() => {
    if (dates.length === 0) internalDate = null;
  })

  function onTransitionOut() {
    viewChanged = false;
  }

  function onTimeSwitch() {
    onswitch?.('time');
  }

  /**
   * @param {number} currentView
   * @param {Date} activeDate
   */
  function showCaption(currentView, activeDate) {
    switch (currentView) {
      case MODE_DECADE:
        const from = dataset.years[Math.floor(dataset.prevTo / 4)][dataset.prevTo % 4]; // y,x
        const to = dataset.years[Math.floor(dataset.nextFrom / 4)][(dataset.nextFrom % 4)]; // y,x
        return `${from} - ${to}`
      case MODE_YEAR:
        return activeDate.getFullYear();
      case MODE_MONTH:
        return i18n.months[activeDate.getMonth()] + ' ' + activeDate.getFullYear();
    }
  }

  /**
   * @param {Date?} currDate
   * @returns {function(): void}
  */
  function wrapHoverDateToggle(currDate = null) {
    return function(/** @type MouseEvent */ event) {
      hoverDate = currDate?.getTime() || null;
      onhoverupdate?.(hoverDate);
    }
  }

  /**
   * @param {number} timestamp
  */
  function isInRange(timestamp) {
    return times.length === 2 ? timestamp >= times[0] && timestamp < times[1] : false;
  }

  /**
   * @param {number} timestamp
   * @param {number?} hoverDate
  */
  function isRangeHoverable(timestamp, hoverDate) {
    return hoverDate && times.length === 1 && (
      (timestamp <= hoverDate && times[0] <= timestamp)
      ||
      (timestamp >= hoverDate && times[0] >= timestamp)
      );
  }


</script>

<div class="sdt-thead-nav">
  <button type="button" class="std-btn std-btn-header sdt-toggle-btn" onclick={onSwitchView}>{tableCaption}</button>
  {#if enableTimeToggle && dates.length}
  <button
    type="button"
    class="std-btn std-btn-header icon-btn sdt-time-icon"
    title={i18n.timeView}
    aria-label={i18n.timeView}
    onclick={onTimeSwitch}
  >
    <svg class="sdt-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0zM8 0a8 8 0 100 16A8 8 0 008 0zm.5 4.75a.75.75 0 00-1.5 0v3.5a.75.75 0 00.471.696l2.5 1a.75.75 0 00.557-1.392L8.5 7.742V4.75z"></path></svg>
  </button>
  {/if}
  <button
    type="button"
    class="std-btn std-btn-header icon-btn"
    title={i18n.months[(activeDate.getMonth()-1) % 12]}
    aria-label={i18n.months[(activeDate.getMonth()-1) % 12]}
    onclick={() => onTransformChangeMonth(-1)}
    disabled={disableButtonNav(activeDate, -1, currentView)}
  >
    <svg class="sdt-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="24" height="24"><path d="M4.427 9.573l3.396-3.396a.25.25 0 01.354 0l3.396 3.396a.25.25 0 01-.177.427H4.604a.25.25 0 01-.177-.427z"></path></svg>
  </button>
  <button
    type="button"
    class="std-btn std-btn-header icon-btn"
    title={i18n.months[(activeDate.getMonth()+1) % 12]}
    aria-label={i18n.months[(activeDate.getMonth()+1) % 12]}
    onclick={() => onTransformChangeMonth(1)}
    disabled={disableButtonNav(activeDate, 1, currentView)}
  >
    <svg class="sdt-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="24" height="24"><path d="M4.427 7.427l3.396 3.396a.25.25 0 00.354 0l3.396-3.396A.25.25 0 0011.396 7H4.604a.25.25 0 00-.177.427z"></path></svg>
  </button>
  <div class="sdt-nav-btns">
  </div>
</div>
<div class="sdt-calendar" class:is-grid={viewChanged}>
  {#if currentView === MODE_DECADE}
  <table class="sdt-table" style="max-height: 221px; height: 221px">
    <tbody in:swapTransition={{duration: duration, start: start, opacity: 1}} class="sdt-tbody-lg" out:swapTransition={{duration, end, start: 1}} onoutroend={onTransitionOut}
      style={`transform: translateY(-${transform}px); color: red`}
      class:animate-transition={onMonthTransitionTrigger ? true : false}
      ontransitionend={() => onMonthTransitionTrigger && onMonthTransitionTrigger()}
    >
      {#each dataset.years as row, i}
      <tr class="sdt-cal-td">
        {#each row as year, j(j)}
        {@const idx = i*4+j}
        <td class="sdt-cal-td" class:is-selected={dataset.selectionMark.includes(idx)}>
          <button type="button"
            class="std-btn"
            class:not-current={!isBetween(idx)}
            onclick={() => { onClick(year)}}
            disabled={isDisabledDate(new Date(year, activeDate.getMonth(), activeDate.getDate()))}
          >{year}</button>
        </td>
        {/each}
      </tr>
      {/each}
    </tbody>
  </table>
  {/if}
  {#if currentView === MODE_YEAR}
  <table class="sdt-table">
    <tbody in:swapTransition={{duration, start, opacity: 1}} class="sdt-tbody-lg" out:swapTransition|local={{duration, end, start: 1 }} onoutroend={onTransitionOut} style={`transform: translateY(-${transform}px)`}
      class:animate-transition={onMonthTransitionTrigger ? true : false}
      ontransitionend={() => onMonthTransitionTrigger && onMonthTransitionTrigger()}
    >
      {#each dataset.months as row, i}
      <tr class="sdt-cal-td">
        {#each row as month, j(j)}
        {@const idx = i*4+j}
        <td class="sdt-cal-td" class:is-selected={idx === dataset.selectionMark[0]}>
          <button class="std-btn" type="button"
            class:not-current={!isBetween(idx)}
            onclick={() => { onClick(month)}}
            disabled={isDisabledDate(new Date(activeDate.getFullYear(), i18n.monthsShort.indexOf(month), activeDate.getDate()))}
          >{month}</button>
        </td>
        {/each}
      </tr>
      {/each}
    </tbody>
  </table>
  {/if}
  {#if currentView === MODE_MONTH}
  <table class="sdt-table sdt-table-height">
    <tbody in:swapTransition={{duration, start: 0.5, opacity: 1}} out:swapTransition={{duration, start: Math.abs(viewDelta)}} onoutroend={onTransitionOut}>
      <tr class="sdt-cal-td">
      {#each dayLabels as header}
        <th class="sdt-cal-th">{header}</th>
      {/each}
      </tr>
      {#each dataset.days as row, i }
      <tr>
        {#each row as currDate, j(j)}
        {@const idx = i*7+j}
        {@const dateTime = currDate.getTime()}
        <!-- svelte-ignore a11y_mouse_events_have_key_events -->
        <td class="sdt-cal-td"
          class:sdt-today={idx === dataset.todayMark}
          class:in-range={isInRange(dateTime)}
          class:is-selected={times.includes(dateTime)}
          class:in-range-hover={isRange && isRangeHoverable(dateTime, hoverDate)}
          onmouseover={wrapHoverDateToggle(currDate)}
          onmouseout={wrapHoverDateToggle()}
        >
          <button onclick={() => {onClick(currDate)}} type="button"
            class="std-btn sdt-btn-day"
            class:not-current={!isBetween(i*7+j) }
            disabled={(computedStartDate || endDate || additionalDisableFn) && isDisabledDate(currDate)}
          >{currDate.getDate()}</button>
        </td>
        {/each}
      </tr>
      {/each}
    </tbody>
  </table>
  {/if}
</div>

<style>
  td,th {
    padding: 0;
    border-width: 0;
  }
.sdt-cal-td {
  padding: 0;
  font-size: 90%;
  text-align: center;
  /* background-color: var(--sdt-bg-main, #fff); */
}
.sdt-cal-th {
  text-align: center;
  height: 24px;
}
.sdt-calendar {
  height: 221px;
  overflow: hidden;
}
.sdt-calendar.is-grid {
  display: grid;
}
.sdt-calendar.is-grid .sdt-table {
  grid-column: 1/2;
  grid-row: 1/2;
}
.sdt-table {
  width: 100%;
  border-collapse: collapse;
  margin: 0;
  background-color: var(--sdt-table-bg, transparent);
}
.sdt-table-height {
  height: 222px;
}
.animate-transition {
  will-change: transform;
  transition: transform .3s ease;
}
.not-current {
  opacity: 0.3;
}
.not-current:hover {
  opacity: 0.55;
}
.std-btn {
  margin: 0;
  border: 0;
  background: transparent;
  text-align: center;
  width: 100%;
  border-radius: 4px;
  cursor: pointer;
  padding: 0.3rem;
  box-sizing: border-box;
  color: var(--sdt-color, initial);
}
.sdt-btn-day {
  max-height: 32px;
  height: 32px;
}
.std-btn[disabled] {
  cursor: not-allowed;
  opacity: 0.5;
  color: var(--sdt-table-disabled-date, #b22222);
  background-color: var(--sdt-table-disabled-date-bg, var(--sdt-bg-main, #fff));
}
.std-btn-header {
  width: auto;
  font-weight: bold;
  padding: 0.375em 0.5em;
  color: var(--sdt-header-color, var(--sdt-color, initial));
}
.std-btn-header.icon-btn:first-of-type {
  padding-left: 0.375em;
  padding-right: 0.375em;
}
.std-btn-header.icon-btn {
  padding-left: 0.25em;
  padding-right: 0.25em;
}
.std-btn:hover {
  background-color: var(--sdt-table-data-bg-hover, #eee);
}
.is-selected.in-range .std-btn {
  border-radius: 4px 0 0 4px
}
.in-range .std-btn,
.in-range-hover:not(.is-selected) .std-btn {
  background-color: color-mix(in srgb, transparent 75%, var(--sdt-bg-selected, #286090));
  border-radius: 0;
}
/* range selection: start */
:global(.in-range-hover.is-selected:has(+ .in-range-hover) .std-btn) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.in-range-hover + .in-range-hover.is-selected .std-btn {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
.in-range:not(.is-selected) .std-btn:hover {
  background-color: color-mix(in srgb, var(--sdt-table-data-bg-hover, #eee) 75%, var(--sdt-bg-selected, #286090));
}
/* range selection: end */
.in-range + .is-selected .std-btn,
.is-selected + .is-selected .std-btn {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
.is-selected + .is-selected .std-btn {
  border-left: 1px solid color-mix(in srgb, white 75%, var(--sdt-table-selected-bg, var(--sdt-bg-selected, #286090)));
  margin-left: -1px;
}
.is-selected .std-btn,
.is-selected.in-range .std-btn {
  background-color: var(--sdt-table-selected-bg, var(--sdt-bg-selected, #286090));
  color: var(--sdt-color-selected, var(--sdt-bg-main, #fff));
  opacity: 0.9;
}
.std-btn-header:hover {
  background-color: var(--sdt-header-btn-bg-hover, #dfdfdf);
}
.sdt-time-icon {
  display: inline-flex;
  align-items: center;
  padding: 0.375em !important;
}
.sdt-time-icon svg {
  height: 1em !important;
  stroke: initial !important;
}
.sdt-tbody-lg {
  background-color: var(--sdt-bg-main, #fff);
}
.sdt-tbody-lg .std-btn {
  height: 74px;
}
.sdt-thead-nav {
  display: flex;
  margin-bottom: 0.25em;
  align-items: stretch;
}
.sdt-nav-btns {
  white-space: nowrap;
}
.sdt-toggle-btn {
  width: 100%;
  text-align: left;
}
.sdt-today {
  position: relative;
}
.sdt-today:before {
  box-sizing: border-box;
  position: absolute;
  content: '';
  margin-left: 4px;
  margin-top: 4px;
  border-left: 4px solid var(--sdt-table-today-indicator, #ccc);
  border-top: 4px solid var(--sdt-table-today-indicator, #ccc);
  border-bottom: 4px solid transparent;
  border-right: 4px solid transparent;
  border-radius: 2px;
  height: 4px;
  z-index: 2;
}
.sdt-svg {
  fill: var(--sdt-header-color, initial);
}
.sdt-today:hover:before,
.in-range.sdt-today:before {
  border-left-color: var(--sdt-bg-selected, #286090);
  border-top-color: var(--sdt-bg-selected, #286090);
}
.is-selected.sdt-today:before
 {
  border-left-color: #eee;
  border-top-color: #eee;
}
</style>
