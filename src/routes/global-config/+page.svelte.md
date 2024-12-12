# Global config

Svelty picker exports `config` property, where you can set/change some of the properties globally, which will affect all newly created instances.

Can be usefull especially for formatting, i18n and theme setting to be consistent across the whole app. You should edit the config on your app start to reflect new settings for all _newly created_ pickers.

### Structure

```js
type Config = {
  theme: string;
  format: string;
  formatType: string;
  displayFormat: string?;
  displayFormatType: string?;
  minuteIncrement: number;
  weekStart: number;
  inputClasses: string;
  todayBtnClasses: string;
  clearBtnClasses: string;
  hourOnly: boolean;
  todayBtn: boolean;
  clearBtn: boolean;
  autocommit: boolean;
  i18n: i18nType;
}
```

### Defaults

```js
export default {
  theme: 'sdt-calendar-colors',
  format: 'yyyy-mm-dd',
  formatType: 'standard',
  displayFormat: null,
  displayFormatType: null,
  minuteIncrement: 1,
  weekStart: 1,
  inputClasses: '',
  todayBtnClasses: 'sdt-action-btn sdt-today-btn',
  clearBtnClasses: 'sdt-action-btn sdt-clear-btn',
  hourOnly: false,
  todayBtn: true,
  clearBtn: true,
  autocommit: true,
  i18n: en
}
```

### Example

```svelte
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
```
