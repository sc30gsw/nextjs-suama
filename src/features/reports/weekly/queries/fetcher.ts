import type { Session } from 'better-auth'
import type { InferSelectModel } from 'drizzle-orm'
import { QUERY_MAX_LIMIT_VALUES } from '~/constants'
import { GET_WEEKLY_REPORTS_CACHE_KEY } from '~/constants/cache-keys'
import type { users } from '~/db/schema'
import { createInfiniteQueryFactory } from '~/lib/query-factories'
import { api } from '~/lib/rpc'
import { WeeklyReportModel } from '~/features/reports/weekly/api/model'

type ResType = WeeklyReportModel.getWeeklyReportsResponse

export async function getWeeklyReports(
  userId: Session['userId'],
  params: Record<'year' | 'week', number>,
  offset: number,
) {
  const res = await api.weeklies.get({
    headers: {
      Authorization: userId,
    },
    query: {
      year: params.year.toString(),
      week: params.week.toString(),
      offset: offset.toString(),
    },
  })

  if (!res.data) {
    throw new Error('Failed to fetch weekly reports')
  }

  return res.data
}

export const fetchWeeklyReportsInfiniteQuery = createInfiniteQueryFactory<
  ResType,
  unknown,
  [Record<'year' | 'week', number>, InferSelectModel<typeof users>['id']],
  number
>(
  (params: Record<'year' | 'week', number>, userId: InferSelectModel<typeof users>['id']) => [
    GET_WEEKLY_REPORTS_CACHE_KEY,
    params,
    userId,
  ],
  (offset: number, params: Record<'year' | 'week', number>, userId: Session['userId']) =>
    getWeeklyReports(userId, params, offset),
  (lastPage, allPages) => {
    return lastPage.reports.length === QUERY_MAX_LIMIT_VALUES.WEEKLY_REPORTS
      ? allPages.length * QUERY_MAX_LIMIT_VALUES.WEEKLY_REPORTS
      : undefined
  },
  0,
)
