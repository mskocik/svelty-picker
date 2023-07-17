/** @typedef {import("$lib/i18n").i18nType} i18nType */

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
  let useParsedTime;
  if (/^\d{4}\-\d{1,2}\-\d{1,2}$/.test(date)) {
    parsedFormat = formatHelper.parseFormat(commonFormats.date, type);
  } else 
  if (/^\d{4}\-\d{1,2}\-\d{1,2}[T ]\d{1,2}\:\d{1,2}$/.test(date)) {
    parsedFormat = formatHelper.parseFormat(commonFormats.datetime, type);
  } else 
  if (/^\d{4}\-\d{1,2}\-\d{1,2}[T ]\d{1,2}\:\d{1,2}\:\d{1,2}[Z]{0,1}$/.test(date)) {
    parsedFormat = formatHelper.parseFormat(commonFormats.datetime_s, type);
  } else
  // specific case when parsing time without 'nonPunctuation' ref #102
  if (/^([01]*\d|2[0-3])([0-5]\d)(?:[ ]([ap][m]|[AP][M]))?$/.test(date)) {
    useParsedTime = date.match(/^([01]*\d|2[0-3])([0-5]\d)(?:[ ]([ap][m]|[AP][M]))?$/)?.slice(1).filter(e => e);
    parsedFormat = formatHelper.parseFormat(format, type);

  } else {
    parsedFormat = formatHelper.parseFormat(format, type);
  }
  const parts = useParsedTime
    ? useParsedTime
    : (date && date.toString().match(formatHelper.nonpunctuation) || []);
  date = new Date();  // reset date
  date.setHours(0,0,0,0);
  /** @type {Record<string, any>} */
  const parsed = {};
  const { setters_order, setters_map } = formatHelper.setters(type);
  let val, part;
  if (parts.length !== parsedFormat.parts.length && parsedFormat.parts.includes('S')) { // specific suffix parsing from string like '14th'
    const splitSuffix = parts[parsedFormat.parts.indexOf('S') - 1].match(/(\d+)([a-zA-Z]+)/)?.slice(1,3);
    // @ts-ignore
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
 * @returns {string} date' string representation
 */
export function formatDate(date, format, i18n, type) {
  if (date === null) {
    return '';
  }
  const dateVal = date.getDate();
  /** @type {Record<string, any>} */
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
      t: getDaysInMonth(date.getFullYear(), date.getMonth()),
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
  const pFormat = formatHelper.parseFormat(format, type);
  for (var i = 0, cnt = pFormat.parts?.length || 0; i < cnt; i++) {
    if (pFormat.separators.length) {
      dateArr.push(pFormat.separators.shift());
    }
    dateArr.push(val[pFormat.parts[i]]);
  }
  if (pFormat.separators.length) {
    dateArr.push(pFormat.separators.shift());
  }
  return dateArr.join('');
}


/**
 * @param {number} year
 * @param {number} month
 * @returns {number}
 */
export function getDaysInMonth(year, month) {
  const isLeapYear = (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
  return [31, (isLeapYear ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month]
}

/**
 * Date comparison a < b
 * 
 * @param {Date|string} a 
 * @param {Date} b 
 * @returns 
 */
export function isLower(a, b) {
  if (!(a instanceof Date)) return false;
  return a.getFullYear() < b.getFullYear()
    || (a.getMonth() < b.getMonth() || a.getDate() < b.getDate());
}

/**
 * Date comparison a > b
 * 
 * @param {Date|string} a 
 * @param {Date} b 
 * @returns 
 */
export function isGreater(a, b) {
  if (!(a instanceof Date)) return false;
  return a.getFullYear() > b.getFullYear()
    || (a.getMonth() > b.getMonth() || a.getDate() > b.getDate());
}

/**
 * @callback MapperFunction
 * @param {Date} d date
 * @param {number} v value to be set according to format 
 * @returns void
 * 
 * @typedef {Record<string, MapperFunction>} SetterMap
 */

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
    parts = format.match(this.validParts(type)) || [];
    if (!separators || !separators.length || !parts || parts.length === 0) {
      // throw new Error('Invalid date format.');
      console.warn('invalid date format', separators, parts);
    }
    return {separators: separators, parts: parts};
  },
  /**
   * @param {string} type 
   * @returns {{setters_map: SetterMap, setters_order: string[]}}
   */
  setters: function(type) {
    /** @type {string[]} */
    let setters_order
    /** @type {SetterMap} */
    let setters_map = {};
    if (type === 'standard') {
      setters_order = ['yyyy', 'yy', 'm', 'mm', 'M', 'MM','d', 'dd', 'D','DD', 'hh', 'h', 'HH', 'H', 'ii', 'i', 'ss', 's', 'S', 'p', 'P', 't'];
      setters_map = {
        hh: (d, v) => d.setHours(v),
        h: (d, v) => d.setHours(v),
        HH: (d, v) =>  d.setHours(v === 12 ? 0 : v),
        H: (d, v) => d.setHours(v === 12 ? 0 : v),
        i: (d, v) => d.setMinutes(v),
        s: (d, v) => d.setSeconds(v),
        yyyy: (d, v) => d.setFullYear(v),
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
        p: (d, v) => d.setHours(v === 1 && d.getHours() < 12 ? d.getHours() + 12 : d.getHours()),
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
        n: (d, v) => d.setMonth(v - 1),
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