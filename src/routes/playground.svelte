<script>
  // @ts-nocheck
  import { base } from '$app/paths';

  import SveltyPicker from "$lib/components/SveltyPicker.svelte";
  import {en, de} from "$lib/i18n";
  
  import OptionsMD from './_markdown/options.md';
  import Format from './_markdown/formatting.md';
  import FormatPhp from './_markdown/formatting_php.md';

  function onBack() {
    history.go(-1);
  }

  let disabled = false;
  let placeholder = "You can play with settings"
  let initialDate = new Date();
  let startDate = null;
  let endDate = null;
  let pickerOnly = false;
  let weekStart = 1;
  let value = '';
  let format = '';
  let formatType = 'standard';
  let mode = 'auto';
  let todayBtn = true;
  let clearBtn = true;
  let clearToggle = true;
  let autoclose = true;
  let i18n = en;

  $: {
    format = formatType === 'php'
      ? 'Y-m-d H:i'
      :'yyyy-mm-dd hh:ii'
  }

</script>

<div class="flex justify-between border-b-1 border-grey-500 px-4 py-2">
  <button on:click={onBack}>&larr; Back</button>
  <span class="inline-flex items-end">
    <a href="{base}/">
      <h1 class="text-xl hover:(underline underline-gray-300)">📅 Svelty Picker</h1>
    </a>: Playgroung
  </span>
  <span></span>
</div>
<div class="flex flex-col lg:flex-row m-4">
  <div class="w-full lg:w-1/2 mr-1">
    <div class="font-bold text-2">Your component</div>
    {#if !pickerOnly}
    <SveltyPicker inputClasses="picker-style" bind:value
      {disabled} {placeholder} {initialDate} {startDate} {endDate}  {i18n}
      {weekStart} {format} {formatType} {mode} {todayBtn} {clearBtn} {clearToggle} {autoclose}
    ></SveltyPicker>
    {:else}
    <SveltyPicker inputClasses="picker-style" bind:value
      {disabled} {placeholder} {initialDate} {startDate} {endDate} pickerOnly {i18n}
      {weekStart} {format} {formatType} {mode} {todayBtn} {clearBtn} {clearToggle} {autoclose}
    ></SveltyPicker>
    {/if}

    <div class="my-5">
      Your selection: <code>{value}</code>
    </div>

    <details class="my-5">
      <summary class="font-semibold">Expand options table</summary>
      <OptionsMD></OptionsMD>
    </details>
  </div>
  <div class="w-full lg:w-1/2 ml-1 settings">
    <h3 class="font-bold text-lg">Available options</h3>

    <div class="flex flex-wrap">
      <div class="w-full lg:w-1/2">
        <div>
          <label for="startDate">Start Date (limit from)</label><br>
          <SveltyPicker inputId="startDate" bind:value={startDate} format={format} formatType={formatType} inputClasses="picker"></SveltyPicker>
        </div>
        <div>
          <label for="endDate">End Date (limit to)</label><br>
          <SveltyPicker inputId="endDate"  bind:value={endDate} format={format} formatType={formatType} inputClasses="picker"></SveltyPicker>
        </div>
        <div>
          <label for="week">Week start</label><br>
          <input type="number" id="week" min="0" max="6" bind:value={weekStart}>
        </div>
        <div class="my-2">
          Language<br>
          <label><input type="radio" bind:group={i18n} value={en}> <span>🇬🇧</span></label>
          <label class="ml-2"><input type="radio" bind:group={i18n} value={de}> <span>🇩🇪</span></label>
        </div>
      </div>
      <div class="w-full lg:w-1/2">
        <div class="line">
          <label><input type="checkbox" name="" id="" bind:checked={disabled} disabled={pickerOnly}> Disabled</label>
        </div>
        
        <div class="line">
          <label><input type="checkbox" name="" id="" bind:checked={pickerOnly}> Picker Only</label>
        </div>
        
        <div class="line">
          <label><input type="checkbox" name="" id="" bind:checked={todayBtn}> Today button</label>
        </div>
        
        <div class="line">
          <label><input type="checkbox" name="" id="" bind:checked={clearBtn}> Clear Button</label>
        </div>
        
        <div class="line">
          <label><input type="checkbox" name="" id="" bind:checked={clearToggle}> Clear Toggle</label>
        </div>
        
        <div class="line">
          <label><input type="checkbox" name="" id="" bind:checked={autoclose} disabled={pickerOnly}> Autoclose</label>
        </div>
      </div>
    </div>
    
    <hr>
    <h3 class="font-bold text-lg mt-2">Mode & formats: </h3>
    Mode:
    <div class="line">
      <label><input type="radio" value="auto" disabled> Auto (default) </label>
      <label><input type="radio" value="date" id="" bind:group={mode}> Date</label>
      <label><input type="radio" value="datetime" id="" bind:group={mode}> Datetime</label>
      <label><input type="radio" value="time" id="" bind:group={mode}> Time</label>
    </div>

    <p class="my-2">Mode is by default resolved by provided format or <code>yyyy-mm-dd</code> if not specified.</p>
    
    <div class="flex flex-wrap items-center mb-2">
      <span>Format type:</span>
      <div class="line">
        <label><input type="radio" value="standard" id="" bind:group={formatType}> Standard</label>
        <label><input type="radio" value="php" id="" bind:group={formatType}> PHP</label>
      </div>

    <div class="whitespace-nowrap">

      <span>Format:</span>
      {#if formatType === 'standard'}
      <select name="" id="" class="form-select" bind:value={format}>
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
        <optgroup label="Date only">
          <option value="hh:ii">hh:ii</option>
          <option value="H:i P">H:i P</option>
        </optgroup>
      </select>
      {:else}
      <select name="" id="" class="form-select" bind:value={format}>
        <optgroup label="Date & time">
          <option value="Y-m-d H:i">Y-m-d H:i</option>
          <option value="m/d/Y H:i">m/d/Y H:i</option>
          <option value="d.m.Y H:i">d.m.Y H:i</option>
          <option value="dd-M-yy H:i">dd-M-yy H:i</option>
        </optgroup>
        <optgroup label="Date only">
          <option value="Y-m-d">Y-m-d</option>
          <option value="m/d/Y">m/d/Y</option>
          <option value="jS M y">jS M y</option>
          <option value="d-M-y">d-M-y</option>
          <option value="F d, Y">F d, Y</option>
        </optgroup>
        <optgroup label="Date only">
          <option value="H:i">H:i</option>
          <option value="g:i A">g:i A</option>
        </optgroup>
      </select>
      {/if}
    </div>
  </div>

    <details>
      <summary class="font-semibold">Expand format settings ({formatType})</summary>
      {#if formatType === 'standard'}
      <Format></Format> 
      {:else}
      <FormatPhp></FormatPhp>
      {/if}
    </details>
  </div>
</div>

<style lang="scss">
  .line {
    display: flex;
    min-height: 30px;
    align-items: center;
    padding: 4px;
    label {
      margin-right: 8px;
    }
  }
  .settings {
    input[type=text],
    input[type=number],
    select {
      border: 1px solid #ccc;
      padding: 2px 4px;
      outline: none;
      &:focus {
        border-color: #777;
      }
    }
    :global(.picker) {
      @apply border-1 border-gray-300 px-1 py-1;
    }
  }
</style>