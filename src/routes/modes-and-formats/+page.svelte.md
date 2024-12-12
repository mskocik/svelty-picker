<script>
  import Tabs from './Tabs.svelte';
  import SveltyPicker from '$lib';

  let items = [
    {
      label: 'Standard Format',
      value: 1,
      component: standard
    },
    {
      label: 'PHP Format',
      value: 2,
      component: php
    },
  ];

  let valueDefault = $state(null);
	let valueDifferent = $state(null);
	let valueTimeOnly = $state(null);
</script>


# Modes & formats


{#snippet standard()}
| Format | Description                                                                      | Example
|--------|----------------------------------------------------------------------------------|--------------------------------------
| `d`    | day of the month without leading zeros                                           | 1 to 31
| `dd`   | day of the month, 2 digits with leading zeros                                    | 01 to 31
| `D`    | short textual representation of a weekday (i18n.daysShort)                       | Mon through Sun
| `DD`   | long textual representation of a weekday (i18n.days)                             | Sunday through Saturday
| `S`    | English ordinal suffix for the day of the month, (i18n.suffix)                   | st, nd, rd or th. Works well with `d`
| `m`    | numeric representation of month without leading zeros                            | 1 to 12
| `mm`   | numeric representation of the month, 2 digits with leading zeros                 | 01 to 12
| `M`    | short textual representation of a month, three letters (i18n.monthsShort)        | Jan through Dec
| `MM`   | full textual representation of a month, such as January or March (i18n.months)   | January through December
| `yy`   | two digit representation of a year                                               | 99 or 03
| `yyyy` | full numeric representation of a year, 4 digits                                  | 1999, 2003
| `h`    | hour without leading zeros - 24-hour format                                      | 0 - 23
| `hh`   | hour, 2 digits with leading zeros - 24-hour format                               | 00 - 23
| `H`    | hour without leading zeros - 12-hour format                                      | 1 - 12
| `HH`   | hour, 2 digits with leading zeros - 12-hour format                               | 01 - 12
| `i`    | minutes, 2 digits with leading zeros                                             | 00 - 59
| `ii`   | alias for `i`                                                                    | 00 - 59
| `s`    | seconds, 2 digits with leading zeros                                             | 00
| `ss`   | alias for `s`                                                                    | 00
| `p`    | meridian in lower case ('am' or 'pm') - according to locale file (i18n.meridiem) | am or pm
| `P`    | meridian in upper case ('AM' or 'PM') - according to locale file (i18n.meridiem) | AM or PM
| `t`    | timestamp in milliseconds (although milliseconds are always 0).  |
{/snippet}

{#snippet php()}
| Format | Description                                                         | Example
|------|---------------------------------------------------------------------|--------------------------------------
| `d`  |	Day of the month, 2 digits with leading zeros 	                   | 01 to 31
| `D`  |	A textual representation of a day, three letters 	                 | Mon through Sun
| `j`  |	Day of the month without leading zeros 	                           | 1 to 31
| `l`  |	A full textual representation of the day of the week 	             | Sunday through Saturday
| `N`  |	ISO 8601 numeric representation of the day of the week 	           | 1 (for Monday) through 7 (for Sunday)
| `S`  |	English ordinal suffix for the day of the month, 2 characters 	   | st, nd, rd or th. Works well with `j`
| `F`  |	A full textual representation of a month, such as January or March | January through December
| `m`  |	Numeric representation of a month, with leading zeros 	           | 01 through 12
| `M`  |	A short textual representation of a month, three letters 	         | Jan through Dec
| `n`  |	Numeric representation of a month, without leading zeros 	         | 1 through 12
| `Y`  |	A full numeric representation of a year, at least 4 digits         | 0787, 1999, 2003
| `y`  |	A two digit representation of a year                               | 99 or 03
| `a`  |	Lowercase Ante meridiem and Post meridiem 	                       | am or pm
| `A`  |	Uppercase Ante meridiem and Post meridiem 	                       | AM or PM
| `g`  |	12-hour format of an hour without leading zeros 	                 | 1 through 12
| `G`  |	24-hour format of an hour without leading zeros 	                 | 0 through 23
| `h`  |	12-hour format of an hour with leading zeros 	                     | 01 through 12
| `H`  |	24-hour format of an hour with leading zeros 	                     | 00 through 23
| `i`  |	Minutes with leading zeros 	                                       | 00 to 59
| `s`  |	Seconds with leading zeros 	                                       | 00
| `U`  | timestamp in seconds. |
{/snippet}

### Mode

By `mode` property you can restrict modes in which picker operates. This property can have following values:

- `date` - only date picker
- `time` - only time picker
- `datetime` - date & time picker
- `auto` (default) - mode is determined based on passed `format` property. This basically means you can activate `time` picker mode by setting `displayFormat` (or `format` if those 2 values should be the same) to `hh:ii` for example

*Note:* range-picker is activated by `isRange` property, so you can still set appropriate mode for range-pickers.

### Format

Component has 2 separate format-related properties:

- `format` - defines string representation of selected Date object(s). This string is sent in `change` event or when form is submitted. Default value is `yyyy-mm-dd`
- `displayFormat` - independent date format controlling how the date is being displayed to the user. When not set, `format` value is being used.

Both propertie also have corresponding _type_ property, ie. `formatType` for `format` and `displayFormatType` for `displayFormat`.
There are 2 available options for `formatType` props - `standard` (default)  and `php`. And again if `displayFormatType` is undefined, `formatType` is being used as fallback.

<div class="vp-doc-table">
  <Tabs {items} />
</div>

💡 For timestamp in ***seconds*** use `php` formatting. For timestamp with ***miliseconds*** use `standard` formatting.

### Example

<div class="flex">
	<div>
		<div>
			<code>Format</code> === <code>displayFormat</code><br>Internal value: <code>{valueDefault || 'null'}</code>
		</div>
		<SveltyPicker bind:value={valueDefault} manualInput/>
	</div>
	<div>
		<div>
			<code>Format</code> !== <code>displayFormat</code><br>Internal value: <code>{valueDifferent || 'null'}</code>
		</div>
		<SveltyPicker bind:value={valueDifferent} displayFormat="j. n. Y" displayFormatType="php"/>
	</div>
	<div>
		<div>
			<i>Time only</i> format:<br>Internal value: <code>{valueTimeOnly || 'null'}</code>
		</div>
		<SveltyPicker bind:value={valueTimeOnly} format="hh:ii" displayFormat="HH:ii P"/>
	</div>
</div>

```svelte
<div class="flex">
	<div>
		<div>
			Format === displayFormat<br>Internal value: <code>{valueDefault}</code>
		</div>
		<SveltyPicker bind:value={valueDefault}/>
	</div>
	<div>
		<div>
			Format !== displayFormat<br>Internal value: <code>{valueDifferent}</code>
		</div>
		<SveltyPicker bind:value={valueDifferent} displayFormat="j. n. Y" displayFormatType="php"/>
	</div>
	<div>
		<div>
			Time only format:<br>Internal value: <code>{valueTimeOnly}</code>
		</div>
		<SveltyPicker bind:value={valueTimeOnly} format="hh:ii" displayFormat="HH:ii P"/>
	</div>
</div>
```

<style>
  .flex {
    display: flex;
    gap: 16px
  }
</style>
