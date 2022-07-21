<script>
  // @ts-nocheck
  import { onMount } from 'svelte';
  import SveltyPicker from '$lib/components/SveltyPicker.svelte';
  // import { registerElement } from '$lib/index.js';
  // import settings from '$lib/settings';
  // import  from '$lib/custom-element.js';
  

  let nowString = '2022-07-16T00:00:00Z';
  // let now = null;
    // now = new Date(nowString);
  let now = new Date();
  let myProp;
  let pickerFormat = 'yyyy-mm-dd hh:ii';
  let pickerFormatType = 'standard';
  // let pickerFormat = 'Y-m-d';
  // let pickerFormatType = 'php';

  let dateFrom, dateTo;

  let themeRemoved = false;
  $: customTheme = themeRemoved ? '' : 'my-colors';

  onMount(() => {
    import('./../lib/index').then(resp => {
      console.log('🥳 success');
      resp.registerElement && resp.registerElement('el-picker');
    }).catch(e => console.log('error', e));
    // registerElement && registerElement('el-picker');
  });

  let log = '';
  function onEvent(e) {
    let val = e.detail !== undefined ? e.detail : (e.target.value || '<empty string>');
    log += `Triggered '${e.type}' event with value: ${val}\n`;
  }
</script>

<div class="container">
  <h1>🥳 Examples</h1>
  <small><em>Using bootstrap css for showcase</em></small>

  <h5 class="mt-5">📅 Full example!</h5>

  <p>
    Selected <code>format</code> determines, if time picker will be available based on time part of given format.
  </p>

  <form on:submit|preventDefault={() => console.log('submit')}>
  <div class="row">
    <div class="col-sm-6">
      <div class="form-group">
        <span class="form-label">
           Full date-time picker
        </span>
        <SveltyPicker placeholder="Pick your date and time"
          inputClasses="form-control"
          format={pickerFormat}
          formatType={pickerFormatType}
          bind:value={myProp} initialDate={now}
        ></SveltyPicker>
      </div>
    </div>
    <div class="col-sm-4">
      Change format:
      <select name="" id="" class="form-select" bind:value={pickerFormat}>
        <optgroup label="Date & time">
          <option value="yyyy-mm-dd hh:ii">yyyy-mm-dd hh:ii</option>
          <option value="mm/dd/yyyy hh:ii">mm/dd/yyyy hh:ii</option>
          <option value="dd.mm.yyyy hh:ii">dd.mm.yyyy hh:ii</option>
          <option value="dd-M-yy hh:ii">dd-M-yy hh:ii</option>
        </optgroup>
        <optgroup label="Date only">
          <option value="yyyy-mm-dd">yyyy-mm-dd</option>
          <option value="mm/dd/yyyy">mm/dd/yyyy</option>
          <option value="dd.mm.yyyy">dd.mm.yyyy</option>
          <option value="dd-M-yy">dd-M-yy</option>
          <option value="dd MM yyyy">dd MM yyyy</option>
        </optgroup>
      </select>
    </div>
  </div>
</form>

  <div class="row">
    <div class="col-sm-6">
      <h5 class="mt-5">
        💡 Limit dates with <code>startDate</code> &amp; <code>endDate</code>.
      </h5>
      <div class="form-group">
        Pick your holiday session:
        <div class="input-group">
          <SveltyPicker inputClasses="form-control" mode="date" id="fromPicker" to="toPicker" placeholder="From" bind:value={dateFrom} endDate={dateTo}></SveltyPicker>
          <span class="input-group-text">&ndash;</span>
          <SveltyPicker inputClasses="form-control" mode="date" id="toPicker" from="fromPicker" placeholder="To" bind:value={dateTo} startDate={dateFrom}></SveltyPicker>
        </div>
      </div>
      <p>
        Selected date of <b>From</b> serves as <code>startDate</code> for <b>To</b> date picker and vice versa, where <b>To</b>
        serves as <code>endDate</code> for <b>From</b> date picker.
      </p>

      <p class="alert alert-info">This example uses <code>Svelty-picker</code> as a <code>custom-element</code>.</p>
    </div>
    <div class="col-sm-6">
      <h5 class="mt-5">
        🕒 Timepicker only. Forced by <code>mode</code> set to <code>time</code>.
      </h5>
      <div class="form-group">
        Time picker only:
        <SveltyPicker inputClasses="form-control" mode="time" format="hh:ii"></SveltyPicker>
      </div>
    </div>
  </div>

  <h5 class="mt-3">
    🎨 Easily themable - just override CSS variables
  </h5>
  <div class="row mb-4">
    <div class="col d-flex flex-wrap">
      <div class="me-4">
        Default theme
        <!-- only (always visible) -->
        <SveltyPicker inputClasses="form-control" mode="date" pickerOnly></SveltyPicker>
      </div>
      <div>
        Custom theme
        <SveltyPicker theme={customTheme} inputClasses="form-control" mode="datetime" pickerOnly></SveltyPicker>
        <label>
          <input type="checkbox" bind:checked={themeRemoved}> Remove all theming
        </label>
      </div>
    </div>
  </div>
  <div class="row">
    <div class="col-6">
      <h3>Datepicker as custom element!</h3>
      <el-picker input-classes="form-control"></el-picker>
    </div>
  </div>

  <h5 class="mt-5">
    💬 Event listening:
  </h5>

  <div class="row mb-4">
    <div class="col-sm-6">
      <div class="form-group">
        <span class="form-label">
          Full date-time picker
        </span>
        <SveltyPicker placeholder="Pick your date and time"
          inputClasses="form-control"
          on:input={onEvent}
          on:change={onEvent}
          on:blur={onEvent}
          initialDate={now}
        ></SveltyPicker>
      </div>
    </div>
    <div class="col-sm-6">
      Event log:
      <textarea placeholder="Event log" id="" cols="30" rows="4" class="form-control" bind:value={log}></textarea>
    </div>
  </div>
  <p>Check more details at <a href="https://github.com/mskocik/svelty-picker" target="_blank">GitHub repository</a>.</p>
</div>

<style>
  :global(.my-colors) {
      --sdt-primary: #998825;
      --sdt-color: #eee;
      --sdt-color-selected: #eee;
      --sdt-bg-main: #333;
      --sdt-bg-today: var(--sdt-primary);
      --sdt-bg-clear: #dc3545;
      --sdt-today-bg: rgb(160, 145, 57);
      --sdt-today-color: var(--sdt-color-selected);
      --sdt-clear-color: #dc3545;
      --sdt-btn-bg-hover: rgb(126, 35, 78);
      --sdt-btn-header-bg-hover: rgb(107, 18, 60);
      --sdt-clock-bg: #eeeded;
      --sdt-clock-bg-minute: #eeeded;
      --sdt-clock-bg-shadow: 0 0 128px 2px #74661834 inset;
      --sdt-shadow: #ccc;
  }
</style>
