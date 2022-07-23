<script>
  import SveltyPicker from "$lib/components/SveltyPicker.svelte";
  import Styling from './_markdown/styling.md';
</script>

<h2 class="header">Styling options</h2>

<p class="my-4">
  The <code class="code">theme</code> property defined root class, where all CSS variables related to components are defined.
</p>

<div class="flex">
  <div class="w-auto mr-3">
    Custom theme
    <SveltyPicker theme="my-colors" inputClasses="form-control" mode="datetime" pickerOnly></SveltyPicker>
  </div>
  <div class="w-auto">
    Default theme
    <!-- only (always visible) -->
    <SveltyPicker inputClasses="form-control" mode="date" pickerOnly></SveltyPicker>
  </div>
</div>

<div class="mt-4">
  <b class="font-bold">Source of example from above</b>

  <Styling></Styling>
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