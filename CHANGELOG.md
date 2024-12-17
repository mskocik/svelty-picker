## 6.1

- breaking: parameters passed to `actionRow` are now object for easier usage
- feat: add `children` slot
- feat: add `.picker-active` class to main component wrapper for easier styling of `children` when popup visible

## 6.0

- breaking: svelte 5 only
- breaking: remove `initialDate` property in favor of function bindings (https://svelte.dev/docs/svelte/bind#Function-bindings)
- breaking: fix wrapper class names typos: `std-component-wrap` to `sdt-component-wrap` and `std-calendar-wrap` to `sdt-calendar-wrap`
- breaking: event emitting logic (on every change there is event emitted, if it's not desired, disable autocommit)
