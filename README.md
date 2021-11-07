# Simple date-picker

Simple date-picker implemented in svelte. Designed to be replacement of bootstrap-datepicker

### Options

| Property     | Type         | Default       | Description |
|--------------|--------------|---------------| ------------------|
| name         | `string`     | `date`        | input name property for underlying `<input>` element |
| value        | `string`     | `null`        | string representation of selected value |
| initialDate  | `Date`       | `null`        | initial date object, if you prefer that to `value` |
| startDate    | `string|Date`| `null`        | limit minimal selectable date |
| endDate      | `string|Date`| `null`        | limit maximal selectable date |
| mode         | `string`     | `auto`        | restrict picker's mode. Possible values: `auto|date|datetime|time`. By default it try to guess the mode from `format` |
| format       | `string`     | `yyyy-mm-dd`  | Format of entered date/time |
| i18n         | `object`     | `en`          | localization object, english is by default |
| weekStart    | `number`     | `1`           | number in range `0-6` to select first day of the week. Sunday is `0` |
| pickerOnly   | `bool`       | `false`       | Picker is always visible and input field is then hidden, but still present |
| visible      | `bool`       | `false`       | Whether place picker inline after focus. By default picker is floating
| autoclose    | `bool`       | `true`        | Hides picker after selection is done. If mode includes _time picker_, it closes automatically only after minute selection |
| todayBtn     | `bool`       | `true`        | Show today button |
| clearBtn     | `bool`       | `true`        | Show clear button |
| required     | `bool`       | `false`       | Renders `<input>`'s `required parameter |
| inputClasses | `string`     | ``            | input css class string |
| positionFn   | `function`   | _`internal`_  | function used to position picker. Used as action. Acceps following object: `{ inputEl, visible}`, where `visible` is `visible` parameter & `inputEl` is underlying `<input>` element |

### Events

Component emits following events: `input`, `change`, `blur`.

### Localization

Localization file has following structure.

```js
export const en = {
  days:        ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  daysShort:   ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  daysMin:     ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
  months:      ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  meridiem:    ['am', 'pm'],
  suffix:      ['st', 'nd', 'rd', 'th'],
  todayBtn:    'Today',
  clearBtn:    'Clear',
  timeView:    'Show time view',
  backToDate:  'Back to calendar view'
}
```
PRs for extending built in localization are welcome 🥳
