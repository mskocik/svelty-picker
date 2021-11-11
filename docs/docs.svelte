<script>
  import { onMount } from 'svelte';
  import SveltyPicker from './../src/SveltyPicker.svelte';
  import { config } from './../index';
  import { registerElement } from './../component.js';

  let myProp = '2021-11-11 11:11';
  let modalProp = null;

  let pickerFormat = 'yyyy-mm-dd';

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

  
  <div class="row">
    <div class="col-12">
      <div class="form-group">
        <span class="form-label">
          Full date-time picker
        </span>
        <SveltyPicker placeholder="Pick your date and time"
          inputClasses="form-control"
          format="yyyy-mm-dd hh:ii"
          bind:value={myProp}
        >
      </SveltyPicker>
      </div>
    </div>
  </div>

  <div class="row">
    <div class="col-sm-6">
      <div class="form-group">
        Date picker only (used as custom element)
        <div class="input-group">
          <el-picker input-classes="form-control" mode="date" id="fromPicker" to="toPicker"></el-picker>
          <span class="input-group-text">&ndash;</span>
          <el-picker input-classes="form-control" mode="date" id="toPicker" from="fromPicker"></el-picker>
        </div>
      </div>
    </div>
    <div class="col-sm-6">
      <div class="form-group">
        Time picker only:
        <SveltyPicker inputClasses="form-control" mode="time" format="hh:ii"></SveltyPicker>
      </div>
    </div>
  </div>
  
  <div class="row">
    <div class="col-sm-6">
      Date picker
       <!-- only (always visible) -->
      <SveltyPicker inputClasses="form-control" mode="date" pickerOnly></SveltyPicker>
    </div>
    <div class="col-sm-6">
      Time picker
       <!-- only (always visible) -->
      <SveltyPicker inputClasses="form-control" mode="time" format="hh:ii" pickerOnly></SveltyPicker>
    </div>
  </div>

  
  <div class="row mt-4">
    <div class="col">
      <!-- Button trigger modal -->
      Select date (and it's format) in modal dialog:<br>
      <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
        Currently selected date: {modalProp || 'None yet'}
      </button>
    </div>
      
  </div>
  <hr>
  <div id="readme"></div>
</div>



<!-- Modal -->
<div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">Date dialog</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
        </button>
      </div>
      <div class="modal-body">
        <p>This modal demonstrates how the positioning works. Even in modal window.<br>Also you can customize output format on-the-fly.</p>
        <p class="mt-2 mb-2">
        </p>
        <div class="row">
          <div class="col">
            Pick your date:<br>
            <SveltyPicker inputClasses="form-control" format={pickerFormat} bind:value={modalProp}></SveltyPicker>
          </div>
          <div class="col">
            Format:
            <select name="" id="" class="form-select" bind:value={pickerFormat}>
              <option value="yyyy-mm-dd">yyyy-mm-dd </option>
              <option value="mm/dd/yyyy">mm/dd/yyyy</option>
              <option value="dd.mm.yyyy">dd.mm.yyyy</option>
              <option value="dd-M-yy">dd-M-yy</option>
            </select>
          </div>
        </div>
        <div class="row">
          <div class="col">
            {#if modalProp}
            <div class="alert alert-success mt-2">Date selected!</div>
            {/if}
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Save changes</button>
      </div>
    </div>
  </div>
</div>

<style>
  .container {
    max-width: 960px;
  }
</style>