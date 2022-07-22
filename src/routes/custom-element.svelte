<script>
  import { onMount } from 'svelte';
  import CustomElement from './_markdown/custom-element.md';

  onMount(() => {
    import('./../lib/index').then(resp => {
      console.log('🥳 registering SveltyPicker as <el-picker> element');
      resp.registerElement && resp.registerElement('el-picker');
    }).catch(e => console.log('error', e));
  })
</script>

<h2 class="header">Custom Element</h2>

<p class="my-4">Custom element is defined as extension to native <code class="code">input</code> tag. Custom element
supports all options that can be passed as string (So all except initialDate).
</p>

Picker initialized as custom element:
<input type="text" name="my-date" is="el-picker" format="dS MM" class="border-2 rounded-md border-gray-300 p-1" placeholder="Pick your birthdate">

<CustomElement></CustomElement>

<p class="my-4">
  Custom element supports 2 custom <code class="code">from</code> and <code class="code">to</code> properties, which should
  specify <b class="font-bold">id</b> of different datetime picker for limiting <code class="code">startDate</code> or <code class="code">endDate</code>.
  Check source how it is defined.
</p>

<div class="group">
  <input type="text" id="picker-from" to="picker-to" name="my-date[from]" format="yyyy-mm-dd" is="el-picker" placeholder="From">
  <div class="delimiter">&mdash;</div>
  <input type="text" id="picker-to" from="picker-from" name="my-date[to]" format="yyyy-mm-dd" is="el-picker" placeholder="To">
</div>

<style>
  .group {
    display: inline-flex;
    align-items: center;
    @apply border-2 rounded-md border-gray-300;
    .delimiter {
      @apply border-gray-300 border-l-2 border-r-2 px-2 py-2;
    }
    input {
      @apply px-2 py-1;
      &:focus {
        outline: none;
      }
    }
  }
</style>