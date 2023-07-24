<script>
	import SveltyPicker, { config } from 'svelty-picker';
	import { de, jp } from 'svelty-picker/i18n';

	// all pickers set to german and to start week on saturday
	config.i18n = de;
	config.weekStart = 6;
</script>

<div style="display:flex;gap:1rem">
	<div>
		<h3>My german picker (global) </h3>
		<SveltyPicker pickerOnly />
	</div>
	<div>
		<h3>Japanese override</h3>
		<SveltyPicker pickerOnly i18n={jp} weekStart={1} />
	</div>
</div>