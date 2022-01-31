/**
 * Exports for Types
 */
export type Days = 'Sunday'| 'Monday'| 'Tuesday'| 'Wednesday'| 'Thursday'| 'Friday'| 'Saturday'| 'Sunday'
export type DaysShort = 'Sun'| 'Mon'| 'Tue'| 'Wed'| 'Thu'| 'Fri'| 'Sat'| 'Sun'
export type DaysMin = 'Su'| 'Mo'| 'Tu'| 'We'| 'Th'| 'Fr'| 'Sa'| 'Su'
export type Months = 'January'| 'February'| 'March'| 'April'| 'May'| 'June'| 'July'| 'August'| 'September'| 'October'| 'November'| 'December'
export type MonthsShort = 'Jan'| 'Feb'| 'Mar'| 'Apr'| 'May'| 'Jun'| 'Jul'| 'Aug'| 'Sep'| 'Oct'| 'Nov'| 'Dec'
export type Meridiem = 'am'| 'pm'
export type Suffix = 'st'| 'nd'| 'rd'| 'th'
export type TodayBtn = 'Today'
export type ClearBtn = 'Clear'
export type TimeView = 'Show time view'
export type BackToDate = 'Back to calendar view'

/**
 * Exports used for Interfaces
 */
export interface EN {
    days: Days[]
    daysShort: DaysShort[]
    daysMin: DaysMin[]
    months: Months[]
    monthsShort: MonthsShort[]
    meridiem: Meridiem[]
    suffix: Suffix[]
    todayBtn: TodayBtn
    clearBtn: ClearBtn
    timeView: TimeView
    backToDate: BackToDate
}

export interface Settings {
    theme: string,
    mode: string,
    format: string,
    formatType: string,
    weekStart: number,
    visible: boolean,
    inputClasses: null | string,
    todayBtnClasses: string,
    clearBtnClasses: string,
    todayBtn: boolean,
    clearBtn: boolean,
    autoclose: boolean,
    i18n: EN,
}

export interface Page {
    title?: string;
    links: { href: string; text: string }[];
}