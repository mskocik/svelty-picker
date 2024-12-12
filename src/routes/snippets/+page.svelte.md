# Snippets

There is 1 available snippet `actionRow` to override. Event handlers have prefix `on`.


### Snipett type

```ts
Snippet<[
  autocloseSupported: boolean,
  todayBtnClasses: string,
  clearBtnClasses: string,
  onCancel: function,
  onConfirm: function,
  onClear: function,
  onToday: function,
  isTodayDisabled: boolean,
  i18n: import('$lib/i18n/index.js').i18nType,
  currentMode: string
]>
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
{#snippet action_row(autocloseSupported, todayBtnClasses, clearBtnClasses, onCancel, onConfirm, onClear, onToday, isTodayDisabled, i18n, currentMode)}
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
