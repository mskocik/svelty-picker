<script>
  import SveltyPicker from '$lib';

	let startDate = (new Date()).toISOString().slice(0, 7) + '-01';
	let endDate = (new Date()).toISOString().slice(0, 7) + '-28';

	function disableWeekends(date) {
		return date.getDay() === 0 || date.getDay() === 6
	}
</script>


# Disabling dates

Restricting selectable is supported by `startDate` and `endDate` properties. You can provide `string` or `Date`.
When `string` is passed, it must match `format` of given Svelty-picker. These border dates are *INCLUDED* in allowed date range.

It is recommended to pass `strings` and not `Dates` to these properties. When datetime is passed, time range will be restricted
as well if applicable. If conversion from `Date` to `string` is required, you can use ulitity functions as mentioned on [Working with dates](/working-with-dates) page.

If you need something advanced you can provide function through `disableDatesFn`, in which you can resolve whether given date is disabled or not.
Just take into account that all `Date` objects passed into this function will be in local time of given user.

```js
function isDateDisabled(date: Date): bool
```

Both methods can be combined together if needed.

### Example

<br>
<SveltyPicker {startDate} {endDate} placeholder="Only dates 1-28 are allowed"/>
<span class="mx-4"></span>
<SveltyPicker disableDatesFn={disableWeekends} placeholder="Weekends are disabled"/>

```svelte
<script>
	import SveltyPicker from 'svelty-picker';

	let startDate = '2024-12-04';
	let endDate = '2024-12-28';

	function disableWeekends(date) {
		return date.getDay() === 0 || date.getDay() === 6
	}
</script>

<SveltyPicker {startDate} {endDate} placeholder="Only December is allowed"/>

<SveltyPicker disableDatesFn={disableWeekends} placeholder="Weekends are disabled"/>

```

<style>
	.mx-4 {
		margin: 0 16px;
	}
</style>
