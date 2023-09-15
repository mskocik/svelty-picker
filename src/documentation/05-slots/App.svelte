<script>
	import SveltyPicker from 'svelty-picker';

	let value;
	let autocommit = false;
</script>
<SveltyPicker bind:value {autocommit} displayFormat="mm/dd/yyyy">
  <svelte:fragment slot="inputs"
    let:value
    let:displayValue
    let:isDirty
    let:onInputFocus
    let:onInputBlur
    let:onKeyDown
  >
    <input type="text" {value} readonly placeholder="Custom value input" on:focus={e => e.target.nextElementSibling.focus()}>
    <input type="text" value={displayValue} placeholder="Custom dislay input"
			on:keydown={onKeyDown} on:focus={onInputFocus} on:blur={onInputBlur}
		>

	</svelte:fragment>
	<svelte:fragment slot="action-row"
		let:i18n
		let:onConfirm
		let:onToday
		let:onCancel
		let:onClear
		let:autocloseSupported
		let:isTodayDisabled
		let:todayBtn
		let:clearBtn
		let:currentMode
	>
	{#if !autocloseSupported || true}
    <div class="flex justify-end mt-2">
      {#if !autocloseSupported}
      <span>
        <button type="button" class="sdt-action-btn" on:click={onCancel}>{i18n.cancelBtn}</button>
        <button type="button" class="sdt-action-btn" on:click={onConfirm}>{i18n.okBtn}</button>
      </span>
      {/if}
      {#if todayBtn || clearBtn}
      <span>
        {#if todayBtn && currentMode === 'date'}<button type="button" on:click={onToday} disabled={isTodayDisabled}>{i18n.todayBtn}</button>{/if}
        {#if clearBtn}<button type="button" class="my-class" on:click={onClear}>{i18n.clearBtn}</button>{/if}
      </span>
      {/if}
    </div>
    {/if}
	</svelte:fragment>
</SveltyPicker>
