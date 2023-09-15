
import { MODE_YEAR, MODE_DECADE } from "./constants.js";
import { getDaysInMonth } from "./dateUtils.js";

/**
 * @typedef {object} Dataset
 * @property {any[][]} grid
 * @property {Date[][]} days
 * @property {string[][]} months
 * @property {number[][]} years
 * @property {number[]} selectionMark
 * @property {number} todayMark
 * @property {number} prevTo
 * @property {number} nextFrom
 *
 * @typedef {import("$lib/i18n").i18nType} i18nType
 */

/**
 * Compute view grid content based on given 'currentView' property
 *
 * @param {Date} currentDate
 * @param {Date[]} selectedDates
 * @param {number} view
 * @param {i18nType} locale
 * @param {number} weekStart
 * @returns {Dataset}
 */
export function compute(currentDate, selectedDates, view, locale, weekStart) {

  /** ************************************ MODE_DECADE: */
  /** ************************************ years 4 x 3 */
  if (view === MODE_DECADE) {
    let prevTo = 10;  // base is year 2000
    let nextFrom = 20;
    const todayMark = -1;
    const grid = [];
    let yearRow = [];
    let currYear = currentDate.getFullYear() - (currentDate.getFullYear() % 10);
    currYear -= (currYear % 20 ? 12 : 10);
    if (currYear % 10) {  // if start is 10
      prevTo = 12;
      nextFrom = 22;
    }
    for (let i = 0; i < 32; i++) {
      yearRow.push(currYear + i);
      if (yearRow.length === 4) {
        grid.push(yearRow);
        yearRow = [];
      }
    }
    /** @var number[] */
    let selectionMark = [];
    if (!selectedDates[0]) {
      selectedDates[0] = new Date();
    }
    if (selectedDates[0].getFullYear() >= currYear) {
      selectionMark.push(selectedDates[0].getFullYear() % currYear);
    }

    // @ts-ignore
    return {
      years: grid, todayMark, nextFrom, prevTo, selectionMark
    }
  }

  /** ************************************ MODE_YEAR: */
  /** ************************************ months 4 x 3 */
  if (view === MODE_YEAR) {
    let grid = [];
    let monthRow = [];
    let prevTo = 12;
    let nextFrom = 24;
    const ISO = currentDate.toISOString().split('T')[0].substring(0, 8);
    const dateNormalized = new Date(ISO + '01 00:00:00');
    const initYear = dateNormalized.getFullYear() - 1;
    dateNormalized.setFullYear(initYear);
    let todayMark = 0;
    for (let y = 0; y < 3; y++) {
      for (let i = 0; i < 12; i++) {
        dateNormalized.setMonth(i);
        monthRow.push(locale.monthsShort[i % 12]);
        if (monthRow.length === 4) {
          grid.push(monthRow);
          monthRow = [];
        }
      }
      dateNormalized.setFullYear(dateNormalized.getFullYear() + 1);
    }
    /** @type {number[]} */
    let selectionMark = [];
    if (!selectedDates[0]) {
      selectedDates[0] = new Date();
    }
    if (selectedDates[0].getFullYear() - initYear >= 0 && selectedDates[0].getFullYear() - initYear <= 2) {
      selectionMark.push(selectedDates[0].getMonth() + ((selectedDates[0].getFullYear() - initYear || 0) * 12));
    }
    // @ts-ignore
    return {
      months: grid, todayMark, nextFrom, prevTo, selectionMark
    }
  }

  /** ************************************ MONTH */
  /** ************************************ days 7x6 */
  let d = currentDate || new Date(), // or currently selected date
      y = d.getFullYear(),
      m = d.getMonth(),
      dM = d.getDate(),
      h = d.getHours(),
      today = new Date();
  let prevMonth = new Date(y, m-1, 28, 0, 0, 0, 0),
      day = getDaysInMonth(prevMonth.getFullYear(), prevMonth.getMonth());
  prevMonth.setDate(day);
  prevMonth.setDate(day - (prevMonth.getDay() - weekStart + 7) % 7);

  let nextMonth = new Date(prevMonth);
  nextMonth.setDate(nextMonth.getDate() + 42);
  let nextMonthValue = nextMonth.valueOf();

  let grid = [];
  let dayRow = [];
  let todayMark = -1;
  /** @type {number[]} */
  let selectionMark = [];
  let prevTo = 0;
  let nextFrom = 42;
  let inc = 0;
  while(prevMonth.valueOf() < nextMonthValue) {
    inc++;
    dayRow.push(new Date(prevMonth));
    if (prevMonth.getFullYear() < y || (prevMonth.getFullYear() === y && prevMonth.getMonth() < m)) {
      prevTo = inc;
    } else if (nextFrom === 42 && (prevMonth.getFullYear() > y || (prevMonth.getFullYear() === y && prevMonth.getMonth() > m))) {
      nextFrom = inc - 1;
    }

    prevMonth.setDate(prevMonth.getDate() + 1);


    if (prevMonth.getFullYear() === today.getFullYear() &&
      prevMonth.getMonth() === today.getMonth() &&
      prevMonth.getDate() === today.getDate()
    ) {
      todayMark = inc;
    }
    if (selectionMark.length !== selectedDates.length) {
      selectedDates.map(s => {
        if (prevMonth.getFullYear() === s.getFullYear()
        && prevMonth.getMonth() === s.getMonth()
        && prevMonth.getDate() === s.getDate()
        )
          selectionMark.push(inc);
      })
    }

    if (dayRow.length === 7) {
      grid.push(dayRow);
      dayRow = [];
    }
  }
  // @ts-ignore
  return {
    grid, days: grid, todayMark, prevTo, nextFrom, selectionMark,
  };
}
