import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsString,
} from 'nuqs/server'

export const dailyReportForTodaySearchParamsParsers = {
  userNames: parseAsArrayOf(parseAsString).withDefault([]),
}

export const dailyReportForTodaySearchParamsCache = createSearchParamsCache(
  dailyReportForTodaySearchParamsParsers,
)
