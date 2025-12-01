import { getYear } from 'date-fns'
import { createSearchParamsCache, parseAsInteger } from 'nuqs/server'
import { DECEMBER, getWeeksByMonth } from '~/features/reports/weekly/utils/weekly-date-utils'

const weeksByMonth = getWeeksByMonth()
const currentYear = getYear(new Date())

export const monthSelectSearchParamsParsers = {
  month: parseAsInteger.withDefault(weeksByMonth[0]?.month ?? DECEMBER),
  year: parseAsInteger.withDefault(currentYear),
}

export const monthSelectSearchParamsCache = createSearchParamsCache(monthSelectSearchParamsParsers)
