# Migration from v5

Version 6 requires at least `svelte@5`.

Main point of version 6 was to align with svelte 5. So deprecated features in svelte 5 were removed completely and replaced accordingly.
Therefore amount of BC breaks is minimal.

## Slots

Slots were removed in favour of snippets. Slot `inputs` has been removed completely with no replacement. New snippet
`actionRow` has extended parameters to be fully compatible with default implementation. See [Snippets](/snippets) for
more details.

## Properties

### `initialDate`

Since svelte 5.9 where function bindings became available, this property has no meaning. Function bindings are more
powerful, allowing things like binding to `Date` object directly and handle timezones as well.

```svelte
<SveltyPicker bind:value intialDate={myDate} {...otherProps} />  // [!code --]
<SveltyPicker bind:value {...otherProps} />  // [!code ++]
```

[Function bindings example](https://svelte.dev/playground/1ddd82f573b94201b3c8fcab33bf0a46?version=5.9.0)

## Events

Due to deprecation of `createEventDispatcher` all events has been replaced by event callback properties.

```svelte
<SveltyPicker on:change={fetchEventHandler} /> // [!code --]
<SveltyPicker onChange={fetchEventHandler} /> // [!code ++]
```
This is the event to prop mapping list:

- `change` changed to `onChange`
- `dateChange` changed to `onDateChange`
- `focus` changed to `onBlur`
- `input` changed to `onInput`
- `blur` changed to `onBlur`

Visit [Properties](/properties#event-callback-props) for more details.

## Event dispatching

During migration to rune mode logic behind triggering event callback properties has been reworked completely and _regressed_
back as it was before version 4.

What it means is that if you have `datetime` picker, `onChange` callback will be called 3 times, once on `date`, `hour` and `minute` event.
If you need to check for specific event, you have 2 options:

- use `onDateChange` event callback. It passes which event `type` triggered the callback
- use picker with `autocommit=false`

## CSS update

Last occurrences of `std-` class prefix fixed, namely `std-component-wrap` and `std-calendar-wrap` has been renamed.
