import { createSearchParamsCache, parseAsIsoDate } from 'nuqs/server'

export const dailyReportForMineSearchParamsParsers = {
  startDate: parseAsIsoDate,
  endDate: parseAsIsoDate,
}

export const dailyReportForMineSearchParamsCache = createSearchParamsCache(
  dailyReportForMineSearchParamsParsers,
)
