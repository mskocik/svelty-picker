<script>
	import SveltyPicker from 'svelty-picker';

	let log = '';
	let counter = 0;

	function logEvent(e) {
		counter++;
		log = `#${counter} event: ${e.type}${e.type !== 'blur' ? '; value: ' + e.detail : ''}\n`
			+ log;
	}
</script>


<div class="flex">
	<SveltyPicker autocommit={false} placeholder="Pick a date"
		on:input={logEvent}
		on:change={logEvent}
		on:blur={logEvent}
	/>
	<textarea id="log" rows="15" cols="15" bind:value={log} class="w-full" placeholder="Event log"></textarea>
</div>


<style>
	.flex {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
	}

	.w-full {
		width: 100%;
	}
</style>

