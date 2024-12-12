<script>
  import SveltyPicker from '$lib';

	let modes = $state(['date', 'datetime', 'time']);
	let activeMode = $state('date');
	let isRange = $state(false);
	let autocommit = $state(true);

	let format = $derived(activeMode === 'date'
		? 'yyyy-mm-dd'
		: (activeMode === 'time'
			? 'hh:ii'
			: 'yyyy-mm-dd hh:ii'
		)
  );

	let value = $state(null);
	let rangeValue = $state([]);

  let prevMode = activeMode;
  // reset when mode is changed
  // $effect(() => {
  //   if (prevMode !== activeMode) {
  //     prevMode = activeMode;
  //     setTimeout(() => {
  //       value = isRange ? [] : null;
  //     }, 100);
  //   }
  // });
</script>


# Auto-commit changes


On every change by mouse/touch, change callbacks are triggered. So if you use `datetime` picker, for every part - day, hour, minute there will be one event triggered. In some situations this may not be desired, therefore you can disable `autocommit`



<blockquote style="background-color: var(--vp-code-bg)">

<details style="padding: 16px; 0">
  <summary style="margin: 0">Historical context</summary>
  <div class="padding-top: 8px">
    <p>
Previous versions (below v4) had problem that every interaction triggered change event. This was visible especially when picker was used in `datetime` mode.
Therefore the whole logic has been reworked and basically we can talk about two modes - "auto commit" and "manual commit".
    </p>

    <p>
    In v6 it was reverted back, because it simplified codebase massively and it's really straightforward
    </p>
  </div>
</details>

</blockquote>


### Auto-commit mode

For datepicker it's simple. User picks a date, bound value (if any) is updated, `change` event triggered and picker is closed.
For timepicker it's very similar (`change` triggered on every update) with the exception that picker closes automatically only
after _minute_ selection. So you can change hour many times and picker will stay open. Select minutes and it will close. Also  event is triggered etc.

When using keyboard to change date, bound value is not updated immediately, but only by hitting <code>Enter</code> or on input
blur. This is very important distinction against manual value setting.

### Manual-commit mode

When `autocommit` is set to `false`, buttons **_Ok_** and **_Cancel_** are shown by default (can be overwritten by `actionRow` snippet).
In this mode the main difference is, that value is set and event triggered only on `Enter` key or pressing `Ok` button.
Pressing `Cancel` or leaving input _resets_ internal state to previous value (if set).

** 💡 IMPORTANT NOTE**

When using `isRange` with combination of `'datetime` mode., auto-commit is _always_ OFF automatically to provide meaningful user experience.


## Example

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

<div class="vp-doc">
  {#if isRange}
  <SveltyPicker {autocommit} {format} isRange bind:value={rangeValue} placeholder="Nothing selected"/>
  Selected value: <code>{rangeValue}</code>
  {:else}
  {#key activeMode}
    <SveltyPicker {autocommit} {format} bind:value placeholder="Nothing selected"/>
  {/key}
  Selected value: <code>{value}</code>
  {/if}
</div>

<style>
	.my-4 {
		margin: 1rem 0;
	}
	fieldset {
		padding: 1rem;
	}
</style>
