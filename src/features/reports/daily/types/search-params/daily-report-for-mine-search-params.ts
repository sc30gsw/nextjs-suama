import { createParser, createSearchParamsCache, parseAsString } from 'nuqs/server'
import { SEPARATOR } from '~/utils/date-utils'

// ? nuqsのparseAsIsoDateは無効値の場合に「2001年」を返すため、作成
const parseAsOptionalIsoDate = createParser({
  parse: (value) => {
    if (!value) {
      return null
    }

    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  },

  serialize: (value) => value?.toISOString().split(SEPARATOR)[0] ?? '',
})

export const dailyReportForMineSearchParamsParsers = {
  startDate: parseAsOptionalIsoDate,
  endDate: parseAsOptionalIsoDate,
}

export const dailyReportForMineSearchParamsCache = createSearchParamsCache(
  dailyReportForMineSearchParamsParsers,
)

export const tabSearchParamsCache = createSearchParamsCache({
  tab: parseAsString.withDefault('date'),
})
