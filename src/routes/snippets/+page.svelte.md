<script>
  import SveltyPicker from "$lib/components/SveltyPicker.svelte";

  /**
   *
   * @param {import('$lib/types/internal').DateChange} prop
   */
  function setDate({ dateValue }) {
    var time = /** @type {Date|null} */ (dateValue);
    var locale = "en-gb";

    var DD   = time?.getDate();
    var DDD  = time?.toLocaleString(locale, {weekday: "long" });
    var MMM  = time?.toLocaleString(locale, {month:   "short"}).toUpperCase();

    // @ts-ignore
    document.getElementById("day").textContent= DD ?? '?';
    // @ts-ignore
    document.getElementById("weekday").textContent= DDD ?? 'No date';
    // @ts-ignore
    document.getElementById("month").textContent= MMM ?? 'Pick';
  }
</script>

# Snippets

There are 2 available snippets to override/customize.


## children

This snippet can be used for adding icon. Don't forget to position your icon absolutely. Or move your styling to `<input>`'s parent element `.sdt-input-wrap`.

Example of custom interactive svg icon showing currently selected date:

<SveltyPicker inputId="picker-el" inputClasses="my-input" onDateChange={setDate} clearBtn={false}>
  <!-- code borrowed from https://github.com/edent/Dynamic-SVG-Calendar-Icon -->
  <svg
    class="calendar-icon"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Calendar"
    role="img"
    viewBox="0 0 512 512"
  >
    <path
      d="M512 455c0 32-25 57-57 57H57c-32 0-57-25-57-57V128c0-31 25-57 57-57h398c32 0 57 26 57 57z"
      fill="#e0e7ec"
    />
    <path
      d="M484 0h-47c2 4 4 9 4 14a28 28 0 1 1-53-14H124c3 4 4 9 4 14A28 28 0 1 1 75 0H28C13 0 0 13 0 28v157h512V28c0-15-13-28-28-28z"
      fill="#dd2f45"
    />

    <g fill="#f3aab9">
      <circle cx="470" cy="142" r="14" />
      <circle cx="470" cy="100" r="14" />
      <circle cx="427" cy="142" r="14" />
      <circle cx="427" cy="100" r="14" />
      <circle cx="384" cy="142" r="14" />
      <circle cx="384" cy="100" r="14" />
    </g>

    <text
      id="month"
      x="32"
      y="164"
      fill="#fff"
      font-family="monospace"
      font-size="140px"
      style="text-anchor: left">Pick</text
    >

    <text
      id="day"
      x="256"
      y="400"
      fill="#66757f"
      font-family="monospace"
      font-size="256px"
      style="text-anchor: middle">?</text
    >

    <text
      id="weekday"
      x="256"
      y="480"
      fill="#66757f"
      font-family="monospace"
      font-size="64px"
      style="text-anchor: middle">Date</text
    >
  </svg>
</SveltyPicker>

```svelte
<SveltyPicker>
  <svg ... />
</SveltyPicker>
```

## actionRow

Snippet represents row below calendar/time picker. By default showing ***Today*** and ***Clear*** buttons. And if `autocommit`=`false` also
***Ok*** and ***Cancel*** buttons.

💡 If you just want to hide  ***Today*** or ***Clear*** buttons, use controlling props and provide appropriate `i18n` message
instead of overriding `actionRow` snippet.

### Snipet type

```ts
Snippet<[ prop: {
  autocloseSupported: boolean,
  todayBtnClasses: string,
  clearBtnClasses: string,
  onCancel: function,
  onConfirm: function,
  onClear: function,
  onToday: function,
  isTodayDisabled: boolean,
  i18n: import('svelty-picker/i18n').i18nType,
  currentMode: string
}]>
```

Parameter description:

- `autocloseSupported` - determined by `autocommit` and `isRange` properties
- `todayBtnClasses` - CSS classes for 'today' button
- `clearBtnClasses` - CSS classes for 'clear' button
- `onCancel` - discards current selection (when `autocommit` is set to `false`)
- `onConfirm` - handler which confirms current selection (when `autocommit` is set to `false`)
- `onClear` - clears current selection
- `onToday` - selects today date
- `isTodayDisabled` - useful when you use `startDate` or `endDate` or `disableDatesFn` to disable dates. Serves for disabled 'Today' button
- `i18n` - current locale
- `currentMode` - returns currently active mode: `date` or `time` (where `time` is available only for datetime or time picker)

### Default implementation

```svelte
{#snippet action_row({
  autocloseSupported,
  todayBtnClasses,
  clearBtnClasses,
  onCancel,
  onConfirm,
  onClear,
  onToday,
  isTodayDisabled,
  i18n,
  currentMode
})}
  {#if !autocloseSupported || true}
    <div class="sdt-btn-row">
      {#if !autocloseSupported}
      <span>
        <button
          type="button"
          class={clearBtnClasses}
          onclick={onCancel}
        >
          {i18n.cancelBtn}
        </button>
        <button
          type="button"
          class={todayBtnClasses}
          onclick={onConfirm}
        >
          {i18n.okBtn}
        </button>
      </span>
      {/if}
      {#if todayBtn || clearBtn}
      <span>
        {#if todayBtn && currentMode === 'date'}
          <button
            type="button"
            class={todayBtnClasses}
            onclick={onToday}
            disabled={isTodayDisabled}
          >
            {i18n.todayBtn}
          </button>
        {/if}
        {#if clearBtn}
          <button
            type="button"
            class={clearBtnClasses}
            onclick={onClear}
          >
            {i18n.clearBtn}
          </button>
        {/if}
      </span>
      {/if}
    </div>
  {/if}
{/snippet}
```

<style>
  :global(.my-input) {
    min-height: 40px;
    padding: 6px;
    line-height: 28px;
    font-size: 18px;
  }
  .calendar-icon {
    cursor: pointer;
    width: 33px;
    height: 33px;
    right: 4px;
    top: 4px;
    position: absolute;
    display: inline;
  }
  :global(.picker-active) .calendar-icon {
    opacity: 0.75;
    filter: sepia(0.5);
  }
</style>
