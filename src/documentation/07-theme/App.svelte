<script>
	import SveltyPicker from 'svelty-picker';
</script>

The picker's mode responds to website light/dark mode setting.  
<SveltyPicker pickerOnly mode="datetime" />

<style>
	:global(.dark) {
		--sdt-bg-main: #585858;
		--sdt-shadow-color: #777;
		--sdt-color: #eee;
		--sdt-header-color: #eee;
		--sdt-primary: #e1ac4a;
		--sdt-disabled-date: #b22222;
		--sdt-disabled-date-bg: var(--sdt-bg-main);
		--sdt-btn-bg-hover: #777;
		--sdt-btn-header-bg-hover: #777;
		--sdt-color-selected: #fff;
		--sdt-today-indicator: #ccc;
		--sdt-clock-bg: #999;
		/* custom buttons */
		--sdt-today-bg: #e4a124;
		--sdt-today-color: #fff;
		--sdt-clear-color: #666;
		--sdt-clear-bg: #ddd;
		--sdt-clear-hover-color: #fff;
		--sdt-clear-hover-bg: #dc3545;
	}
	:global(.light) {
		--sdt-bg-main: #fff;
		--sdt-shadow-color: #ccc;
		--sdt-color: inherit;
		--sdt-primary: #286090;
		--sdt-disabled-date: #b22222;
		--sdt-disabled-date-bg: var(--sdt-bg-main);
		--sdt-btn-bg-hover: #eee;
		--sdt-btn-header-bg-hover: #dfdfdf;
		--sdt-color-selected: #fff;
		--sdt-today-indicator: #ccc;
		--sdt-clock-bg: #eeeded;
		/* custom buttons */
		--sdt-today-bg: #1e486d;
		--sdt-today-color: #fff;
		--sdt-clear-color: #dc3545;
		--sdt-clear-bg: #fff;
		--sdt-clear-hover-color: #fff;
		--sdt-clear-hover-bg: #dc3545;
	}
</style>