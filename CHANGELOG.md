## v6.0

- breaking: svelte 5 only
- breaking: remove `initialDate` property in favor of function bindings (https://svelte.dev/docs/svelte/bind#Function-bindings)
- breaking: fix wrapper class names typos: `std-component-wrap` to `sdt-component-wrap` and `std-calendar-wrap` to `sdt-calendar-wrap`
- breaking: event emitting logic (on every change there is event emitted, if it's not desired, disable autocommit)
