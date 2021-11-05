<script>
  import DatePicker from './../src/DatePicker.svelte';
  let myProp = '2021-01-04'
</script>

<div class="p-4">
  <h3>Datepicker</h3>
  
  <div class="d-flex">
    <div class="mr-2" style="position: relative">
      <DatePicker
        bind:date={myProp}
        visible={false}
        on:input={e => console.log(e.target.value)}
      ></DatePicker>
    </div>
    <div class="ml-4">
      <DatePicker
        visible={false}
      ></DatePicker>
    </div>
  </div>
  <div>
    <input class="bootstrap-datepicker" size="16" type="text" 
      value="2021-04-19"
      data-provide="datepicker"
      data-date-weekstart="1"
      data-date-autoclose="true"
      data-date-format="yyyy-mm-dd"
      >
  </div>
  <hr>
  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis commodi autem saepe iusto rem reiciendis adipisci officia id ea, repudiandae, perspiciatis maiores consequatur aperiam quos ab quia omnis explicabo accusamus?</p>
  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis commodi autem saepe iusto rem reiciendis adipisci officia id ea, repudiandae, perspiciatis maiores consequatur aperiam quos ab quia omnis explicabo accusamus?</p>
  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis commodi autem saepe iusto rem reiciendis adipisci officia id ea, repudiandae, perspiciatis maiores consequatur aperiam quos ab quia omnis explicabo accusamus?</p>
</div>



