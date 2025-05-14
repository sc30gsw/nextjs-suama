import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
} from 'nuqs/server'

export const dailyReportForTodaySearchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  userNames: parseAsArrayOf(parseAsString).withDefault([]),
}

export const dailyReportForTodaySearchParamsCache = createSearchParamsCache(
  dailyReportForTodaySearchParamsParsers,
)
