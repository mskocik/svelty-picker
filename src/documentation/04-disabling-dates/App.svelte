<script>
	import SveltyPicker from 'svelty-picker';

	let initialDate = new Date();
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



<style>
	.my-4 {
		margin: 16px 0;
	}
</style>