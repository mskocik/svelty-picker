# Theme

Component exposes following CSS variables to customize it's appearance as you can see through whole in example below or on the homepage.

```css
:root {
  /* general */
  --sdt-bg-main: #fff; /** wrap background color */
  --sdt-shadow-color: #ccc; /** wrap shadow color */
  --sdt-wrap-shadow: 0 1px 6px var(--sdt-shadow-color); /** wrap shadow settings */
  --sdt-radius: 4px; /** wrap radius */
  --sdt-color: #000; /** data to select(e.g date/time) text color (except header & buttons) */
  --sdt-color-selected: #fff; /** selected data(e.g date/time) text color */
  --sdt-header-color: #000; /** header items color (e.g. text & buttons) */
  --sdt-header-btn-bg-hover: #dfdfdf; /** header items hover background color */
  --sdt-bg-selected: #286090; /** selected data(e.g date/time) background color */

  /* action buttons */
  --sdt-today-bg: #1e486d; /** date picker today button hover background color */
  --sdt-today-color: var(--sdt-bg-main); /** date picker today button text & border color */
  --sdt-clear-color: #dc3545; /** clear button text & border color */
  --sdt-clear-bg: transparent; /** clear button background color */
  --sdt-clear-hover-color: var(--sdt-bg-main); /** clear button hover text color */
  --sdt-clear-hover-bg: #dc3545; /** clear button hover background color */

  /* time picker */
  --sdt-clock-selected-bg: var(--sdt-bg-selected); /** selected time background color */
  --sdt-clock-bg: #eeeded; /** time picker inner circle background color */
  --sdt-clock-color: var(--sdt-color); /** time picker text color (watch "--sdt-color") */
  --sdt-clock-color-hover: var(--sdt-color); /** time picker hover text color (watch "--sdt-color") */
  --sdt-clock-time-bg: transparent; /** time picker time background color */
  --sdt-clock-time-bg-hover: transparent; /** time picker time selection hover background color */
  --sdt-clock-disabled-time: #b22222; /** disabled time picker time text color */
  --sdt-clock-disabled-time-bg: #eee; /** disabled time picker time background color */

  /* date picker */
  --sdt-table-selected-bg: var(--sdt-bg-selected); /** selected date background color */
  --sdt-table-disabled-date: #b22222; /** disabled dates text color */
  --sdt-table-disabled-date-bg: #eee; /** disabled dates background color */
  --sdt-table-bg: transparent; /** date picker inner table background color */
  --sdt-table-data-bg-hover: #eee; /** table selection data hover background color */
  --sdt-table-today-indicator: #ccc; /** date picker current day marker color */

}
```

### Definitions from this website

```html
<style>
  :global(.dark) {
    --sdt-bg-main: #585858;
    --sdt-shadow-color: #777;
    --sdt-color: #eee;
    --sdt-clock-color: var(--sdt-color);
    --sdt-clock-color-hover: var(--sdt-color);
    --sdt-clock-time-bg: transparent;
    --sdt-clock-time-bg-hover: transparent;
    --sdt-clock-disabled: #b22222;
    --sdt-clock-disabled-bg: var(--sdt-bg-main);
    --sdt-clock-selected-bg: var(--sdt-bg-selected);
    --sdt-header-color: #eee;
    --sdt-bg-selected: #e1ac4a;
    --sdt-table-disabled-date: #b22222;
    --sdt-table-disabled-date-bg: var(--sdt-bg-main);
    --sdt-table-data-bg-hover: #777;
    --sdt-table-selected-bg: var(--sdt-bg-selected);
    --sdt-header-btn-bg-hover: #777;
    --sdt-color-selected: #fff;
    --sdt-table-today-indicator: #ccc;
    --sdt-clock-bg: #999;
    /* custom buttons */
    --sdt-today-bg: #e4a124;
    --sdt-today-color: #fff;
    --sdt-clear-color: #666;
    --sdt-clear-bg: #ddd;
    --sdt-clear-hover-color: #fff;
    --sdt-clear-hover-bg: #dc3545;
  }
  :global(.light) {
    --sdt-bg-main: #fff;
    --sdt-shadow-color: #ccc;
    --sdt-color: inherit;
    --sdt-clock-color: var(--sdt-color);
    --sdt-clock-color-hover: var(--sdt-color);
    --sdt-clock-time-bg: transparent;
    --sdt-clock-time-bg-hover: transparent;
    --sdt-clock-disabled: #b22222;
    --sdt-clock-disabled-bg: var(--sdt-bg-main);
    --sdt-clock-selected-bg: var(--sdt-bg-selected);
    --sdt-bg-selected: #286090;
    --sdt-table-disabled-date: #b22222;
    --sdt-table-disabled-date-bg: var(--sdt-bg-main);
    --sdt-table-data-bg-hover: #eee;
    --sdt-table-selected-bg: var(--sdt-bg-selected);
    --sdt-header-btn-bg-hover: #dfdfdf;
    --sdt-color-selected: #fff;
    --sdt-table-today-indicator: #ccc;
    --sdt-clock-bg: #eeeded;
    /* custom buttons */
    --sdt-today-bg: #1e486d;
    --sdt-today-color: #fff;
    --sdt-clear-color: #dc3545;
    --sdt-clear-bg: #fff;
    --sdt-clear-hover-color: #fff;
    --sdt-clear-hover-bg: #dc3545;
  }
</style>
```
