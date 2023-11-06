| Property        | Type                        | Default           | Description |
|-----------------|-----------------------------|-------------------|-------------------|
| inputId         | `string`                    | `""`              | id attribute for input element
| name            | `string`                    | `'date'`          | html attribute for underlying `<input>` element  |
| disabled        | `bool`                      | `false`           | html attribute for underlying `<input>` element  |
| placeholder     | `string`                    | `null`            | html attribute for underlying `<input>` element  |
| required        | `bool`                      | `false`           | html attribute for underlying `<input>` element  |
| value           | <code>string\|string[]</code>| `null`           | string representation of selected value. When in daterange mode (`isRange` prop), array of two strings is required |
| initialDate     | <code>Date\|Date[]</code>   | `null`            | initial date object, if you prefer that to `value`. When in daterange mode (`isRange` prop), array of two `Date` is required  |
| isRange         | `bool`                      | `false`           | enables range picker mode  |
| startDate       | <code>string\|Date</code>   | `null`            | limit minimal selectable date |
| endDate         | <code>string\|Date</code>   | `null`            | limit maximal selectable date |
| pickerOnly      | `bool`                      | `false`           | Picker is always visible and input field is then hidden, but still present |
| startView       | `number`                    | `2`               | Which mode should picker at, `0` - decade, `1` - year, `2` - month (default), `3` - time picker
| mode            | `string`                    | `auto`            | restrict picker's mode. Possible values: `auto\|date\|datetime\|time`. By default it try to guess the mode from `format` |
| disableDatesFn  | `function`                  | `null`            | Function whether passed date should be disabled or not |
| manualInput     | `bool`                      | `false`           | Whether manual date entry is allowed |
| format          | `string`                    | `'yyyy-mm-dd'`    | Format of entered date/time.  |
| formatType      | `string`                    | `'standard'`      | Format type (`standard` or `php`) |
| displayFormat          | `string`             | `null`            | Display format of entered date/time.  |
| displayFormatType      | `string`             | `null`            | Display format type (`standard` or `php`) |
| hourOnly        | `bool`                      | `false`           | Only allow hour selection for the time portion of the datetime selection
| minuteIncrement | `number`                    | `1`               | number in range `1-60` to set the increment of minutes choosable |
| weekStart       | `number`                    | `1`               | number in range `0-6` to select first day of the week. Sunday is `0` |
| inputClasses    | `string`                    | `""`              | input css class string |
| todayBtnClasses | `string`                    | `'sdt-action-btn sdt-today-btn'` | today button css classes |
| clearBtnClasses | `string`                    | `'sdt-action-btn sdt-clear-btn'` | clear button css classes |
| todayBtn        | `bool`                      | `true`            | Show today button |
| clearBtn        | `bool`                      | `true`            | Show clear button |
| clearToggle     | `bool`                      | `true`            | Allows to clear selected date when clicking on the same date when in `mode='date'` or `mode='auto'` resolving to `'date'` |
| autocommit      | `bool`                      | `true`            | Whether date/time selection is automatic or manual |
| i18n            | `object`                    | `en`              | localization object, english is by default |
| validatorAction | `array`                     | `null`            | Bind validator action for inner `<input>` element. Designed to be used with `svelte-use-form`.
| positionResolver | `function`                 | internal          | Action which resolves floating position of picker. Default one uses `@floating-ui` under the hood. So you can use this library for your custom position resolver function
