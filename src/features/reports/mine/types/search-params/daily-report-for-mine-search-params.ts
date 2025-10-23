import { createParser, createSearchParamsCache, parseAsStringLiteral } from 'nuqs/server'
import { DAILY_REPORT_MINE_TABS } from '~/constants'
import { paginationSearchParamsParsers } from '~/types/search-params/pagination-search-params-cache'
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

export const tabParser = parseAsStringLiteral(
  DAILY_REPORT_MINE_TABS.map((tab) => tab.id),
).withDefault(DAILY_REPORT_MINE_TABS[0].id)

export const dailyReportForMineSearchParamsParsers = {
  startDate: parseAsOptionalIsoDate,
  endDate: parseAsOptionalIsoDate,
  tab: tabParser,
}

export const minePageSearchParamsCache = createSearchParamsCache({
  ...dailyReportForMineSearchParamsParsers,
  ...paginationSearchParamsParsers,
})
