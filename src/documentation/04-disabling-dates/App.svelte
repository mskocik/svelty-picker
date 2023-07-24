<script>
	import SveltyPicker from 'svelty-picker';

	let initialDate = '2023-07-19';
	let startDate = '2023-07-04';
	let endDate = '2023-07-28';

	function disableWeekends(date) {
		
		return date.getDay() === 0 || date.getDay() === 6
	}
</script>

Restricted selection list:<br>
<SveltyPicker {startDate} {endDate} {initialDate}/>

<div class="my-4"></div>

<SveltyPicker disableDatesFn={disableWeekends}/>



