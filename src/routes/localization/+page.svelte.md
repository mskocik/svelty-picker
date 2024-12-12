
<script>
  import * as i18n from '$lib/i18n/index.js';
  import SveltyPicker from '$lib/index.js';

  const keys = Object.keys(i18n).filter(k => k !== 'default').join(' | ');

</script>

# Localization

By default date picker uses english locale. And at the moment there is only few locales available
(PRs for additional locales are more than welcome).

Available locales: <code>{keys}</code>

Setting locale is perfect use case for using [global configuration](/global-config).

## Example

<div class="flex">
	<div>
		<div>My german picker</div>
		<SveltyPicker pickerOnly i18n={i18n.de}/>
	</div>
	<div>
		<div>Japanese override</div>
		<SveltyPicker pickerOnly i18n={i18n.jp} />
	</div>
</div>

<div class="vp-doc-table">

</div>


```svelte
<script>
	import SveltyPicker, { config } from 'svelty-picker';
	import { de, jp } from 'svelty-picker/i18n';

	// all pickers set to german and to start week on saturday
	config.i18n = de;
	config.weekStart = 6;
</script>

<div class="flex">
	<div>
		<h3>My german picker</h3>
		<SveltyPicker pickerOnly />
	</div>
	<div>
		<h3>Japanese override</h3>
		<SveltyPicker pickerOnly i18n={i18n.jp} />
	</div>
</div>
```

<style>
	.flex {
		display: flex;
		gap: 1rem;
	}
</style>
