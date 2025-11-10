import { subMonths } from 'date-fns'
import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz'
import { APP_TIMEZONE, DATE_TIME } from '~/constants/date'

export const SEPARATOR = 'T'
export const DATE_FORMAT = 'yyyy-MM-dd'

type DateInput = string | `${string}-${string}-${string}${typeof SEPARATOR}${string}`
type DateType = 'start' | 'end'

export const dateUtils = {
  convertJstDateToUtc: (dateStr: DateInput, type: DateType) => {
    const cleanDateString = dateStr.includes(SEPARATOR) ? dateStr.split(SEPARATOR)[0] : dateStr
    const dateTime = type === 'start' ? DATE_TIME.START : DATE_TIME.END

    return fromZonedTime(`${cleanDateString}${dateTime}`, APP_TIMEZONE)
  },

  formatDateByJST: (date: Date, formatStr = DATE_FORMAT) => {
    return formatInTimeZone(date, APP_TIMEZONE, formatStr)
  },

  getTodayRangeByJST: () => {
    const nowInJST = toZonedTime(new Date(), APP_TIMEZONE)
    const dateString = formatInTimeZone(nowInJST, APP_TIMEZONE, DATE_FORMAT)

    return {
      start: dateUtils.convertJstDateToUtc(dateString, 'start'),
      end: dateUtils.convertJstDateToUtc(dateString, 'end'),
    }
  },

  getOneMonthAgoRangeByJST: () => {
    const nowInJST = new Date()
    const lastMonthJST = subMonths(nowInJST, 1)

    const lastMonthDateStr = dateUtils.formatDateByJST(lastMonthJST, DATE_FORMAT)

    return {
      start: dateUtils.convertJstDateToUtc(lastMonthDateStr, 'start'),
      end: dateUtils.getTodayRangeByJST().end,
    }
  },

  formatDateParamForUrl: (date: Date | null) => {
    if (date instanceof Date) {
      return dateUtils.formatDateByJST(date)
    }

    return date ?? ''
  },
} as const
