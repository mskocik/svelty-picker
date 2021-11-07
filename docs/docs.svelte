<script>
  import { onMount } from 'svelte';
  import SveltyPicker from '../src/SveltyPicker.svelte';
  let myProp = null;
  let modalProp = null;

  onMount(() => {
    const requestURL = location.href === 'http://localhost:5000/'
      ? 'http://localhost:8000/README.md'
      : 'https://raw.githubusercontent.com/mskocik/simple-datepicker/master/README.md'
    fetch(requestURL).then(resp => resp.text())
      .then(textResponse => {
        document.getElementById('readme').innerHTML = marked.parse(textResponse)
      });
    });
</script>

<div class="container">
  <div class="text-center">
    <h1>Simple Date & time picker</h1>
  </div>

  
  <div class="row">
    <div class="col-12">
      <div class="form-group">
        <span class="form-label">
          Normal date picker (bootstrap style for input)
        </span>
        <SveltyPicker inputClasses="form-control" format="yyyy-mm-dd hh:ii" bind:value={myProp}></SveltyPicker>
      </div>
    </div>
  </div>

  <div class="row">
    <div class="col-6">
      <div class="form-group">
        Date picker only:
        <SveltyPicker inputClasses="form-control" mode="date"
        ></SveltyPicker>
      </div>
    </div>
    <div class="col-6">
      <div class="form-group">
        Time picker only:
        <SveltyPicker inputClasses="form-control" mode="time" format="hh:ii"></SveltyPicker>
      </div>
    </div>
  </div>
  
  <div class="row">
    <div class="col-6">
      Date picker
       <!-- only (always visible) -->
      <SveltyPicker inputClasses="form-control" mode="date" pickerOnly></SveltyPicker>
    </div>
    <div class="col-6">
      Time picker
       <!-- only (always visible) -->
      <SveltyPicker inputClasses="form-control" mode="time" value="23:00" format="hh:ii" pickerOnly></SveltyPicker>
    </div>
  </div>

  
  <div class="row mt-4">
    <div class="col">
      <!-- Button trigger modal -->
      <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModal">
        Picked date from modal: {modalProp || 'None yet'}
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
        <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae harum explicabo optio mollitia, libero animi corporis quibusdam quia fuga odit exercitationem, iure, est neque ab officia facilis. Sequi, officiis at?</p>
        <p class="mt-2 mb-2">
        </p>
        <SveltyPicker bind:value={modalProp} on:input={() => document.querySelector('[data-dismiss]').click()}></SveltyPicker>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary" data-dismiss="modal">Save changes</button>
      </div>
    </div>
  </div>
</div>
