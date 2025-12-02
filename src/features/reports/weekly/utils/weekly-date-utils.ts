import {
  addWeeks,
  endOfWeek,
  format,
  getMonth,
  getWeek,
  getYear,
  parseISO,
  startOfWeek,
  startOfYear,
} from 'date-fns'
import { ja } from 'date-fns/locale'
import { entries, filter, groupBy, map, pipe, range, sortBy } from 'remeda'
import { DATE_FORMAT } from '~/utils/date-utils'

const WEEK_CONFIG = {
  STARTS_ON: 1,
  ADD_COUNT: 1,
} as const satisfies Record<string, number>

const MONTH_CONFIG = {
  INDEX: {
    JANUARY: 0,
    DECEMBER: 11,
  },
  VALUE: {
    DECEMBER: 12,
  },
  OFFSET: 1,
} as const satisfies Record<string, number | Record<string, number>>

export const DECEMBER = MONTH_CONFIG.VALUE.DECEMBER

const DATE_CONFIG = {
  START: 1,
  DECEMBER_LAST_DAY: 31,
  SPLIT_MODULO: 3,
} as const satisfies Record<string, number>

const RANGE_CONFIG = {
  START: 0,
  END_OFFSET: 1,
} as const satisfies Record<string, number>

const YEAR_DECREMENT = 1

const INDEX_NOT_FOUND = -1

const SORT_CONFIG = {
  POSITIVE_INFINITY: Number.POSITIVE_INFINITY,
  NEGATIVE_INFINITY: Number.NEGATIVE_INFINITY,
} as const satisfies Record<string, number>

export const getWeeksByMonth = () => {
  const now = new Date()
  const currentMonth = getMonth(now) + MONTH_CONFIG.OFFSET
  const year = getYear(now)
  const totalWeeks = getWeek(now)
  const firstWeekStart = startOfWeek(
    startOfYear(new Date(year, MONTH_CONFIG.INDEX.JANUARY, DATE_CONFIG.START)),
    {
      weekStartsOn: WEEK_CONFIG.STARTS_ON,
    },
  )

  const currentYearWeekRanges = pipe(
    range(RANGE_CONFIG.START, totalWeeks + RANGE_CONFIG.END_OFFSET),
    map((i) => {
      const startDay = addWeeks(firstWeekStart, i)
      return {
        weekNumber: getWeek(startDay),
        startDay,
        endDay: endOfWeek(startDay, { weekStartsOn: WEEK_CONFIG.STARTS_ON }),
      }
    }),
    groupBy((week) => `${getYear(week.startDay)}-${getMonth(week.startDay) + MONTH_CONFIG.OFFSET}`),
  )

  // 最初の週が前年を含むかどうかを判定
  const firstWeekYear = getYear(firstWeekStart)
  const needsPrevYear = firstWeekYear < year

  let allWeekRanges = { ...currentYearWeekRanges }

  if (needsPrevYear) {
    const prevYear = year - YEAR_DECREMENT
    const prevYearFirstWeekStart = startOfWeek(
      startOfYear(new Date(prevYear, MONTH_CONFIG.INDEX.JANUARY, DATE_CONFIG.START)),
      {
        weekStartsOn: WEEK_CONFIG.STARTS_ON,
      },
    )
    const prevYearTotalWeeks = getWeek(
      new Date(prevYear, MONTH_CONFIG.INDEX.DECEMBER, DATE_CONFIG.DECEMBER_LAST_DAY),
    )

    const prevYearWeekRanges = pipe(
      range(RANGE_CONFIG.START, prevYearTotalWeeks + RANGE_CONFIG.END_OFFSET),
      map((i) => {
        const startDay = addWeeks(prevYearFirstWeekStart, i)
        return {
          weekNumber: getWeek(startDay),
          startDay,
          endDay: endOfWeek(startDay, { weekStartsOn: WEEK_CONFIG.STARTS_ON }),
        }
      }),
      // 12月の週のみをフィルタ
      filter((week) => getMonth(week.startDay) + MONTH_CONFIG.OFFSET === DECEMBER),
      groupBy(
        (week) => `${getYear(week.startDay)}-${getMonth(week.startDay) + MONTH_CONFIG.OFFSET}`,
      ),
    )

    allWeekRanges = { ...prevYearWeekRanges, ...allWeekRanges }
  }

  const monthOrder = [
    ...range(MONTH_CONFIG.OFFSET, currentMonth + MONTH_CONFIG.OFFSET).reverse(),
    DECEMBER,
  ] as const satisfies readonly number[]

  return pipe(
    allWeekRanges,
    entries(),
    map(([yearMonthStr, weeks]) => {
      const [yearStr, monthStr] = yearMonthStr.split('-')
      return {
        month: Number(monthStr),
        year: Number(yearStr),
        weeks,
      }
    }),
    sortBy((entry) => {
      if (entry.year !== year) {
        return entry.year < year ? SORT_CONFIG.POSITIVE_INFINITY : SORT_CONFIG.NEGATIVE_INFINITY
      }

      const index = monthOrder.indexOf(entry.month)
      return index === INDEX_NOT_FOUND ? SORT_CONFIG.POSITIVE_INFINITY : index
    }),
  )
}

export function splitDates(dates: string) {
  const [startDate, endDate] = dates.split('-').reduce((acc, val, i) => {
    if (i % DATE_CONFIG.SPLIT_MODULO === 0) {
      acc.push(val)
    } else {
      acc[acc.length - 1] += `-${val}`
    }
    return acc
  }, [] as string[])

  return {
    startDate,
    endDate,
  } as const
}

export function getNextWeekDates(start: string, end: string) {
  const nextStart = addWeeks(parseISO(start), WEEK_CONFIG.ADD_COUNT)
  const nextEnd = addWeeks(parseISO(end), WEEK_CONFIG.ADD_COUNT)

  return {
    nextStartDate: format(nextStart, DATE_FORMAT),
    nextEndDate: format(nextEnd, DATE_FORMAT),
  } as const
}

export function getYearAndWeek(dateStr: string) {
  const date = parseISO(dateStr)

  const week = getWeek(date, { weekStartsOn: WEEK_CONFIG.STARTS_ON })
  const year = getYear(date)

  return { year, week } as const
}

export function formatDateRange(startDate: string, endDate: string): string {
  const start = parseISO(startDate)
  const end = parseISO(endDate)
  const startYear = getYear(start)
  const endYear = getYear(end)

  if (startYear === endYear) {
    return `${format(start, 'M月d日', { locale: ja })} 〜 ${format(end, 'M月d日', { locale: ja })}`
  } else {
    return `${format(start, 'yyyy年M月d日', { locale: ja })} 〜 ${format(end, 'yyyy年M月d日', { locale: ja })}`
  }
}

export function getWeekRangeFromDate(date: Date) {
  const weekStart = startOfWeek(date, { weekStartsOn: WEEK_CONFIG.STARTS_ON })
  const weekEnd = endOfWeek(date, { weekStartsOn: WEEK_CONFIG.STARTS_ON })

  return {
    startDate: format(weekStart, DATE_FORMAT),
    endDate: format(weekEnd, DATE_FORMAT),
  } as const
}
