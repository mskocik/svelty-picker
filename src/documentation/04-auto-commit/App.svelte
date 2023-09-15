<script>
	import SveltyPicker from 'svelty-picker';

	let modes = ['date', 'datetime', 'time'];
	let activeMode = 'date';
	let isRange = false;
	let autocommit = false;

	$: format = activeMode === 'date'
		? 'yyyy-mm-dd'
		: (activeMode === 'time'
			? 'hh:ii'
			: 'yyyy-mm-dd hh:ii'
		);

	let value;
</script>

<div class="my-4" style="display: flex; gap: 1rem">
	<fieldset>
		<legend>Settings</legend>
		<label for="ac">
			<input type="checkbox" name="ac" id="ac" bind:checked={autocommit}>
			Auto-commit
		</label><br>
		<label for="range">
			<input type="checkbox" name="range" id="range" bind:checked={isRange}>
			Date range mode
		</label>
	</fieldset>
	<fieldset>
		<legend>Modes</legend>
		{#each modes as mode}
		<label for={mode} style="margin: 0 1rem"><input type="radio" bind:group={activeMode} value={mode} id={mode}> {mode}</label>
		{/each}
	</fieldset>
</div>

Selected value: {value}<br>
<SveltyPicker {autocommit} {format} {isRange} bind:value/>

<style>
	.my-4 {
		margin: 1rem 0;
	}
	fieldset {
		padding: 1rem;
	}
</style>
