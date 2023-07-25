# 📆 Svelty Picker [![NPM version](https://img.shields.io/npm/v/svelty-picker.svg?style=flat)](https://www.npmjs.org/package/svelty-picker)

Simple date & time picker implemented in svelte. 

Features: 
- date/time/datetime/range picker mode
- various formatting options
- keyboard navigation
- replacable slots 
- themable
- customizable disabled dates
<!-- - validator action for `<input>` using `svelte-use-forms` (optional) -->
- custom element

## ⚙️ Install

```js
npm install svelty-picker
```

## Property list

| Property        | Type          | Default       | Description |
|-----------------|---------------|---------------|-------------------|
| name            | `string`      | `'date'`        | html attribute for underlying `<input>` element  |
| disabled        | `bool`        | `false`       | html attribute for underlying `<input>` element  |
| placeholder     | `string`      | `null`        | html attribute for underlying `<input>` element  |
| required        | `bool`        | `false`       | html attribute for underlying `<input>` element  |
| value           | `string`      | `null`        | string representation of selected value |
| initialDate     | `Date`        | `null`        | initial date object, if you prefer that to `value` |
| startDate       | <code>string\|Date</code>| `null`        | limit minimal selectable date |
| endDate         | <code>string\|Date</code>| `null`        | limit maximal selectable date |
| startView       | `number`      | `2`           | Which mode should picker at, `0` - decade, `1` - year, `2` - month (default), `3` - time picker
| pickerOnly      | `bool`        | `false`       | Picker is always visible and input field is then hidden, but still present |
| theme           | `string`      | `'sdt-calendar-colors'` | css class defining [css variables](#css-variables) |
| mode            | `string`      | `auto`        | restrict picker's mode. Possible values: `auto\|date\|datetime\|time`. By default it try to guess the mode from `format` |
| format          | `string`      | `'yyyy-mm-dd'`  | Format of entered date/time. See [format settings](#format-settings) for available options |
| minuteIncrement | `number`      | `1`           | number in range `1-60` to set the increment of minutes choosable |
| weekStart       | `number`      | `1`           | number in range `0-6` to select first day of the week. Sunday is `0` |
| inputId         | `string`      | `""`            | id attribute for input element
| inputClasses    | `string`      | `""`            | input css class string |
| todayBtnClasses | `string`      | `'sdt-action-btn sdt-today-btn'` | today button css classes |
| clearBtnClasses | `string`      | `'sdt-action-btn sdt-clear-btn'` | clear button css classes |
| todayBtn        | `bool`        | `true`        | Show today button |
| clearBtn        | `bool`        | `true`        | Show clear button |
| clearToggle     | `bool`        | `true`        | Allows to clear selected date when clicking on the same date when in `mode='date'` or `mode='auto'` resolving to `'date'` |
| autoclose       | `bool`        | `true`        | Hides picker after selection is done. If mode includes _time picker_, it closes automatically only after minute selection |
| i18n            | `object`      | `en`          | localization object, english is by default |
| validatorAction | `array`       | `null`        | Bind validator action for inner `<input>` element. Designed to be used with `svelte-use-form`.

### Documentation

For more details check the [documentation](https://mskocik.github.io/svelty-picker/)

## 🏆 Thanks to:

- [Bootstrap datepicker](https://github.com/smalot/bootstrap-datetimepicker/blob/master/js/bootstrap-datetimepicker.js) for some internal date and format handling

## Licence

MIT