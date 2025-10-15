import type { InferSelectModel } from 'drizzle-orm'
import type { InferResponseType } from 'hono'
import { WEEKLY_REPORTS_LIMIT } from '~/constants'
import { GET_WEEKLY_REPORTS_CACHE_KEY } from '~/constants/cache-keys'
import type { users } from '~/db/schema'
import type { auth } from '~/lib/auth'
import { upfetch } from '~/lib/fetcher'
import { createInfiniteQueryFactory } from '~/lib/query-factories'
import { client } from '~/lib/rpc'

type ResType = InferResponseType<typeof client.api.weeklies.$get, 200>

export async function getWeeklyReports(
  userId: typeof auth.$Infer.Session.user.id,
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
  // keyFn
  (params: Record<'year' | 'week', number>, userId: InferSelectModel<typeof users>['id']) => [
    GET_WEEKLY_REPORTS_CACHE_KEY,
    params,
    userId,
  ],
  (
    offset: number,
    params: Record<'year' | 'week', number>,
    userId: typeof auth.$Infer.Session.user.id,
  ) => getWeeklyReports(userId, params, offset),
  (lastPage, allPages) => {
    return lastPage.reports.length === WEEKLY_REPORTS_LIMIT
      ? allPages.length * WEEKLY_REPORTS_LIMIT
      : undefined
  },
  0,
)
