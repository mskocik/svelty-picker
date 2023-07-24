```js
// structure
type Config = {
  theme: string;
  format: string;
  formatType: string;
  displayFormat: string?;
  displayFormatType: string?;
  minuteIncrement: number;
  weekStart: number;
  inputClasses: string;
  todayBtnClasses: string;
  clearBtnClasses: string;
  todayBtn: boolean;
  clearBtn: boolean;
  autocommit: boolean;
  i18n: i18nType;
}
```

```js
// default values
export default {
  theme: 'sdt-calendar-colors',
  format: 'yyyy-mm-dd',
  formatType: 'standard',
  displayFormat: null,
  displayFormatType: null,
  minuteIncrement: 1,
  weekStart: 1,
  inputClasses: '',
  todayBtnClasses: 'sdt-action-btn sdt-today-btn',
  clearBtnClasses: 'sdt-action-btn sdt-clear-btn',
  todayBtn: true,
  clearBtn: true,
  autocommit: true,
  i18n: en
}
```