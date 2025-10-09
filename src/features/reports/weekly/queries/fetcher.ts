import type { InferResponseType } from 'hono'
import { WEEKLY_REPORTS_LIMIT } from '~/constants'
import { GET_WEEKLY_REPORTS_CACHE_KEY } from '~/constants/cache-keys'
import { upfetch } from '~/lib/fetcher'
import { createInfiniteQueryFactory } from '~/lib/query-factories'
import { client } from '~/lib/rpc'

type ResType = InferResponseType<typeof client.api.weeklies.$get, 200>

export async function getWeeklyReports(
  params: Record<'year' | 'week', number>,
  offset: number,
  userId?: string,
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
  [Record<'year' | 'week', number>, string | undefined],
  number
>(
  // keyFn
  (params: Record<'year' | 'week', number>, userId?: string) => [
    GET_WEEKLY_REPORTS_CACHE_KEY,
    params,
    userId,
  ],
  (offset: number, params: Record<'year' | 'week', number>, userId?: string) =>
    getWeeklyReports(params, offset, userId),
  (lastPage, allPages) => {
    return lastPage.reports.length === WEEKLY_REPORTS_LIMIT
      ? allPages.length * WEEKLY_REPORTS_LIMIT
      : undefined
  },
  0,
)
