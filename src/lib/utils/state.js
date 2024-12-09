import { formatDate, parseDate } from "./dateUtils.js";

/**
 * @typedef {object} ValueInit
 * @property {string[]} iValues
 * @property {?string} iValueCombined
 * @property {Date[]} iDates
 */

/**
 * Init internal props
 *
 * @param {string|string[]|null} value
 * @param {string} format
 * @param {import("$lib/i18n/index.js").i18nType} i18n
 * @param {string} formatType
 * @returns {ValueInit}
 */
export function initProps(value, format, i18n, formatType) {
  /** @type {string[]} */
  let valueArray = value
    ? (Array.isArray(value)
      ? value
      : value.split(',')  // for range we can get combined string
    )
    : [];

  // strip seconds if present in initial value
  valueArray = valueArray.map(value => value.replace(/(:\d+).*/, "$1"));

  return {
    iValues: valueArray,
    iValueCombined: valueArray.length ? valueArray.join() : null,
    iDates: valueArray.map(val => parseDate(val, format, i18n, formatType)),
  }
}

/**
 * FUTURE: test that this works for PHP format type as well
 *
 * @param {'auto'|'date'|'datetime'|'time'} mode
 * @param {string} format
 * @returns {'date'|'datetime'|'time'}
 */
export function computeResolvedMode(mode, format) {
  return mode === "auto"
    ? format.match(/g|hh?|ii?/i) && format.match(/y|m|d/i)
      ? "datetime"
      : format.match(/g|hh?|ii?/i)
      ? "time"
      : "date"
    : mode;
}
