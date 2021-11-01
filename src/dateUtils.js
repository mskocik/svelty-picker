export const MODE_DECADE = 0;
export const MODE_YEAR = 1;
export const MODE_MONTH = 2;

export function compute(currentDate, view, locale) {
  // TODO: return dataset based on 'view' prop

  // years 4 x 3
  if (view === MODE_DECADE) {
    console.log('>', 'decade mode', currentDate);
    const nextFrom = 12;
    const prevTo = 1;
    const todayMark = -1;
    const yearGrid = [];
    let yearRow = [];
    let currYear = currentDate.getUTCFullYear() - (currentDate.getUTCFullYear() % 10) - 1;
    for (let i = 0; i < 12; i++) {
      yearRow.push(currYear + i);
      if (yearRow.length === 4) {
        yearGrid.push(yearRow);
        yearRow = [];
      }
    }
    const obj = { yearGrid, todayMark, nextFrom, prevTo}
    return obj;
  }

  // months 4 x 3
  if (view === MODE_YEAR) {
    let monthGrid = [];
    let monthRow = [];
    let prevTo = 0;
    let nextFrom = 12;
    const ISO = currentDate.toISOString().split('T')[0].substring(0, 8);
    const dateNormalized = new Date(ISO + '01 00:00:00');
    // TODO: implement todayMark
    let todayMark = 0;
    for (let i = 0; i < 12; i++) {
      dateNormalized.setUTCMonth(i);
      monthRow.push(locale.monthsShort[i]);
      if (monthRow.length === 4) {
        monthGrid.push(monthRow);
        monthRow = [];
      }
    }

    return {
      monthGrid, todayMark, nextFrom, prevTo
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
  prevMonth.setUTCDate(day - (prevMonth.getUTCDay() - /** this.weekStart */ 1 + 7) % 7);

  let nextMonth = new Date(prevMonth);
  nextMonth.setUTCDate(nextMonth.getUTCDate() + 42);
  let nextMonthValue = nextMonth.valueOf();

  let dayGrid = [];
  let dayRow = [];
  let todayMark = -1;
  let prevTo = 0;
  let nextFrom = 42;

  let inc = 0;
  while(prevMonth.valueOf() < nextMonthValue) {
    inc++;
    dayRow.push(new Date(prevMonth));
    if (prevMonth.getUTCFullYear() < y || (prevMonth.getUTCFullYear() === y && prevMonth.getUTCMonth() < m)) {
      prevTo = inc;
    } else if (nextFrom === 42 && (prevMonth.getUTCFullYear() > y || (prevMonth.getUTCFullYear() === y && prevMonth.getUTCMonth() > m))) {
      nextFrom = inc - 1;
    }

    prevMonth.setUTCDate(prevMonth.getUTCDate() + 1);

    if (prevMonth.getUTCFullYear() === today.getFullYear() &&
      prevMonth.getUTCMonth() === today.getMonth() &&
      prevMonth.getUTCDate() === today.getDate()
    ) {
      // todayMark = dayGrid.length * 7 + dayRow.length;
      todayMark = inc;
    }

    if (dayRow.length === 7) {
      dayGrid.push(dayRow);
      dayRow = [];
    }
  }

  const obj = { dayGrid, todayMark, prevTo, nextFrom };
  console.log(obj);
  return obj;
}

const utils = {
  isLeapYear:       function (year) {
    return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0))
  },
  getDaysInMonth:   function (year, month) {
    return [31, (utils.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month]
  },
}

function UTCDate() {
  return new Date(Date.UTC.apply(Date, arguments));
}