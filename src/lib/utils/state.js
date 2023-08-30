import { formatDate, parseDate } from "./dateUtils.js";

/**
 * @typedef {object} ValueInit
 * @property {string[]} valueArray
 * @property {string[]} prevValue
 * @property {Date[]} innerDates
 */

/**
 * Init internal props
 * 
 * @param {string|string[]|null} value 
 * @param {Date|Date[]|null} initialDate 
 * @param {string} format
 * @param {import("$lib/i18n").i18nType} i18n
 * @param {string} formatType
 * @returns {ValueInit}
 */
export function initProps(value, initialDate, format, i18n, formatType) {
  /** @type string[] */
  let valueArray = value ? (Array.isArray(value) ? value : value.split(',')) : [];

  // strip seconds if present in initial value
  valueArray = valueArray.map(value => value.replace(/(:\d+):\d+/, "$1"));

  /** @type string[] */
  let prevValue = valueArray;

  let innerDates = !initialDate
    ? prevValue.map(val => parseDate(val, format, i18n, formatType))
    : (Array.isArray(initialDate)
      ? initialDate
      : [initialDate]
    );

  if (innerDates && initialDate) {
    valueArray = innerDates.map(innerDate => formatDate(innerDate, format, i18n, formatType));
  }

  return {
    valueArray,
    prevValue,
    innerDates,
  }
}

/**
 * FUTURE: test that this works for PHP format type as well
 * 
 * @param {'auto'|'date'|'datetime'|'time'} mode 
 * @param {string} format 
 * @returns {'auto'|'date'|'datetime'|'time'}
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