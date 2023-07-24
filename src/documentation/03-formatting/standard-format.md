### Standard format settings:

| Format | Description                                                                      | Example                                
|--------|----------------------------------------------------------------------------------|--------------------------------------
| `d`    | day of the month without leading zeros                                           | 1 to 31
| `dd`   | day of the month, 2 digits with leading zeros                                    | 01 to 31
| `D`    | short textual representation of a weekday (i18n.daysShort)                       | Mon through Sun
| `DD`   | long textual representation of a weekday (i18n.days)                             | Sunday through Saturday
| `S`    | English ordinal suffix for the day of the month, (i18n.suffix)                   | st, nd, rd or th. Works well with `d` 
| `m`    | numeric representation of month without leading zeros                            | 1 to 12
| `mm`   | numeric representation of the month, 2 digits with leading zeros                 | 01 to 12
| `M`    | short textual representation of a month, three letters (i18n.monthsShort)        | Jan through Dec
| `MM`   | full textual representation of a month, such as January or March (i18n.months)   | January through December
| `yy`   | two digit representation of a year                                               | 99 or 03
| `yyyy` | full numeric representation of a year, 4 digits                                  | 1999, 2003
| `h`    | hour without leading zeros - 24-hour format                                      | 0 - 23
| `hh`   | hour, 2 digits with leading zeros - 24-hour format                               | 00 - 23
| `H`    | hour without leading zeros - 12-hour format                                      | 1 - 12
| `HH`   | hour, 2 digits with leading zeros - 12-hour format                               | 01 - 12
| `i`    | minutes, 2 digits with leading zeros                                             | 00 - 59
| `ii`   | alias for `i`                                                                    | 00 - 59
| `s`    | seconds, 2 digits with leading zeros                                             | 00
| `ss`   | alias for `s`                                                                    | 00
| `p`    | meridian in lower case ('am' or 'pm') - according to locale file (i18n.meridiem) | am or pm
| `P`    | meridian in upper case ('AM' or 'PM') - according to locale file (i18n.meridiem) | AM or PM
| `t`    | timestamp in milliseconds (although milliseconds are always 0).  |

☝️ For timestamp in seconds use `php` formatting.