import {
  createParser,
  createSearchParamsCache,
  type ParserBuilder,
  parseAsStringLiteral,
} from 'nuqs/server'
import { DAILY_REPORT_TABS, DAILY_REPORT_TABS_MAP } from '~/constants/tabs'
import { userSearchParamsParsers } from '~/features/users/types/search-params/user-search-params-cache'
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

export const tabParser = parseAsStringLiteral(DAILY_REPORT_TABS.map((tab) => tab.id)).withDefault(
  DAILY_REPORT_TABS_MAP.DATE.id,
)

export const dailyReportSearchParamsParsers = {
  startDate: parseAsOptionalIsoDate,
  endDate: parseAsOptionalIsoDate,
  tab: tabParser,
} as const satisfies Record<
  string,
  | ParserBuilder<Date>
  | Omit<
      ParserBuilder<(typeof DAILY_REPORT_TABS_MAP)[keyof typeof DAILY_REPORT_TABS_MAP]['id']>,
      'parseServerSide'
    >
>

export const dailyReportPageSearchParamsCache = createSearchParamsCache({
  ...dailyReportSearchParamsParsers,
  ...paginationSearchParamsParsers,
  ...userSearchParamsParsers,
})

export const myDailyReportPageSearchParamsCache = createSearchParamsCache({
  ...dailyReportSearchParamsParsers,
  ...paginationSearchParamsParsers,
})
