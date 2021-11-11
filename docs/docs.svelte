<script>
  import { onMount } from 'svelte';
  import SveltyPicker from './../src/SveltyPicker.svelte';
  import { config } from './../index';
  import { registerElement } from './../component.js';

  let now = new Date();
  let myProp = `${now.getFullYear()}-${now.getUTCMonth() + 1}-${now.getDate()} `
    + `${now.getHours()}:${now.getUTCMinutes() < 10 ? `0${now.getUTCMinutes()}` : now.getUTCMinutes()}`;
  let modalProp = null;

  let pickerFormat = 'yyyy-mm-dd hh:ii';

  onMount(() => {
    registerElement('el-picker')
    if (location.href === 'http://localhost:5000/') return;
    const requestURL = 'https://raw.githubusercontent.com/mskocik/simple-datepicker/master/README.md'
    fetch(requestURL).then(resp => resp.text())
      .then(textResponse => {
        document.getElementById('readme').innerHTML = marked.parse(textResponse)
      });
  });
</script>

<div class="container">
  <div class="text-center">
    <h1>Simple Date &amp; time picker</h1>
    <small><em>Using bootstrap css for showcase</em></small>
  </div>

  
  <h5 class="mt-5">
    Full example. Selected format determines, if time picker is active.
    <small>They affect each other</small>
  </h5>

  <div class="row">
    <div class="col-sm-6">
      <div class="form-group">
        <span class="form-label">
          Full date-time picker
        </span>
        <SveltyPicker placeholder="Pick your date and time"
          inputClasses="form-control"
          format={pickerFormat}
          bind:value={myProp} initialDate={new Date()}
        ></SveltyPicker>
      </div>
    </div>
    <div class="col-sm-6">
      
      Format:
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
        </optgroup>
      </select>
    </div>
  </div>


  <div class="row">
    <div class="col-sm-6">
      <h5 class="mt-5">
        Disabled dates with <code>startDate</code> &amp; <code>endDate</code> properties
      </h5>
      <div class="form-group">
        <div class="input-group">
          <el-picker input-classes="form-control" mode="date" id="fromPicker" to="toPicker" placeholder="From"></el-picker>
          <span class="input-group-text">&ndash;</span>
          <el-picker input-classes="form-control" mode="date" id="toPicker" from="fromPicker" placeholder="To"></el-picker>
        </div>
      </div>
      <p>
        Selected date of <b>From</b> serves as <code>startDate</code> for <b>To</b> date picker and vice versa, where <b>To</b>
        serves as <code>endDate</code> for <b>From</b> date picker.
      </p>
    </div>
    <div class="col-sm-6">
      <h5 class="mt-5">
        Timepicker only. Forced by <code>mode</code> set to <code>time</code>.
      </h5>
      <div class="form-group">
        Time picker only:
        <SveltyPicker inputClasses="form-control" mode="time" format="hh:ii"></SveltyPicker>
      </div>
    </div>
  </div>

  <h5 class="mt-5">
    Pickers with <code>pickerOnly</code> property set.
  </h5>

  <div class="row mb-4">
    <div class="col d-flex">
      <div class="me-4">
        Date picker
        <!-- only (always visible) -->
        <SveltyPicker inputClasses="form-control" mode="date" pickerOnly></SveltyPicker>
      </div>
      <div class="me-4">
        Date time picker
        <!-- only (always visible) -->
        <SveltyPicker inputClasses="form-control" mode="datetime" pickerOnly></SveltyPicker>
      </div>
      <div>
        Time picker
        <!-- only (always visible) -->
        <SveltyPicker inputClasses="form-control" mode="time" format="hh:ii" pickerOnly></SveltyPicker>
      </div>
    </div>
  </div>
  <hr>
  <div id="readme"></div>
</div>

<style>
  .container {
    max-width: 960px;
  }
</style>
