export const MODE_DECADE = 0;
export const MODE_YEAR = 1;
export const MODE_MONTH = 2;

export function compute(currentDate, selectedDate, view, locale, weekStart) {
  // years 4 x 3
  if (view === MODE_DECADE) {
    const nextFrom = 12;
    const prevTo = 1;
    const todayMark = -1;
    const grid = [];
    let yearRow = [];
    let currYear = currentDate.getUTCFullYear() - (currentDate.getUTCFullYear() % 10) - 1;
    for (let i = 0; i < 12; i++) {
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
    if (selectedDate.getUTCFullYear() >= currYear) {
      selectionMark = selectedDate.getUTCFullYear() % currYear;
    }

    return {
      grid, todayMark, nextFrom, prevTo, selectionMark
    }
  }

  // months 4 x 3
  if (view === MODE_YEAR) {
    let grid = [];
    let monthRow = [];
    let prevTo = 0;
    let nextFrom = 12;
    const ISO = currentDate.toISOString().split('T')[0].substring(0, 8);
    const dateNormalized = new Date(ISO + '01 00:00:00');
    let todayMark = 0;
    for (let i = 0; i < 12; i++) {
      dateNormalized.setUTCMonth(i);
      monthRow.push(locale.monthsShort[i]);
      if (monthRow.length === 4) {
        grid.push(monthRow);
        monthRow = [];
      }
    }
    let selectionMark = null;
    if (!selectedDate) {
      selectedDate = new Date();
    }
    if (selectedDate.getUTCFullYear() === currentDate.getUTCFullYear()) {
      selectionMark = selectedDate.getUTCMonth();
    }

    return {
      grid, todayMark, nextFrom, prevTo, selectionMark
    }
  } 

  // days 7x6
  let d = currentDate || new Date(), // or currently selected date
      y = d.getUTCFullYear(),
      m = d.getUTCMonth(),
      dM = d.getUTCDate(),
      h = d.getUTCHours(),
      today = new Date();
  let prevMonth = UTCDate(y, m-1, 28, 0, 0, 0, 0),
      day = utils.getDaysInMonth(prevMonth.getUTCFullYear(), prevMonth.getUTCMonth());
  
  prevMonth.setUTCDate(day);
  prevMonth.setUTCDate(day - (prevMonth.getUTCDay() - weekStart + 7) % 7);

  let nextMonth = new Date(prevMonth);
  nextMonth.setUTCDate(nextMonth.getUTCDate() + 42);
  let nextMonthValue = nextMonth.valueOf();

  let grid = [];
  let dayRow = [];
  let todayMark = -1;
  let selectionMark = null;
  let prevTo = 0;
  let nextFrom = 42;

  let inc = 0;
  console.log('SELECTED', selectedDate);
  while(prevMonth.valueOf() < nextMonthValue) {
    inc++;
    dayRow.push(new Date(prevMonth));
    if (prevMonth.getUTCFullYear() < y || (prevMonth.getUTCFullYear() === y && prevMonth.getUTCMonth() < m)) {
      prevTo = inc;
    } else if (nextFrom === 42 && (prevMonth.getUTCFullYear() > y || (prevMonth.getUTCFullYear() === y && prevMonth.getUTCMonth() > m))) {
      nextFrom = inc - 1;
    }

    prevMonth.setUTCDate(prevMonth.getUTCDate() + 1);


    if (prevMonth.getUTCFullYear() === today.getUTCFullYear() &&
      prevMonth.getUTCMonth() === today.getUTCMonth() &&
      prevMonth.getUTCDate() === today.getUTCDate()
    ) {
      todayMark = inc;
    }
    if (!selectionMark && selectedDate
      && prevMonth.getUTCFullYear() === selectedDate.getUTCFullYear()
      && prevMonth.getUTCMonth() === selectedDate.getUTCMonth()
      && prevMonth.getUTCDate() === selectedDate.getUTCDate()
    ) {
      selectionMark = inc;
      console.log('s', selectionMark);
    }
    
    if (dayRow.length === 7) {
      grid.push(dayRow);
      dayRow = [];
    }
  }
  return { grid, todayMark, prevTo, nextFrom, selectionMark };
}

export function moveGrid(newPos, view) {
  if (view === MODE_MONTH) {
    if (newPos < 0) {
      newPos = 42 + newPos;
    }
    return {
      x: newPos % 7,
      y: Math.floor(newPos / 7)
    }
  }
}

const utils = {
  isLeapYear:       function (year) {
    return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0))
  },
  getDaysInMonth:   function (year, month) {
    return [31, (utils.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month]
  },
}

export function UTCDate() {
  return new Date(Date.UTC.apply(Date, arguments));
}

export function parseDate(date, format, i18n, type) {
  if (date instanceof Date) {
    const dateUTC = new Date(date.valueOf() - date.getTimezoneOffset() * 60000);
    dateUTC.setMilliseconds(0);
    return dateUTC;
  }
  if (/^\d{4}\-\d{1,2}\-\d{1,2}$/.test(date)) {
    format = formatHelper.parseFormat('yyyy-mm-dd', type);
  } else 
  if (/^\d{4}\-\d{1,2}\-\d{1,2}[T ]\d{1,2}\:\d{1,2}$/.test(date)) {
    format = formatHelper.parseFormat('yyyy-mm-dd hh:ii', type);
  } else 
  if (/^\d{4}\-\d{1,2}\-\d{1,2}[T ]\d{1,2}\:\d{1,2}\:\d{1,2}[Z]{0,1}$/.test(date)) {
    format = formatHelper.parseFormat('yyyy-mm-dd hh:ii:ss', type);
  } else {
    format = formatHelper.parseFormat(format, type);
  }
  var parts = date && date.toString().match(formatHelper.nonpunctuation) || [],
    date = new Date(0, 0, 0, 0, 0, 0, 0),
    parsed = {},
    setters_order = ['hh', 'h', 'ii', 'i', 'ss', 's', 'yyyy', 'yy', 'M', 'MM', 'm', 'mm', 'D', 'DD', 'd', 'dd', 'H', 'HH', 'p', 'P', 'z', 'Z'],
    setters_map = {
      hh:   function (d, v) {
        return d.setUTCHours(v);
      },
      h:    function (d, v) {
        return d.setUTCHours(v);
      },
      HH:   function (d, v) {
        return d.setUTCHours(v === 12 ? 0 : v);
      },
      H:    function (d, v) {
        return d.setUTCHours(v === 12 ? 0 : v);
      },
      ii:   function (d, v) {
        return d.setUTCMinutes(v);
      },
      i:    function (d, v) {
        return d.setUTCMinutes(v);
      },
      ss:   function (d, v) {
        return d.setUTCSeconds(v);
      },
      s:    function (d, v) {
        return d.setUTCSeconds(v);
      },
      yyyy: function (d, v) {
        return d.setUTCFullYear(v);
      },
      yy:   function (d, v) {
        return d.setUTCFullYear(2000 + v);
      },
      m:    function (d, v) {
        v -= 1;
        while (v < 0) v += 12;
        v %= 12;
        d.setUTCMonth(v);
        while (d.getUTCMonth() !== v)
          if (isNaN(d.getUTCMonth()))
            return d;
          else
            d.setUTCDate(d.getUTCDate() - 1);
        return d;
      },
      d:    function (d, v) {
        return d.setUTCDate(v);
      },
      p:    function (d, v) {
        return d.setUTCHours(v === 1 ? d.getUTCHours() + 12 : d.getUTCHours());
      }
    },
    val, filtered, part;
  setters_map['M'] = setters_map['MM'] = setters_map['mm'] = setters_map['m'];
  setters_map['dd'] = setters_map['d'];
  setters_map['P'] = setters_map['p'];
  date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), date.getUTCHours(), date.getUTCMinutes(), date.getSeconds());
  if (parts.length === format.parts.length) {
    console.log('parts', parts);
    for (var i = 0, cnt = format.parts.length; i < cnt; i++) {
      console.log(parts[i]);
      val = parseInt(parts[i], 10);
      part = format.parts[i];
      if (isNaN(val)) {
        switch (part) {
          case 'MM':
            val = i18n.months.indexOf(filtered[0]) + 1;
            break;
          case 'M':
            val= i18n.monthsShort.indexOf(val) + 1;
            break;
          case 'p':
          case 'P':
            console.log(val);
            val = i18n.meridiem.indexOf(parts[i].toLowerCase());
            break;
        }
      }
      parsed[part] = val;
    }
    for (var i = 0, s; i < setters_order.length; i++) {
      s = setters_order[i];
      if (s in parsed && !isNaN(parsed[s]))
        setters_map[s](date, parsed[s])
    }
  }
  return date;
}

export function formatDate(date, format, i18n, type) {
  if (date === null) {
    return '';
  }
  var val;
  if (type === 'standard') {
    val = {
      t:    date.getTime(),
      // year
      yy:   date.getUTCFullYear().toString().substring(2),
      yyyy: date.getUTCFullYear(),
      // month
      m:    date.getUTCMonth() + 1,
      M:    i18n.monthsShort[date.getUTCMonth()],
      MM:   i18n.months[date.getUTCMonth()],
      // day
      d:    date.getUTCDate(),
      D:    i18n.daysShort[date.getUTCDay()],
      DD:   i18n.days[date.getUTCDay()],
      p:    (i18n.meridiem.length === 2 ? i18n.meridiem[date.getUTCHours() < 12 ? 0 : 1] : ''),
      // hour
      h:    date.getUTCHours(),
      // minute
      i:    date.getUTCMinutes(),
      // second
      s:    date.getUTCSeconds(),
      // timezone
      z:    date.toLocaleDateString(undefined, {day:'2-digit',timeZoneName: 'long' }).substring(4)
    };

    if (i18n.meridiem.length === 2) {
      val.H = (val.h % 12 === 0 ? 12 : val.h % 12);
    }
    else {
      val.H = val.h;
    }
    val.HH = (val.H < 10 ? '0' : '') + val.H;
    val.P = val.p.toUpperCase();
    val.Z = val.z;
    val.hh = (val.h < 10 ? '0' : '') + val.h;
    val.ii = (val.i < 10 ? '0' : '') + val.i;
    val.ss = (val.s < 10 ? '0' : '') + val.s;
    val.dd = (val.d < 10 ? '0' : '') + val.d;
    val.mm = (val.m < 10 ? '0' : '') + val.m;
  } else if (type === 'php') {
    // php format
    val = {
      // year
      y: date.getUTCFullYear().toString().substring(2),
      Y: date.getUTCFullYear(),
      // month
      F: i18n.months[date.getUTCMonth()],
      M: i18n.monthsShort[date.getUTCMonth()],
      n: date.getUTCMonth() + 1,
      t: utils.getDaysInMonth(date.getUTCFullYear(), date.getUTCMonth()),
      // day
      j: date.getUTCDate(),
      l: i18n.days[date.getUTCDay()],
      D: i18n.daysShort[date.getUTCDay()],
      w: date.getUTCDay(), // 0 -> 6
      N: (date.getUTCDay() === 0 ? 7 : date.getUTCDay()),       // 1 -> 7
      S: (date.getUTCDate() % 10 <= i18n.suffix.length ? i18n.suffix[date.getUTCDate() % 10 - 1] : ''),
      // hour
      a: (i18n.meridiem.length === 2 ? i18n.meridiem[date.getUTCHours() < 12 ? 0 : 1] : ''),
      g: (date.getUTCHours() % 12 === 0 ? 12 : date.getUTCHours() % 12),
      G: date.getUTCHours(),
      // minute
      i: date.getUTCMinutes(),
      // second
      s: date.getUTCSeconds()
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
  validParts: function (type) {
    if (type === 'standard') {
      return /t|hh?|HH?|p|P|z|Z|ii?|ss?|dd?|DD?|mm?|MM?|yy(?:yy)?/g;
    } else if (type === 'php') {
      return /[dDjlNwzFmMnStyYaABgGhHis]/g;
    } else {
      throw new Error('Invalid format type.');
    }
  },
  nonpunctuation: /[^ -\/:-@\[-`{-~\t\n\rTZ]+/g,
  parseFormat: function (format, type) {
      // IE treats \0 as a string end in inputs (truncating the value),
      // so it's a bad format delimiter, anyway
    var separators = format.replace(this.validParts(type), '\0').split('\0'),
    parts = format.match(this.validParts(type));
    if (!separators || !separators.length || !parts || parts.length === 0) {
      throw new Error('Invalid date format.');
    }
    return {separators: separators, parts: parts};
  },
}