<script>
  import Formatting from './_markdown/formatting.md';
  import FormattingPhp from './_markdown/formatting_php.md';
  import SveltyPicker from '$lib/components/SveltyPicker.svelte';

  let formatType = 'standard';
  let format = 'yyyy-mm-dd';

  $: {
    format = formatType === 'php' ? 'Y-m-d' : 'yyyy-mm-dd';
  }
</script>


<h2 class="header">Format settings</h2>
<p class="my-3">
  Date format can be defined under <code class="code">formatType</code> property. It has two options: <code class="code">standard</code>
  and <code class="code">php</code> where <code class="code">standard</code> is the <b class="font-bold">default</b>.
</p>

<p class="my-3 font-bold">
  If <code class="code">mode</code> is not specified explicitely, time picker is available only when time formatting is present.
</p>

<div class="bg-orange-200 dark:bg-blue-400 p-5 rounded-lg w-full">
  <h3 class="header mt-0">Playground</h3>
  <div class="flex flex-wrap">
    <div class="w-full lg:w-1/2">
      <SveltyPicker placeholder="Pick some date and define your own format" inputClasses="picker-style" {format} {formatType}></SveltyPicker>
    </div>
    <div class="w-auto mr-2 lg:mx-2">
      <input type="text" class="picker-style" bind:value={format}>
    </div>
    <div class="w-auto flex items-center">
      <label><input type="radio" bind:group={formatType} value="standard"> Standard </label>
      <label class="ml-4"><input type="radio" bind:group={formatType} value="php"> PHP</label>
    </div>
  </div>
</div>

<h3 class="header">Formatting options ({formatType})</h3>
{#if formatType !== 'php'}
<Formatting></Formatting>
{:else}
<FormattingPhp></FormattingPhp>
{/if}

