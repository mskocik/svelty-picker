<script>
  import { browser } from '$app/environment';
  import SveltyPicker from '$lib/components/SveltyPicker.svelte';
  import TimeSelf from '$lib/components/Time.svelte';
  import { onDestroy, onMount } from 'svelte';
  import { SvelteDate } from 'svelte/reactivity';

  const init_time = (new Date()).toTimeString().slice(0,5);

  let date_datepicker = $state((new Date()).toISOString().slice(0,10));
  let date_timepicker = $state(init_time);
  let date_datetime = $state([
    (new Date()).toISOString().slice(0,10),
    init_time
  ].join(' '))
  let date_range = $state([
    (new Date()).toISOString().slice(0, 10),
    (new Date(Date.now() + 3*24*3600*1000)).toISOString().slice(0, 10)
  ]);
  let datetime_range = $state([
    `${(new Date()).toISOString().slice(0, 10)} ${init_time}`,
    (new Date(Date.now() + 3*24*3600*1000)).toISOString().slice(0, 10) + ' 10:24'
  ]);

  /**
   *
   * @param {string|string[]|null} val
   * @param {'date'|'time'} type
   */
  function updatePickersValue(val, type) {
    console.log('x', val, type, $state.snapshot(date_datetime));
    if (val === null) {
      date_datetime = null;
      return;
    }
    date_datetime = (type === 'time' && date_datetime
      ? [date_datetime.split(' ').shift(), val]
      : [val, date_datetime?.split(' ').pop() || '00:00']
    ).join(' ');
  }
</script>


Simple date & time / daterange picker implemented in svelte.

<div class="flex-center">

  <div class="cells">
    <div>
      Date Picker: <code>{date_datepicker}</code>
      <br>
      <SveltyPicker bind:value={date_datepicker} pickerOnly onChange={date => updatePickersValue(date, 'date')} />
    </div>
    <div>
      Time Picker: <code>{date_timepicker}</code>
      <br>
      <SveltyPicker bind:value={date_timepicker} pickerOnly format="hh:ii"  onChange={time => updatePickersValue(time, 'time')} />
    </div>
  </div>
</div>

### Features

- date/time/datetime/range picker mode
- various formatting options
- keyboard navigation
- replacable slots
- themable
- customizable disabled dates
- custom element

## Install

```bash
npm install svelty-picker
```

For Svelte 4

```bash
npm install svelty-picker@5.2.11
```

## More Examples


<fieldset>
  <legend class="text-center">
    Date Time Picker: <code>{date_datetime}</code>
  </legend>
  <div class="flex-center">
    <SveltyPicker bind:value={date_datetime} pickerOnly format="yyyy-mm-dd hh:ii" />
  </div>
</fieldset>

<hr>

<fieldset>
  <legend class="text-center">Date Range picker: <code>{date_range}</code></legend>

  <div class="flex-center">
    <SveltyPicker bind:value={date_range} isRange pickerOnly format="yyyy-mm-dd" />
  </div>
</fieldset>


<fieldset>
  <legend class="text-center">Date Time Range picker: <code>{datetime_range}</code></legend>

  <div class="flex-center">
    <SveltyPicker bind:value={datetime_range} isRange pickerOnly format="yyyy-mm-dd hh:ii" />
  </div>
</fieldset>

<style>
.cells {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}
@media screen and (min-width: 1024px) {
  .cells {

  }
}
.p-2 {
  padding: 8px;
}
.text-center {
  text-align: center;
}
.flex-center {
  display: flex;
  justify-content: center;
  padding: 16px;
}
</style>
