import { createSearchParamsCache, parseAsNumberLiteral } from 'nuqs/server'
import { getWeeksByMonth } from '~/features/reports/weekly/utils/date-utils'

const months = getWeeksByMonth().map(({ month }) => month)

export const monthSelectSearchParamsParsers = {
  month: parseAsNumberLiteral(months).withDefault(months[0]),
}

export const monthSelectSearchParamsCache = createSearchParamsCache(monthSelectSearchParamsParsers)
