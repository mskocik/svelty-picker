```svelte
<SveltyPicker theme="my-colors"></SveltyPicker>

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
      --sdt-clock-bg: #7b7b7b;
      --sdt-shadow: #ccc;
      --sdt-disabled-date: #b22222;
  }
</style>
```