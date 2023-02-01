// @ts-nocheck

export const MODE_DECADE = 0;
export const MODE_YEAR = 1;
export const MODE_MONTH = 2;

/**
 * 
 * @param {Date} currentDate 
 * @param {Date|null} selectedDate 
 * @param {number} view 
 * @param {i18nType} locale 
 * @param {number} weekStart 
 * @returns {datasetType}
 */
export function compute(currentDate, selectedDate, view, locale, weekStart) {
  // years 4 x 3
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
    let selectionMark = null;
    if (!selectedDate) {
      selectedDate = new Date();
    }
    if (selectedDate.getFullYear() >= currYear) {
      selectionMark = selectedDate.getFullYear() % currYear;
    }
    return {
      years: grid, todayMark, nextFrom, prevTo, selectionMark
    }
  }

  // months 4 x 3
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
    let selectionMark = null;
    if (!selectedDate) {
      selectedDate = new Date();
    }
    if (selectedDate.getFullYear() - initYear >= 0 && selectedDate.getFullYear() - initYear <= 2) {
      selectionMark = selectedDate.getMonth() + ((selectedDate.getFullYear() - initYear || 0) * 12);
    }
    return {
      months: grid, todayMark, nextFrom, prevTo, selectionMark
    }
  } 

  // days 7x6
  let d = currentDate || new Date(), // or currently selected date
      y = d.getFullYear(),
      m = d.getMonth(),
      dM = d.getDate(),
      h = d.getHours(),
      today = new Date();
  let prevMonth = new Date(y, m-1, 28, 0, 0, 0, 0),
      day = utils.getDaysInMonth(prevMonth.getFullYear(), prevMonth.getMonth());
  prevMonth.setDate(day);
  prevMonth.setDate(day - (prevMonth.getDay() - weekStart + 7) % 7);

  let nextMonth = new Date(prevMonth);
  nextMonth.setDate(nextMonth.getDate() + 42);
  let nextMonthValue = nextMonth.valueOf();

  let grid = [];
  let dayRow = [];
  let todayMark = -1;
  let selectionMark = null;
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
    if (!selectionMark && selectedDate
      && prevMonth.getFullYear() === selectedDate.getFullYear()
      && prevMonth.getMonth() === selectedDate.getMonth()
      && prevMonth.getDate() === selectedDate.getDate()
    ) {
      selectionMark = inc;
    }
    
    if (dayRow.length === 7) {
      grid.push(dayRow);
      dayRow = [];
    }
  }
  return {
    grid, todayMark, prevTo, nextFrom, selectionMark
  };
}

/**
 * 
 * @param {number} newPos 
 * @param {number} view 
 * @returns {GridPosition}
 */
export function moveGrid(newPos, view) {
  if (newPos < 0) {
    newPos = 42 + newPos;
  }
  return {
    x: newPos % 7,
    y: Math.floor(newPos / 7)
  }
}

const utils = {
  isLeapYear: function (/** @type {number} */ year) {
    return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0))
  },
  getDaysInMonth: function (/** @type {number} */year, /** @type {number} */month) {
    return [31, (utils.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month]
  },
}
export function isLower(/** @type {Date|string} */ a, /** @type {Date} */b) {
  if (!(a instanceof Date)) return false;
  return a.getFullYear() < b.getFullYear()
    || (a.getMonth() < b.getMonth() || a.getDate() <= b.getDate());
}

export function isGreater(/** @type {Date|string} */a, /** @type {Date} */b) {
  if (!(a instanceof Date)) return false;
  return a.getFullYear() > b.getFullYear()
    || (a.getMonth() > b.getMonth() || a.getDate() >= b.getDate());
  
}

/**
 * 
 * @param {Date|string} date 
 * @param {string} format 
 * @param {i18nType} i18n 
 * @param {string} type 
 * @returns 
 */
export function parseDate(date, format, i18n, type) {
  if (date instanceof Date) {
    return date;
    // const dateUTC = new Date(date.valueOf() + date.getTimezoneOffset() * 60000);
    // dateUTC.setMilliseconds(0);
    // return dateUTC;
  }
  const commonFormats = type === 'php'
    ? { date: 'Y-m-d', datetime: 'Y-m-d H:i', datetime_s: 'Y-m-d H:i:s' }
    : { date: 'yyyy-mm-dd', datetime: 'yyyy-mm-dd hh:ii', datetime_s: 'yyyy-mm-dd hh:ii:ss' };
  /** @var {{ separators: string[], parts: string[]}} */
  let parsedFormat;
  if (/^\d{4}\-\d{1,2}\-\d{1,2}$/.test(date)) {
    parsedFormat = formatHelper.parseFormat(commonFormats.date, type);
  } else 
  if (/^\d{4}\-\d{1,2}\-\d{1,2}[T ]\d{1,2}\:\d{1,2}$/.test(date)) {
    parsedFormat = formatHelper.parseFormat(commonFormats.datetime, type);
  } else 
  if (/^\d{4}\-\d{1,2}\-\d{1,2}[T ]\d{1,2}\:\d{1,2}\:\d{1,2}[Z]{0,1}$/.test(date)) {
    parsedFormat = formatHelper.parseFormat(commonFormats.datetime_s, type);
  } else {
    parsedFormat = formatHelper.parseFormat(format, type);
  }
  const parts = date && date.toString().match(formatHelper.nonpunctuation) || [];
  date = new Date();  // reset date
  date.setHours(0,0,0,0);
  const parsed = {};
  const { setters_order, setters_map } = formatHelper.setters(type);
  let val, part;
  if (parts.length !== parsedFormat.parts.length && parsedFormat.parts.includes('S')) { // specific suffix parsing from string like '14th'
    const splitSuffix = parts[parsedFormat.parts.indexOf('S') - 1].match(/(\d+)([a-zA-Z]+)/).slice(1,3);
    parts.splice(parsedFormat.parts.indexOf('S') - 1, 1, ...splitSuffix);
  }
  if (parts.length === parsedFormat.parts.length) {
    for (var i = 0, cnt = parsedFormat.parts.length; i < cnt; i++) {
      val = parseInt(parts[i], 10);
      part = parsedFormat.parts[i];
      if (isNaN(val)) {
        if (type === 'standard') {
          switch (part) {
            case 'MM':
              val = i18n.months.indexOf(parts[i]) + 1;
              break;
            case 'M':
              val= i18n.monthsShort.indexOf(parts[i]) + 1;
              break;
            case 'p':
            case 'P':
              val = i18n.meridiem.indexOf(parts[i].toLowerCase());
            break;
          }
        } else {
          // php
          switch (part) {
            case 'D':
              val = i18n.daysShort.indexOf(parts[i]) + 1;
              break;
            case 'l':
              val = i18n.days.indexOf(parts[i]) + 1;
              break;
            case 'F':
              val = i18n.months.indexOf(parts[i]) + 1;
              break;
            case 'M':
              val= i18n.monthsShort.indexOf(parts[i]) + 1;
              break;
            case 'a':
            case 'A':
              val = i18n.meridiem.indexOf(parts[i].toLowerCase());
            break;
          }
        }
      }
      parsed[part] = val;
    }
    for (var i = 0, s; i < setters_order.length; i++) {
      s = setters_order[i];
      if (s in parsed && !isNaN(parsed[s]))
        setters_map[`${s}`] && setters_map[`${s}`](date, parsed[s])
    }
  }
  return date;
}

/**
 * @param {Date} date 
 * @param {string} format 
 * @param {i18nType} i18n 
 * @param {string} type 
 * @returns {string}
 */
export function formatDate(date, format, i18n, type) {
  if (date === null) {
    return '';
  }
  const dateVal = date.getDate();
  let val;
  if (type === 'standard') {
    val = {
      t:    date.getTime(),
      // year
      yy:   date.getFullYear().toString().substring(2),
      yyyy: date.getFullYear(),
      // month
      m:    date.getMonth() + 1,
      M:    i18n.monthsShort[date.getMonth()],
      MM:   i18n.months[date.getMonth()],
      // day
      d:    dateVal,
      D:    i18n.daysShort[date.getDay()],
      DD:   i18n.days[date.getDay()],
      S:    (dateVal % 10 && dateVal % 10 <= i18n.suffix.length ? i18n.suffix[dateVal % 10 - 1] : i18n.suffix[i18n.suffix.length -1 ]),
      p:    (i18n.meridiem.length === 2 ? i18n.meridiem[date.getHours() < 12 ? 0 : 1] : ''),
      // hour
      h:    date.getHours(),
      // minute
      ii:    (date.getMinutes() < 10 ? '0' : '') + date.getMinutes(),
      // second
      ss:    (date.getUTCSeconds() < 10 ? '0' : '') + date.getUTCSeconds()
    };

    if (i18n.meridiem.length === 2) {
      val.H = (val.h % 12 === 0 ? 12 : val.h % 12);
    }
    else {
      val.H = val.h;
    }
    val.HH = (val.H < 10 ? '0' : '') + val.H;
    val.P = val.p.toUpperCase();
    val.hh = (val.h < 10 ? '0' : '') + val.h;
    val.i = val.ii;
    val.s = val.ss;
    val.dd = (val.d < 10 ? '0' : '') + val.d;
    val.mm = (val.m < 10 ? '0' : '') + val.m;
  } else if (type === 'php') {
    // php format
    val = {
      // year
      y: date.getFullYear().toString().substring(2),
      Y: date.getFullYear(),
      // month
      F: i18n.months[date.getMonth()],
      M: i18n.monthsShort[date.getMonth()],
      n: date.getMonth() + 1,
      t: utils.getDaysInMonth(date.getFullYear(), date.getMonth()),
      // day
      j: date.getDate(),
      l: i18n.days[date.getDay()],
      D: i18n.daysShort[date.getDay()],
      w: date.getDay(), // 0 -> 6
      N: (date.getDay() === 0 ? 7 : date.getDay()),       // 1 -> 7
      S:    (dateVal % 10 && dateVal % 10 <= i18n.suffix.length ? i18n.suffix[dateVal % 10 - 1] : i18n.suffix[i18n.suffix.length -1 ]),
      // hour
      a: (i18n.meridiem.length === 2 ? i18n.meridiem[date.getHours() < 12 ? 0 : 1] : ''),
      g: (date.getHours() % 12 === 0 ? 12 : date.getHours() % 12),
      G: date.getHours(),
      // minute
      i: date.getMinutes(),
      // second
      s: date.getSeconds(),
      U: Math.floor(date.getTime() / 1000)
    };
    val.m = (val.n < 10 ? '0' : '') + val.n;
    val.d = (val.j < 10 ? '0' : '') + val.j;
    val.A = val.a.toString().toUpperCase();
    val.h = (val.g < 10 ? '0' : '') + val.g;
    val.H = (val.G < 10 ? '0' : '') + val.G;
    val.i = (val.i < 10 ? '0' : '') + val.i;
    val.s = (val.s < 10 ? '0' : '') + val.s;
  } else {
    throw new Error('Invalid format type.');
  }
  let dateArr = [];
  format = formatHelper.parseFormat(format, type);
  for (var i = 0, cnt = format.parts.length; i < cnt; i++) {
    if (format.separators.length) {
      dateArr.push(format.separators.shift());
    }
    dateArr.push(val[format.parts[i]]);
  }
  if (format.separators.length) {
    dateArr.push(format.separators.shift());
  }
  return dateArr.join('');
}

const formatHelper = {
  validParts: function(/** @type {string} */ type) {
    if (type === 'standard') {
      return /t|hh?|HH?|p|P|z|ii?|ss?|dd?|DD?|S|mm?|MM?|yy(?:yy)?/g;
    } else if (type === 'php') {
      return /[dDjlNwzFmMnStyYaABgGhHisU]/g;
    } else {
      throw new Error('Invalid format type.');
    }
  },
  nonpunctuation: /[^ -\/:-@\[-`{-~\t\n\rTZ]+/g,
  /**
   * 
   * @param {string} format 
   * @param {string} type 
   * @returns {{ separators: string[], parts: string[]} }
   */
  parseFormat: function (/** @type {string} */ format, /** @type {string} */ type) {
      // IE treats \0 as a string end in inputs (truncating the value),
      // so it's a bad format delimiter, anyway
    var separators = format.replace(this.validParts(type), '\0').split('\0'),
    parts = format.match(this.validParts(type));
    if (!separators || !separators.length || !parts || parts.length === 0) {
      // throw new Error('Invalid date format.');
      console.warn('invalid date format', separators, parts);
      parts = [];
    }
    return {separators: separators, parts: parts};
  },
  /**
   * @param {string} type 
   * @returns {{setters_map: object, setters_order: Array<string>}}
   */
  setters: function(type) {
    let setters_order, setters_map;
    if (type === 'standard') {
      setters_order = ['yyyy', 'yy', 'm', 'mm', 'M', 'MM','d', 'dd', 'D','DD', 'hh', 'h', 'HH', 'H', 'ii', 'i', 'ss', 's', 'S', 'p', 'P', 't'];
      setters_map = {
        /** @param {Date} d, @param {number} v */
        hh: (d, v) => d.setHours(v),
        /** @param {Date} d, @param {number} v */
        h: (d, v) => d.setHours(v),
        /** @param {Date} d, @param {number} v */
        HH: (d, v) =>  d.setHours(v === 12 ? 0 : v),
        /** @param {Date} d, @param {number} v */
        H: (d, v) => d.setHours(v === 12 ? 0 : v),
        /** @param {Date} d, @param {number} v */
        i: (d, v) => d.setMinutes(v),
        /** @param {Date} d, @param {number} v */
        s: (d, v) => d.setSeconds(v),
        /** @param {Date} d, @param {number} v */
        yyyy: (d, v) => d.setFullYear(v),
        /** @param {Date} d, @param {number} v */
        yy: (d, v) => d.setFullYear((v < 50 ? 2000 : 1900)  + v),
        /** @param {Date} d, @param {number} v */
        m: (d, v) => {
          v -= 1;
          while (v < 0) v += 12;
          v %= 12;
          d.setMonth(v);
          while (d.getMonth() !== v)
            if (isNaN(d.getMonth()))
              return d;
            else
              d.setDate(d.getDate() - 1);
          return d;
        },
        /** @param {Date} d, @param {number} v */
        d: (d, v) => d.setDate(v),
        /** @param {Date} d, @param {number} v */
        p: (d, v) => d.setHours(v === 1 && d.getHours() < 12 ? d.getHours() + 12 : d.getHours()),
        /** @param {Date} d, @param {number} v */
        t: (d, v) => d.setTime(v),
        mm: ()=>{},
        M: ()=>{},
        MM: ()=>{},
        ii: ()=>{},
        ss: ()=>{},
        dd: ()=>{},
        D: ()=>{},
        DD: ()=>{},
        P: ()=>{}
      };
      setters_map.mm = setters_map.M = setters_map.MM = setters_map.m;
      setters_map.ii = setters_map.i;
      setters_map.ss = setters_map.s;
      setters_map.dd = setters_map.D = setters_map.DD = setters_map.d;
      setters_map.P = setters_map.p;
    } else {
      // php
      setters_order = ['Y','yy','m','M','F','n','d','D','j','l','N','S','H','G','h','g','i','s','p','P','U'];
      setters_map = {
        H: (d, v) => d.setHours(v),
        G: (d, v) => d.setHours(v),
        h: (d, v) =>  d.setHours(v === 12 ? 0 : v),
        g: (d, v) => d.setHours(v === 12 ? 0 : v),
        i: (d, v) => d.setMinutes(v),
        s: (d, v) => d.setSeconds(v),
        Y: (d, v) => d.setFullYear(v),
        yy: (d, v) => d.setFullYear((v < 50 ? 2000 : 1900)  + v),
        m: (d, v) => {
          v -= 1;
          while (v < 0) v += 12;
          v %= 12;
          d.setMonth(v);
          while (d.getMonth() !== v)
            if (isNaN(d.getMonth()))
              return d;
            else
              d.setDate(d.getDate() - 1);
          return d;
        },
        d: (d, v) => d.setDate(v),
        a: (d, v) => d.setHours(v === 1 ? d.getHours() + 12 : d.getHours()),
        U: (d, v) => d.setTime(v * 1000)
      };
      setters_map.F = setters_map.M = setters_map.m;
      setters_map.D = setters_map.j = setters_map.l = setters_map.N = setters_map.d;
      setters_map.A = setters_map.a;
    }
    return { setters_order, setters_map };
  }
}