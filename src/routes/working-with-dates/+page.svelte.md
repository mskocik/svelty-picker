# Working with dates

Although library works internally `Date` objects, `value` property must be `string` or `string[]` when in daterange mode.
It makes internal logic simpler and makes library dependency-free.

Since svelte 5.9 you can use [function binding](https://svelte.dev/docs/svelte/bind#Function-bindings) for binding `value` property.
Therefore you can convert your date objects to strings and vice versa. Even handle timezones! There are 2 helper functions
available to help you with these transformations. Library use them internaly to transform to/from specified [formats](/modes-and-formats).


```js
/**
 * String -> date
 *
 * @param {Date|string} date
 * @param {string} format
 * @param {i18nType} i18n
 * @param {string} type
 * @returns {Date}
 */
export function parseDate(date, format, i18n, type) { /* ... */}

/**
 * Date -> string
 *
 * @param {Date} date
 * @param {string} format
 * @param {i18nType} i18n
 * @param {string} type
 * @returns {string}
 */
export function formatDate(date, format, i18n, type) { /* ... */}
```

<blockquote style="background-color: var(--vp-code-bg)">
  <details style="padding: 16px; 0">
    <summary style="margin: 0">Version 5 and below</summary>
    <div class="padding-top: 8px">
      <p>
      In v5 it was possible to set initial date through <code>initialDate</code>, which has been removed in v6.
      </p>
    </div>
  </details>
</blockquote>


