import type { Session } from 'better-auth'
import type { InferSelectModel } from 'drizzle-orm'
import type { InferResponseType } from 'hono'
import { API_LIMITS } from '~/constants/api-limits'
import { GET_WEEKLY_REPORTS_CACHE_KEY } from '~/constants/cache-keys'
import type { users } from '~/db/schema'
import { upfetch } from '~/lib/fetcher'
import { createInfiniteQueryFactory } from '~/lib/query-factories'
import { client } from '~/lib/rpc'

type ResType = InferResponseType<typeof client.api.weeklies.$get, 200>

export async function getWeeklyReports(
  userId: Session['userId'],
  params: Record<'year' | 'week', number>,
  offset: number,
) {
  const url = client.api.weeklies.$url()

  const res = await upfetch<ResType>(url, {
    headers: {
      Authorization: userId,
    },
    params: {
      ...params,
      offset,
    },
  })

  return res
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
    return lastPage.reports.length === API_LIMITS.WEEKLY_REPORTS
      ? allPages.length * API_LIMITS.WEEKLY_REPORTS
      : undefined
  },
  0,
)
