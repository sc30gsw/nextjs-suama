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
import { entries, groupBy, map, pipe, range, sortBy } from 'remeda'

export const getWeeksByMonth = () => {
  const now = new Date()
  const currentMonth = getMonth(now) + 1
  const year = getYear(now)
  const totalWeeks = getWeek(now)
  const firstWeekStart = startOfWeek(startOfYear(new Date(year, 0, 1)), {
    weekStartsOn: 1,
  })

  const weekRanges = pipe(
    range(0, totalWeeks + 1),
    map((i) => {
      const startDay = addWeeks(firstWeekStart, i)
      return {
        weekNumber: getWeek(startDay),
        startDay,
        endDay: endOfWeek(startDay, { weekStartsOn: 1 }),
      }
    }),
    groupBy((week) => getMonth(week.startDay) + 1),
  )

  const monthOrder = [
    ...range(1, currentMonth + 1).reverse(),
    12,
  ] as const satisfies readonly number[]

  return pipe(
    weekRanges,
    entries(),
    map(([monthStr, weeks]) => ({
      month: Number(monthStr),
      year,
      weeks,
    })),
    sortBy((entry) => {
      const index = monthOrder.indexOf(entry.month)
      return index === -1 ? Number.POSITIVE_INFINITY : index
    }),
  )
}

export function splitDates(dates: string) {
  const [startDate, endDate] = dates.split('-').reduce((acc, val, i) => {
    if (i % 3 === 0) {
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
  const nextStart = addWeeks(parseISO(start), 1)
  const nextEnd = addWeeks(parseISO(end), 1)

  return {
    nextStartDate: format(nextStart, 'yyyy-MM-dd'),
    nextEndDate: format(nextEnd, 'yyyy-MM-dd'),
  } as const
}

export function getYearAndWeek(dateStr: string) {
  const date = parseISO(dateStr)

  const week = getWeek(date, { weekStartsOn: 1 })
  const year = getYear(date)

  return { year, week } as const
}
