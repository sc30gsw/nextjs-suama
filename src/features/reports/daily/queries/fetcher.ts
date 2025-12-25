import type { Session } from 'better-auth'
import { GET_DAILY_REPORT_DATES_CACHE_KEY } from '~/constants/cache-keys'
import { createQueryFactory } from '~/lib/query-factories'
import { api } from '~/lib/rpc'
import { DailyReportModel } from '~/features/reports/daily/api/model'

type ResType = DailyReportModel.getDailyReportDatesResponse

type DatesQueryParams = {
  query: {
    year: string
    month: string
    excludeReportId?: string
  }
}

async function getDailyReportDates(
  userId: Session['userId'],
  params: DatesQueryParams,
) {
  const res = await api.dailies.dates.get({
    headers: {
      Authorization: userId,
    },
    query: {
      year: params.query.year.toString(),
      month: params.query.month.toString(),
      excludeReportId: params.query.excludeReportId,
    },
  })

  if (!res.data) {
    throw new Error('Failed to fetch daily report dates')
  }

  return res.data
}

export const fetchDailyReportDatesQuery = createQueryFactory<
  ResType,
  unknown,
  [DatesQueryParams, Session['userId']]
>(
  (params: DatesQueryParams, userId: Session['userId']) => [
    GET_DAILY_REPORT_DATES_CACHE_KEY,
    params.query.year,
    params.query.month,
    userId,
    params.query.excludeReportId ?? null,
  ],
  (params: DatesQueryParams, userId: Session['userId']) =>
    getDailyReportDates(userId, params),
)
