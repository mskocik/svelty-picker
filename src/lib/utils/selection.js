import { formatDate, parseDate } from "./dateUtils";

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
 * @param {i18nType} i18n
 * @param {string} formatType
 * @returns {ValueInit}
 */
export function initValues(value, initialDate, format, i18n, formatType) {
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
 * @param {Date[]} innerDates
 * @param {string} format
 * @param {i18nType} i18n
 * @param {string} formatType
 * @returns {string}
 */
export function toDisplayValue(innerDates, format, i18n, formatType) {
  return innerDates
    .map(innerDate => formatDate(innerDate, format, i18n, formatType))
    .sort()
    .join(' - ');
}
