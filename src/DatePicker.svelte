<script>
  import { onMount } from 'svelte';
import { each } from 'svelte/internal';
  import { fade } from 'svelte/transition';
  import { compute, MODE_MONTH, MODE_YEAR, MODE_DECADE } from './dateUtils.js';
  import { en as i18n } from './i18n.js';

  export let date = new Date();
  let activeDate = date;

  let currentView = MODE_MONTH;
  let demoInput;


  $: dataset = compute(activeDate, currentView, i18n);

  function isBetween(num) {
    return dataset.prevTo <= num && num < dataset.nextFrom;
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

  function updateActiveDate(value) {
    switch (currentView) {
      case 0:
        activeDate.setYear(value);
        break;
      case 1:
        activeDate.setUTCMonth(i18n.monthsShort.indexOf(value));
        break;
      case 2:
        activeDate.setDate(value);
        activeDate = activeDate;
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

  onMount(() => {
    demoInput.focus();
  });
</script>


<div>
  <input bind:this={demoInput}> {activeDate.toDateString()}
</div>

{currentView}

<div class="c-datepicker" style="width:400px">
  <div class="c-datepicker-section">
    <table class="dt-table table">
      <thead>
        <tr>
          <td><button on:click={() => changeMonth(-1)}>P</button></td>
          <td colspan="5">
            <button on:click={onSwitchView}>{tableCaption}</button>
          <button on:click={() => { currentView++}} >+</button></td>
          <td><button on:click={() => changeMonth(1)}>N</button></td>
        </tr>
      </thead>
      {#if currentView === MODE_DECADE}
      <tbody in:fade={{duration: 200}}>
        {#each dataset.yearGrid as row, i}
        <tr>
          {#each row as year, j}
          <td>
            <button on:click|preventDefault={() => { updateActiveDate(year)}}>{year}</button>
          </td>
          {/each}
        </tr>
        {/each}
      </tbody>  
      {/if}
      {#if currentView === MODE_YEAR}
      <tbody in:fade={{duration: 200}}>
        {#each dataset.monthGrid as row, i}
        <tr>
          {#each row as month, j}
          <td>
            <button on:click|preventDefault={() => { updateActiveDate(month)}}>{month}</button>
          </td>
          {/each}
        </tr>
        {/each}
      </tbody>  
      {/if}
      {#if currentView === MODE_MONTH}
      <tbody in:fade={{duration: 200}}>
        {#each dataset.dayGrid as row, i }
        <tr>
          {#each row as date, j}
          <td class:is-today={i*7+j === dataset.todayMark} class:not-current={!isBetween(i*7+j, date) }>
            <button on:click|preventDefault={() => {updateActiveDate(date.getUTCDate())}}>{date.getUTCDate()}</button>
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
  h2 {
    margin-bottom: 0.5rem;
  }
  .is-today {
    color: red;
  }
  .not-current {
    color: #ccc;
  }
</style>