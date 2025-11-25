import type { Session } from 'better-auth'
import type { InferRequestType, InferResponseType } from 'hono'
import { GET_DAILY_REPORT_DATES_CACHE_KEY } from '~/constants/cache-keys'
import { upfetch } from '~/lib/fetcher'
import { createQueryFactory } from '~/lib/query-factories'
import { client } from '~/lib/rpc'

type ResType = InferResponseType<(typeof client.api.dailies.dates)['$get'], 200>

async function getDailyReportDates(
  userId: Session['userId'],
  params: InferRequestType<typeof client.api.dailies.dates.$get>,
) {
  const url = client.api.dailies.dates.$url()

  const res = await upfetch<ResType>(url, {
    headers: {
      Authorization: userId,
    },
    params: {
      year: params.query.year.toString(),
      month: params.query.month.toString(),
      ...(params.query.excludeReportId && { excludeReportId: params.query.excludeReportId }),
    },
  })

  return res
}

export const fetchDailyReportDatesQuery = createQueryFactory<
  ResType,
  unknown,
  [InferRequestType<typeof client.api.dailies.dates.$get>, Session['userId']]
>(
  (params: InferRequestType<typeof client.api.dailies.dates.$get>, userId: Session['userId']) => [
    GET_DAILY_REPORT_DATES_CACHE_KEY,
    params.query.year,
    params.query.month,
    userId,
    params.query.excludeReportId ?? null,
  ],
  (params: InferRequestType<typeof client.api.dailies.dates.$get>, userId: Session['userId']) =>
    getDailyReportDates(userId, params),
)
