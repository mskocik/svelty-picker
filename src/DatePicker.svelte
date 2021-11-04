<script>
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';
  import { compute, MODE_MONTH, MODE_YEAR, MODE_DECADE, formatDate } from './dateUtils.js';

  export let date = null;
  export let startDate = null;
  export let endDate = null;
  export let weekStart = 1;
  export let i18n;

  let initial = (date || new Date()).toISOString().split('T')[0].substring(0, 10)

  let internalDate = new Date(initial);
  let activeDate = new Date(initial);

  const dispatch = createEventDispatcher();

  let currentView = MODE_MONTH;

  $: {
    if (date !== internalDate) {
      internalDate = date;
    }
  }
  $: dataset = compute(activeDate, internalDate, currentView, i18n);
  $: dayLabels = weekStart > 1
    ? i18n.daysMin.concat(i18n.daysMin).slice(weekStart, 8)
    : i18n.daysMin.slice(weekStart, 8)

  function isBetween(num) {
    return dataset.prevTo <= num && num < dataset.nextFrom;
  }

  function isDisabledDate(date) {
    if (startDate && startDate > date) return true;
    if (endDate && endDate < date) return true;
  }

  function changeMonth(val) {
    const multiplier = currentView === MODE_DECADE
      ? 120
      : (currentView === MODE_YEAR
        ? 12
        : 1
      )
    activeDate.setUTCMonth(activeDate.getUTCMonth() + (val*multiplier));
    activeDate = activeDate;
  }

  function onSwitchView() {
    currentView && currentView--;
  }

  function updateInternalDate(value) {
    switch (currentView) {
      case 0:
        activeDate.setYear(value);
        activeDate = activeDate;
        break;
      case 1:
        activeDate.setUTCMonth(i18n.monthsShort.indexOf(value));
        activeDate = activeDate;
        break;
      case 2:
        internalDate = new Date(value.toISOString().split('T')[0].substring(0, 10));
        dispatch('date', internalDate);
        break;
    }
    currentView < MODE_MONTH && currentView++;
  }

  function showCaption() {
    switch (currentView) {
      case 0:
        return `${dataset.yearGrid[0][1]} - ${dataset.yearGrid[2][2]}`
      case 1:
        return activeDate.getUTCFullYear();
      case 2:
        return i18n.months[activeDate.getUTCMonth()] + ' ' + activeDate.getUTCFullYear();
    }
  }

  $: tableCaption = showCaption(currentView, activeDate);

</script>

<div class="c-datepicker">
  <div class="c-datepicker-section">
    <table class="dt-table">
      <thead>
        <tr>
          <td colspan="{currentView === 2 ? 7 : 4}">
            <div class="calendar-header">
              <button class="btn btn-header" on:click|preventDefault={() => changeMonth(-1)}>«</button>
              <button class="btn btn-header" on:click|preventDefault={onSwitchView}>{tableCaption}</button>
              <button class="btn btn-header" on:click|preventDefault={() => changeMonth(1)}>»</button>
            </div>
          </td>
        </tr>
      </thead>
      {#if currentView === MODE_DECADE}
      <tbody in:fade={{duration: 300}} class="c-section-large">
        {#each dataset.yearGrid as row, i}
        <tr>
          {#each row as year, j(j)}
          <td class:is-selected={i*4+j === dataset.selectionMark}>
            <button
              class="btn"
              on:click|preventDefault={() => { updateInternalDate(year)}}
            >{year}</button>
          </td>
          {/each}
        </tr>
        {/each}
      </tbody>  
      {/if}
      {#if currentView === MODE_YEAR}
      <tbody in:fade={{duration: 300}} class="c-section-large">
        {#each dataset.monthGrid as row, i}
        <tr>
          {#each row as month, j(j)}
          <td class:is-selected={i*4+j === dataset.selectionMark}>
            <button class="btn"
              on:click|preventDefault={() => { updateInternalDate(month)}}
            >{month}</button>
          </td>
          {/each}
        </tr>
        {/each}
      </tbody>  
      {/if}
      {#if currentView === MODE_MONTH}
      <tbody class="c-section-center">
        <tr>
        {#each dayLabels as header}
          <th>{header}</th>
        {/each}
        </tr>
      </tbody>
      <tbody in:fade={{duration: 200}}>
        {#each dataset.dayGrid as row, i }
        <tr>
          {#each row as currDate, j(j)}
          <td class:is-today={i*7+j === dataset.todayMark}
            class:is-selected={i*7+j === dataset.selectionMark}
          >
            <button on:click|preventDefault={() => {updateInternalDate(currDate)}}
              class="btn"
              class:not-current={!isBetween(i*7+j, currDate) }
              disabled={isDisabledDate(currDate)}
            >{currDate.getUTCDate()}</button>
          </td>
          {/each}
        </tr>
        {/each}
      </tbody>
      {/if}
    </table>
  </div>
</div>


<style>
  .c-datepicker td {
    padding: 0;
  }
  .dt-table {
    width: 100%;
  }
  .is-today {
    color: red;
  }
  .not-current {
    color: #ccc;
  }
  .btn {
    border: 0;
    background: transparent;
    text-align: center;
    width: 100%;
  }
  .btn-header {
    width: auto;
    font-weight: bold;
  }
  .btn:hover {
    background-color: #eee;
    border-color: #ddd;
  }
  .is-selected .btn {
    background-color: #286090;
    border-color: #204d74;
    color: white;
    opacity: 0.9;
  }
  thead .btn:hover {
    background-color: rgb(223, 223, 223);
    color: black;
  }
  .c-section-large .btn {
    height: 60px;
  }
  .c-section-center th {
    text-align: center;
    font-size: 90%;
  }
  .calendar-header {
    display: flex;
    justify-content: space-between;
  }
  .is-today:before {
    position: absolute;
    content: '';
    margin-left: 4px;
    margin-top: 4px;
    border-left: 4px solid #ccc;
    border-top: 4px solid #ccc;
    border-bottom: 4px solid transparent;
    border-right: 4px solid transparent;
    border-radius: 2px;
    height: 4px;
    z-index: 2;
  }
  .is-today:hover:before {
    border-left-color: #286090;
    border-top-color: #286090;
  }
  .is-selected.is-today:before {
    border-left-color: #eee;
    border-top-color: #eee;
  }
</style>